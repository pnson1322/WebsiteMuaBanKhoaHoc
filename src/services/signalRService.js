import * as signalR from "@microsoft/signalr";

class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnecting = false;
    }

    async startConnection(token) {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            console.log("✅ SignalR already connected");
            return this.connection;
        }

        if (this.isConnecting) {
            console.log("⏳ Connection already in progress");
            return this.connection;
        }

        try {
            this.isConnecting = true;

            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${import.meta.env.VITE_BASE_URL}/notificationHub`, {
                    accessTokenFactory: () => token,
                    transport: signalR.HttpTransportType.WebSockets |
                        signalR.HttpTransportType.ServerSentEvents |
                        signalR.HttpTransportType.LongPolling
                })
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: (retryContext) => {
                        if (retryContext.previousRetryCount === 0) return 0;
                        if (retryContext.previousRetryCount === 1) return 2000;
                        if (retryContext.previousRetryCount === 2) return 10000;
                        return 30000;
                    }
                })
                .configureLogging(signalR.LogLevel.Information)
                .build();

            this.connection.onreconnecting((error) => {
                console.warn("⚠️ SignalR reconnecting...", error?.message);
            });

            this.connection.onreconnected((connectionId) => {
                console.log("✅ SignalR reconnected. ConnectionId:", connectionId);
            });

            this.connection.onclose((error) => {
                console.error("❌ SignalR connection closed", error?.message);
                this.isConnecting = false;
            });

            await this.connection.start();
            console.log("✅ SignalR connected. ConnectionId:", this.connection.connectionId);

            return this.connection;
        } catch (error) {
            console.error("❌ Error starting SignalR:", error);
            this.isConnecting = false;
            throw error;
        } finally {
            this.isConnecting = false;
        }
    }

    async joinSellerGroup(sellerId) {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error("SignalR not connected");
        }

        try {
            await this.connection.invoke("JoinSellerGroup", sellerId);
            console.log(`✅ Joined seller group: seller_${sellerId}`);
        } catch (error) {
            console.error("❌ Error joining seller group:", error);
            throw error;
        }
    }

    async leaveSellerGroup(sellerId) {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            return;
        }

        try {
            await this.connection.invoke("LeaveSellerGroup", sellerId);
            console.log(`✅ Left seller group: seller_${sellerId}`);
        } catch (error) {
            console.error("❌ Error leaving seller group:", error);
        }
    }

    // ⚠️ FIX: Đổi event name từ "ReceiveNotification" thành "receiveNotification"
    onNotificationReceived(callback) {
        if (!this.connection) {
            console.warn("⚠️ Connection not initialized");
            return;
        }

        // SignalR tự động convert PascalCase -> camelCase
        this.connection.on("receiveNotification", (notification) => {
            console.log("🔔 New notification received:", notification);
            callback(notification);
        });
    }

    // ⚠️ FIX: Đổi từ "JoinedGroup" thành "joinedGroup"
    onJoinedGroup(callback) {
        if (!this.connection) return;

        this.connection.on("joinedGroup", (data) => {
            console.log("✅ JoinedGroup event:", data);
            callback(data);
        });
    }

    // ⚠️ FIX: Đổi từ "LeftGroup" thành "leftGroup"
    onLeftGroup(callback) {
        if (!this.connection) return;

        this.connection.on("leftGroup", (data) => {
            console.log("✅ LeftGroup event:", data);
            callback(data);
        });
    }

    async getConnectionInfo() {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error("SignalR not connected");
        }

        try {
            await this.connection.invoke("GetConnectionInfo");
        } catch (error) {
            console.error("❌ Error getting connection info:", error);
            throw error;
        }
    }

    // ⚠️ FIX: Đổi từ "ConnectionInfo" thành "connectionInfo"
    onConnectionInfo(callback) {
        if (!this.connection) return;

        this.connection.on("connectionInfo", (info) => {
            console.log("📊 Connection info:", info);
            callback(info);
        });
    }

    async stopConnection() {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log("✅ SignalR disconnected");
            } catch (error) {
                console.error("❌ Error stopping connection:", error);
            }
            this.connection = null;
        }
    }

    isConnected() {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    getConnectionState() {
        return this.connection?.state || "Disconnected";
    }
}

export default new SignalRService();
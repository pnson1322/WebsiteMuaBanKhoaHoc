// src/contexts/SignalRContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const SignalRContext = createContext(null);

export const useSignalR = () => {
    const context = useContext(SignalRContext);
    if (!context) {
        throw new Error('useSignalR must be used within SignalRProvider');
    }
    return context;
};

export const SignalRProvider = ({ children, apiBaseUrl, token, currentUserId }) => {
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const connectionRef = useRef(null);

    useEffect(() => {
        if (!currentUserId || !apiBaseUrl) {
            console.warn('⚠️ Missing userId or apiBaseUrl');
            return;
        }

        const hubUrl = `${apiBaseUrl}/chathub`;

        const options = {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets,
        };

        if (token && token.trim() !== '') {
            options.accessTokenFactory = () => token;
        }

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, options)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.elapsedMilliseconds < 60000) {
                        return Math.random() * 10000;
                    } else {
                        return null;
                    }
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Event handlers
        newConnection.onreconnecting((error) => {
            console.warn('🔄 SignalR reconnecting...', error);
            setIsConnected(false);
        });

        newConnection.onreconnected((connectionId) => {
            console.log('✅ SignalR reconnected!', connectionId);
            setIsConnected(true);
            setConnectionError(null);
        });

        newConnection.onclose((error) => {
            console.error('❌ SignalR connection closed', error);
            setIsConnected(false);
            if (error) {
                setConnectionError(error.message);
            }
        });

        // Start connection
        newConnection
            .start()
            .then(() => {
                console.log('✅ SignalR Connected');
                setIsConnected(true);
                setConnectionError(null);
                connectionRef.current = newConnection;
                setConnection(newConnection);
            })
            .catch((err) => {
                console.error('❌ SignalR Connection Error:', err);
                setConnectionError(err.message);
            });

        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
            }
        };
    }, [apiBaseUrl, token, currentUserId]);

    const value = {
        connection,
        isConnected,
        connectionError,
    };

    return (
        <SignalRContext.Provider value={value}>
            {children}
        </SignalRContext.Provider>
    );
};
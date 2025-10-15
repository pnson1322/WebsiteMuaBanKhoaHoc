import { useState } from "react"
import { Outlet } from "react-router-dom";

export const Layout = () => {
    const [showChatbot, setShowChatbot] = useState(false);

    return (
        <div className="app">
            <main className="main-content">
                <Outlet/>
            </main>
        </div>
    )
}
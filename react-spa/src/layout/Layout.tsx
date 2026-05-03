// Layout.tsx
import { useEffect, useState } from "react";
import { Outlet, NavLink } from "react-router";

export default function Layout() {
    const useApiHealthy = () => {
        const [apiHealthy, setApiHealthy] = useState(false);

        useEffect(() => {
            updateApiHealth();

            // Set interval to check API connectivity periodically
            const timerID = setInterval(async () => {
                updateApiHealth();
            }, 10 * 1000);

            return () => {
                clearInterval(timerID);
            };
        }, []);

        const updateApiHealth = async () => {
            const ok = await getApiHealth();
            setApiHealthy(ok);
        };

        const getApiHealth = async (): Promise<boolean> => {
            const resp = await fetch("/api/health");
            return resp.ok;
        };

        return apiHealthy;
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-stone-200">
                <div className="max-w-5xl mx-auto px-6 py-2 min-h-14 flex flex-col sm:flex-row items-center justify-between gap-2">
                    {/* Logo / Brand */}
                    <NavLink
                        to="/"
                        className="font-semibold text-stone-800 tracking-tight text-lg hover:text-stone-600 transition-colors"
                    >
                        School Payments Service
                    </NavLink>

                    <div className="flex items-center gap-2">
                        <span>API status</span>
                        {useApiHealthy() ? (
                            <span className="rounded-full w-4 h-4 inline-block bg-green-400"></span>
                        ) : (
                            <span className="rounded-full w-4 h-4 inline-block bg-red-400"></span>
                        )}
                    </div>
                </div>
            </nav>

            {/* Page content */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
                <Outlet />
            </main>
        </div>
    );
}

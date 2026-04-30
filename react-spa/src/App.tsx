import { useEffect, useState } from "react";
import "./App.css";

function App() {
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
        <>
            <div>
                <p>API: {useApiHealthy() ? "happy :)" : "unhappy :("}</p>
            </div>
        </>
    );
}

export default App;

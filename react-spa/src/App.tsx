import { Link } from "react-router";
import "./App.css";
import type { TripsResponseType, TripType } from "./common_types";
import { useEffect, useState } from "react";

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-NZ", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDuration(start: string, end: string) {
    const mins = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function App() {
    const [trips, setTrips] = useState<TripType[]>([]);

    useEffect(() => {
        loadTrips();
    }, []);

    async function loadTrips() {
        const resp = await fetch("/api/trips");
        if (!resp.ok) {
            throw new Response("Failed to load trips", { status: resp.status });
        }
        const json: TripsResponseType = await resp.json();
        setTrips(json.data);
    }

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-stone-800">Trips</h1>
                <p className="text-sm text-stone-500 mt-1">
                    {trips.length} upcoming trips
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {trips.map((trip) => (
                    <Link
                        key={trip.id}
                        to={`/trips/${trip.id}`}
                        className="group bg-white border border-stone-200 rounded-xl px-5 py-4 flex flex-col md:flex-row md:items-center justify-between hover:border-stone-300 hover:shadow-sm transition-all gap-4"
                    >
                        {/* Left: name + school + date */}
                        <div className="flex items-center gap-4 flex-col sm:flex-row">
                            <div className="flex flex-col items-center justify-center bg-stone-100 rounded-lg w-full sm:w-12 h-12 shrink-0">
                                <span className="text-xs font-medium text-stone-500 uppercase leading-none">
                                    {new Date(
                                        trip.start_datetime,
                                    ).toLocaleDateString("en-NZ", {
                                        month: "short",
                                    })}
                                </span>
                                <span className="text-lg font-semibold text-stone-800 leading-none mt-0.5">
                                    {new Date(trip.start_datetime).getDate()}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-stone-800 group-hover:text-stone-600 transition-colors">
                                    {trip.name}
                                </p>
                                <p className="text-sm text-stone-400 mt-0.5 flex flex-col gap-1">
                                    <span>{trip.school.name}</span>
                                    <span>
                                        {formatTime(trip.start_datetime)} -{" "}
                                        {formatTime(trip.end_datetime)}
                                    </span>
                                    <span>
                                        {formatDuration(
                                            trip.start_datetime,
                                            trip.end_datetime,
                                        )}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Right: cost */}
                        <div className="text-right shrink-0 ml-6">
                            <p className="text-sm font-semibold text-stone-700">
                                ${trip.cost.toFixed(2)}
                            </p>
                            <p className="text-xs text-stone-400 mt-0.5">
                                per student
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
}

export default App;

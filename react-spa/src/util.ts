export function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-NZ", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDuration(start: string, end: string) {
    const mins = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

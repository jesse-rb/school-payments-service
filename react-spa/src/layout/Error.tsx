import { useRouteError, isRouteErrorResponse, Link } from "react-router";

export default function ErrorPage() {
    const error = useRouteError();

    const status = isRouteErrorResponse(error) ? error.status : 500;
    const title = status === 404 ? "Page not found" : "Something went wrong";
    const message =
        status === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : "An unexpected error occurred. Try refreshing the page.";

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <p className="text-8xl font-bold text-stone-200 select-none">
                    {status}
                </p>
                <h1 className="mt-2 text-xl font-semibold text-stone-800">
                    {title}
                </h1>
                <p className="mt-2 text-sm text-stone-500">{message}</p>
                <Link
                    to="/"
                    className="mt-6 inline-block px-4 py-2 rounded-md text-sm font-medium bg-stone-800 text-white hover:bg-stone-700 transition-colors"
                >
                    Back to home
                </Link>
            </div>
        </div>
    );
}

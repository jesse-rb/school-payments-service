import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Trip from "./Trip.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "./layout/Layout.tsx";
import ErrorPage from "./layout/Error.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <App />,
            },
            {
                path: "/trips/:id",
                element: <Trip />,
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);

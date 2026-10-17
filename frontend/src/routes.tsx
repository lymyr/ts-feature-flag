import type { RouteObject } from "react-router";
import App from "./pages/App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default [
    {
        path: "/login",
        element: <Login />
    },
    {
        path:"/register",
        element: <Register />
    },
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <Home />
            }
        ]
    }
] as RouteObject[]
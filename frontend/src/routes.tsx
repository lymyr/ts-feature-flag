import type { RouteObject } from "react-router";
import App from "./pages/App";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

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
            },
            {
                path: "admin",
                element: <Admin />
            }
        ]
    }
] as RouteObject[]
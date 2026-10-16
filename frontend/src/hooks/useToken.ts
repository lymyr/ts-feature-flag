import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function useToken(): [string | null, React.Dispatch<React.SetStateAction<string | null>>] {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"))
    const nav = useNavigate()
    useEffect(() => {
        if (!token)
            nav("/login")
    }, [nav, token])
    return [token, setToken]
}
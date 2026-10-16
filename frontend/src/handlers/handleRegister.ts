import type { NavigateFunction } from "react-router";
import handleFetch from "./handleFetch"

import type { FormData, setFormData, setError, setLoading } from "../types/registerTypes"

export default async function handleRegister(
    formData: FormData, 
    setFormData: setFormData, 
    setLoading: setLoading, 
    setError: setError, 
    nav: NavigateFunction
) {
        setLoading(true)
        try {
            const res = await handleFetch("/users", {
                method: "post",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            if (!res.headers.get("content-type")?.includes("application/json")) {
                throw new Error("something went wrong")
            }
            const json = await res.json()
            if (!res.ok)
                setError(json)
            else {
                setError(undefined)
                setFormData({username: "", password: "", confirmPassword: "", occupation: "", powerLevel: ""})
                nav("/")
            }
        }
        catch(e) {
            if (e instanceof Error)
                setError(e.message)
        }
        finally {
            setLoading(false)
        }
    }
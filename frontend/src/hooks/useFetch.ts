import { useEffect, useState } from "react"
import handleFetch from "../handlers/handleFetch"

type stateType = 
    {
        state: "idle"
    } 
    | {
        state: "loading"
    }
    | {
        state: "error"
        msg: string
    }

type returnVal<T> = {
    status: stateType,
    data?: T
}

export default function useFetch<T>(urlPath: string, options: RequestInit): returnVal<T>  {
    const [status, setStatus] = useState<stateType>({ state: "idle" })
    const [data, setData] = useState<T>()

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus({ state: "loading" });

        (async () => {
            try {
                const res = await handleFetch(urlPath, options)
                if (!res.headers.get("content-type")?.includes("application/json")) {
                    setStatus({ state: "error", msg: "something went wrong"})
                }
                else {
                    const json = await res.json()
                    if (!res.ok)
                        setStatus({state: "error", msg: `${json}`})
                    else {
                        setStatus({state: "idle"})
                        setData(json.data)
                    }
                }
            }
            catch(e) {
                if (e instanceof Error)
                    setStatus({state: "error", msg: e.message})
                else
                    setStatus({state: "error", msg: "something went wrong"})
            }
        })()

    }, [options, urlPath])
    return { status, data }
}
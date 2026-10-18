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
    data?: T,
    setData: React.Dispatch<React.SetStateAction<T | undefined>>
}

export default function useFetch<T>(urlPath: string, options: RequestInit): returnVal<T>  {
    const [status, setStatus] = useState<stateType>({ state: "idle" })
    const [data, setData] = useState<T>()
    const safeOption = JSON.stringify(options)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatus({ state: "loading" });

        const controller = new AbortController();
        (async () => {
            try {
                const res = await handleFetch(urlPath, {...JSON.parse(safeOption), signal: controller.signal})
                if (!res.headers.get("content-type")?.includes("application/json")) {
                    setStatus({ state: "error", msg: "something went wrong"})
                }
                else {
                    const json = await res.json()
                    if (!res.ok)
                        setStatus({state: "error", msg: `${json.error.message}`})
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

        return () => controller.abort()
        
    }, [safeOption, urlPath])
    
    return { status, data, setData }
}
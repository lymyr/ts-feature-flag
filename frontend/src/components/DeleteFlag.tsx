import { useContext, useState } from "react"
import FlagContext from "../contexts/FlagContext"
import TokenContext from "../contexts/TokenContext"
import handleFetch from "../handlers/handleFetch"

interface handledError {
    formErrors: string[],
    fieldErrors: {
        id: string[]
    }
}

interface props {
    flagId: number
}

export default function DeleteFlag({flagId} : props) {
    const tokenContext = useContext(TokenContext)
    const [token] = tokenContext || [""]
    const flagContext = useContext(FlagContext)
    const [flagPayload, setflagPayload] = flagContext || [undefined, () => {}]
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<handledError | string | undefined>()
    const canSubmit = loading == false && Boolean(flagPayload) == true
    
    async function handleDelete() {
        setLoading(true)
        try {
            const res = await handleFetch(`/flags/${flagId}`, {
                method: "delete",
                headers: {
                    authorization: `bearer ${token}`
                }
            })

            if (res.headers.get("content-type")?.includes("application/json")) {
                const json = await res.json()
                if (res.ok && flagPayload) {
                    setflagPayload({
                        flags: flagPayload.flags.filter((f) => f.id != json.data.flag.id)
                    })
                    setError(undefined)
                }
                else
                    setError(json)
                
            }
        }
        catch(e) {
            if (e instanceof Error)
                setError(e.message)
            else
                setError("Something went wrong")
        }
        finally {
            setLoading(false)
        }
    }
    return (
        <>
            <button
                onClick={handleDelete}
                disabled={!canSubmit}
            >
                Delete
            </button>
            {   
                error && typeof error != "string" ?
                    // todo: make this a popup
                    <p>{error.formErrors[0] || error.fieldErrors.id[0]}</p>
                : error &&
                    <p>{error}</p>
            }
        </>
    )
}
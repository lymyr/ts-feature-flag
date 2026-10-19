import { useContext, useState } from "react"
import handleFetch from "../handlers/handleFetch"
import TokenContext from "../contexts/TokenContext"
import FlagContext from "../contexts/FlagContext"
import styles from "./AddFlag.module.css"

export interface handledError {
    formErrors: string[],
    fieldErrors: {
        name: string[],
        isEnabled: string[]
    }
}

export default function AddFlag() {
    const tokenContext = useContext(TokenContext)
    const [token] = tokenContext || [""]
    const flagContext = useContext(FlagContext)
    const [flagPayload, setflagPayload] = flagContext || [undefined, () => {}]

    const [formData, setFormData] = useState({
        name: "",
        isEnabled: false
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<handledError | string | undefined>()
    const canSubmit = loading == false && Boolean(flagPayload) == true

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await handleFetch("/flags", {
                method: "post",
                headers: {
                    authorization: `bearer ${token}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            if (res.headers.get("content-type")?.includes("application/json")) {
                const json = await res.json()
                if (!res.ok) {
                    return setError(json)
                }
                else if (flagPayload) {
                    setflagPayload({ flags: [...flagPayload.flags, json.data.flag]})
                    setFormData({
                        name: "",
                        isEnabled: false
                    })
                    setError(undefined)
                }
            }
        }
        catch(e) {
            if (e instanceof Error) {
                setError(e.message)
            }
            else
                setError("something went wrong")
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <form 
            onSubmit={async (e) => {
                    if (canSubmit)
                        await handleSubmit(e)
            }}
            className={styles.container}
        >
            <div>
                <div>
                    <div>
                        <label htmlFor="flagName">Flag Name</label>
                        <input
                            type="text"
                            id="flagName"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            value={formData.name}
                        />
                    </div>
                    {typeof error != "string" && error?.fieldErrors.name &&
                        <p className="error">{error.fieldErrors.name[0]}</p>
                    }
                </div>
                <div>
                    <div>
                        <input
                            type="checkbox"
                            id="isEnabled"
                            name="isEnabled"
                            checked={formData.isEnabled}
                            onChange={() => setFormData({...formData, isEnabled: !formData.isEnabled})}
                        />
                        <label htmlFor="isEnabled">Enable Flag</label>
                    </div>
                    {typeof error != "string" && error?.fieldErrors.isEnabled &&
                        <p className="error">{error.fieldErrors.isEnabled[0]}</p>
                    }
                </div>
            </div>
            {   
                typeof error == "string" ?
                    <p>{error}</p>
                : error?.formErrors &&
                    <p>{error.formErrors[0]}</p>
            }
            <button disabled={!canSubmit}>Add Flag</button>
        </form>
    )
}
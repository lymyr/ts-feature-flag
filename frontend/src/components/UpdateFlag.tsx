import InputLabel from "./subcomponents/InputLabel"
import { useContext, useState } from "react"
import TokenContext from "../contexts/TokenContext"
import type { handledError } from "./AddFlag";
import type { payload } from "../types/flagTypes"
import handleFetch from "../handlers/handleFetch";
import DeleteFlag from "./DeleteFlag";
import FlagContext from "../contexts/FlagContext";

type props = {
    flag: Omit<payload["flag"], "rules">
    index: number
    setEdit: React.Dispatch<React.SetStateAction<boolean>>
}

export default function UpdateFlag({flag, index, setEdit}: props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<handledError | string | undefined>()
    const [token] = useContext(TokenContext) || [""]
    const [flagPayload, setFlagPayload] = useContext(FlagContext) || [undefined, () => {}]
    
    const [formData, setFormData] = useState({
        name: flag.name,
        isEnabled: flag.isEnabled
    })

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await handleFetch(`/flags/${flag.id}`, {
                method: "put",
                headers: {
                    authorization: `bearer ${token}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setError(undefined)
                const newFlagPayload = flagPayload && flagPayload.flags ? { flags: [...flagPayload.flags]} : {flags: []}
                const json = await res.json()
                newFlagPayload.flags[index] = json.data.flag
                setFlagPayload(newFlagPayload)
                setEdit(false)
            }
            else if (res.headers.get("content-type")?.includes("application/json")) {
                const json = await res.json()
                return setError(json)
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
        <form onSubmit={async (e) => {
            if (loading == false)
                await handleSubmit(e)
        }}>
            <div>
                <div>
                    <InputLabel
                        label="Flag Name"
                        attr="name"
                        inputType="text"
                        formData={formData}
                        setFormData={setFormData}
                        id={`flag-name-${index}`}
                    />
                    {
                        typeof error != "string" && error?.fieldErrors.name && 
                            <p className="error">{error.fieldErrors.name[0]}</p>
                    }
                </div>
                <div>
                    <div>
                        <input
                            type="checkbox"
                            id={`isEnabled-${index}`}
                            checked={formData.isEnabled}
                            onChange={() => setFormData({
                                ...formData,
                                isEnabled: !formData.isEnabled
                            })}
                        />
                        <label htmlFor={`isEnabled-${index}`}>Enable</label>
                    </div>
                    {
                        typeof error != "string" && error?.fieldErrors.isEnabled && 
                            <p className="error">{error.fieldErrors.isEnabled[0]}</p>
                    }
                </div>
                {
                    typeof error == "string" ? 
                        <p className="error">{error}</p>
                    : error?.formErrors && error.formErrors.length > 0 &&
                        <p className="error">{error.formErrors[0]}</p>
                }
            </div>
            <div>
                <DeleteFlag flagId={flag.id}/>
                <button disabled={loading}>Save</button>
            </div>
        </form>
    )
}
import InputLabel from "./subcomponents/InputLabel"
import { useContext, useState } from "react"
import TokenContext from "../contexts/TokenContext"
import type { handledError } from "./AddFlag";
import type { payload } from "../pages/Flag"
import handleFetch from "../handlers/handleFetch";

type props = {
    flag: Omit<payload["flag"], "rules">
}

export default function UpdateFlag({flag}: props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<handledError | string | undefined>()
    const [token] = useContext(TokenContext) || [""]
    
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
                alert("Update Success")
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
            <fieldset>
                <legend>Flag</legend>
                <div>
                    <div>
                        <InputLabel
                            label="Flag Name"
                            attr="name"
                            inputType="text"
                            formData={formData}
                            setFormData={setFormData}
                        />
                        {
                            typeof error != "string" && error?.fieldErrors.name && 
                                <p>{error.fieldErrors.name[0]}</p>
                        }
                    </div>
                    <div>
                        <div>
                            <input
                                type="checkbox"
                                id="isEnabled"
                                checked={formData.isEnabled}
                                onChange={() => setFormData({
                                    ...formData,
                                    isEnabled: !formData.isEnabled
                                })}
                            />
                            <label htmlFor="isEnabled">Enable</label>
                        </div>
                        {
                            typeof error != "string" && error?.fieldErrors.isEnabled && 
                                <p>{error.fieldErrors.isEnabled[0]}</p>
                        }
                    </div>
                    {
                        typeof error == "string" ? 
                            <p>{error}</p>
                        : error?.formErrors && error.formErrors.length > 0 &&
                            <p>{error.formErrors[0]}</p>
                    }
                </div>
                <button disabled={loading}>Save</button>
            </fieldset>
        </form>
    )
}
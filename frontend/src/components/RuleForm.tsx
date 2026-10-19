import { useContext, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import TokenContext from "../contexts/TokenContext";
import handleFetch from "../handlers/handleFetch";
import type { payload } from "../types/flagTypes"

type handledError = {
    msg?: string
    fieldErrors?: string[],
    formErrors?: string[]
}

type rule = payload["flag"]["rules"][number]

interface props {
    flag: payload["flag"]
    rules: rule[]
}

export default function RuleForm({rules, flag} : props) {
    const [formData, setFormData] = useState({ rules })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<handledError | string | undefined>()
    const [token] = useContext(TokenContext) || [""]

    function handleRemoveRule(index: number) {
        const newForm = {
            rules: [...formData.rules]
        }
        newForm.rules = newForm.rules.filter((_r, i) => i != index)
        setFormData(newForm)
    }

    function handleAddRule() {
        const newForm = {
            ...formData,
            rules: [...formData.rules]
        }
        newForm.rules.push({
            id: uuidv4(), 
            attribute: "username",
            operator: "equal",
            value: "",
        })
        setFormData(newForm)
    }

    async function handleSubmit() {
        setLoading(true)
        try {
            const res = await handleFetch(`/flags/${flag.id}/rules`, {
                method: "put",
                headers: {
                    authorization: `bearer ${token}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setError(undefined)
                alert("Rules Saved")
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
        <form
            onSubmit={async (e) => {
                e.preventDefault()
                if (!loading) 
                    await handleSubmit()
            }}
        >
            <fieldset>
                <legend>{flag.name}</legend>
                <button type="button" onClick={handleAddRule}>Add Rule</button>
                <div>
                {
                    formData.rules.map((r,i) => {
                        return (
                            <div key={r.id}>
                                <div>
                                    <div>
                                        <label htmlFor={`attribute-${r.id}`}>Attribute</label>
                                        <select
                                            id={`attribute-${r.id}`}
                                            value={r.attribute}
                                            onChange={(e) => {
                                                const newForm = { rules: formData.rules.map(r => { return {...r}}) };
                                                newForm.rules[i].attribute = e.target.value as rule["attribute"];
                                                setFormData(newForm)
                                            }}
                                        >
                                            <option value="username">Username</option>
                                            <option value="occupation">Occupation</option>
                                            <option value="powerLevel">Power Level</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`operator-${r.id}`}>Operator</label>
                                        <select
                                            id={`operator-${r.id}`}
                                            value={r.operator}
                                            onChange={(e) => {
                                                const newForm = { rules: formData.rules.map(r => { return {...r}}) };
                                                newForm.rules[i].operator = e.target.value as rule["operator"];
                                                setFormData(newForm)
                                            }}
                                        >
                                            <option value="startsWith">Starts With</option>
                                            <option value="endsWith">Ends With</option>
                                            <option value="equal">Equal</option>
                                            <option value="notEqual">Not Equal</option>
                                            <option value="lessThan">Less Than</option>
                                            <option value="greaterThan">Greater Than</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`value-${r.id}`}>Value</label>
                                        <input
                                            id={`value-${r.id}`}
                                            value={r.value}
                                            onChange={(e) => {
                                                const newForm = { rules: formData.rules.map(r => { return {...r}}) };
                                                newForm.rules[i].value = e.target.value;
                                                setFormData(newForm)
                                            }}
                                        />
                                    </div>
                                    <button type="button" onClick={() => handleRemoveRule(i)}>Remove Rule</button>
                                </div>
                                { typeof error != "string" && error?.fieldErrors && error.fieldErrors[i] &&
                                    <p>{error.fieldErrors[i]}</p>
                                }
                            </div>
                        )
                    })
                }
                </div>
                {
                    error && (
                        typeof error == "string" ? 
                            <p>{error}</p>
                        : error.msg ?
                            <p>{error.msg}</p>
                        : error.formErrors && error.formErrors.length > 0 &&
                            <p>{error.formErrors[0]}</p>
                    )
                }
                <button disabled={loading}>Save</button>
            </fieldset>
        </form>
    )
}
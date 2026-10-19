import { useState } from "react";
import Form from "../components/Form";
import InputLabel from "../components/subcomponents/InputLabel";
import { Link, useNavigate } from "react-router";
import handleRegister from "../handlers/handleRegister";
import type { error, FormData, occupation} from "../types/registerTypes"
import styles from "./Register.module.css"

export default function Register() {
    const [formData, setFormData] = useState<FormData>({
        username: "",
        password: "",
        confirmPassword: "",
        occupation: "",
        powerLevel: "",
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<error>()
    const nav = useNavigate()

    return (
        <div className={styles.registerContainer}>
            <Form 
                title="Register"
                btnTitle="Register"
                loading={loading}
                onSubmit={async () => await handleRegister(formData, setFormData, setLoading, setError, nav)}
            >
                <div>
                    <InputLabel 
                        label="Username"
                        attr="username"
                        inputType="text"
                        formData={formData}
                        setFormData={setFormData}
                    />
                    {error && typeof error != "string" && error.fieldErrors.username && <p className="error">{error.fieldErrors.username[0]}</p>}
                </div>
                <div>
                    <InputLabel 
                        label="Password"
                        attr="password"
                        inputType="password"
                        formData={formData}
                        setFormData={setFormData}
                    />
                    {error && typeof error != "string" && error.fieldErrors.password && <p className="error">{error.fieldErrors.password[0]}</p>}
                </div>
                <div>
                    <InputLabel 
                        label="Confirm Password"
                        attr="confirmPassword"
                        inputType="password"
                        formData={formData}
                        setFormData={setFormData}
                    />
                    {error && typeof error != "string" && error.fieldErrors.confirmPassword && <p className="error">{error.fieldErrors.confirmPassword[0]}</p>}
                </div>
                <div>
                    <label htmlFor="occupation">Select Occupation</label>
                    <select id="occupation" onChange={(e) => setFormData({...formData, occupation: e.target.value as occupation | ""})}>
                        <option value="">--Please select your occupation--</option>
                        <option value="citizen">Citizen</option>
                        <option value="pirate">Pirate</option>
                        <option value="marine">Marine</option>
                        <option value="bountyHunter">Bounty Hunter</option>
                    </select>
                    {error && typeof error != "string" && error.fieldErrors.occupation && <p className="error">{error.fieldErrors.occupation[0]}</p>}
                </div>
                <div>
                    <InputLabel 
                        label="Power Level"
                        attr="powerLevel"
                        inputType="number"
                        inputAttr={{min: 0}}
                        formData={formData}
                        setFormData={setFormData}
                    />
                    {error && typeof error != "string" && error.fieldErrors.powerLevel && <p className="error">{error.fieldErrors.powerLevel[0]}</p>}
                </div>
                {error && typeof error != "string" && error.formErrors && <p className="error">{error.formErrors[0]}</p>}
                {error && typeof error == "string" && <p className="error">{error}</p>}
            </ Form>
            <p>Already have an account? Log in <Link to={"/login"}>here</Link></p>
        </div>
    )
}
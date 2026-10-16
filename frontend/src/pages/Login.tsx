import { useState } from "react";
import Form from "../components/Form";
import InputLabel from "../components/subcomponents/InputLabel";
import handleLogin from "../handlers/handleLogin";
import { Link, useNavigate } from "react-router";
import type {error} from "../types/loginTypes"

export default function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<error>()
    const nav = useNavigate()

    return (
        <div>
            <Form 
                title="Login"
                btnTitle="Log in"
                loading={loading}
                onSubmit={async () => await handleLogin(formData, setFormData, setLoading, setError, nav)}
            >
                <div>
                    <InputLabel 
                        label="Username"
                        attr="username"
                        inputType="text"
                        formData={formData}
                        setFormData={setFormData}
                    />
                    {error && typeof error != "string" && error.fieldErrors.username && <p>{error.fieldErrors.username[0]}</p>}
                </div>
                <div>
                    <InputLabel 
                        label="Password"
                        attr="password"
                        inputType="password"
                        formData={formData}
                        setFormData={setFormData}
                    />
                    {error && typeof error != "string" && error.fieldErrors.password && <p>{error.fieldErrors.password[0]}</p>}
                </div>
                {error && typeof error != "string" && error.formErrors && <p>{error.formErrors[0]}</p>}
                {error && typeof error == "string" && <p>{error}</p>}
            </ Form>
            <p>No account? Register <Link to={"/register"}>here</Link></p>
        </div>
    )
}
import { useParams } from "react-router"
import useFetch from "../hooks/useFetch"
import { useContext } from "react";
import TokenContext from "../contexts/TokenContext";
import RuleForm from "../components/RuleForm";
import type { payload } from "../types/flagTypes"

export default function Flag() {
    const params = useParams()
    const [token] = useContext(TokenContext) || [""]
    const { status, data } = useFetch<payload>(`/flags/${params.flagId}`, {
        headers: {
            authorization: `bearer ${token}`
        }
    })
    return (
        <div>
            {
                status.state == "loading" ?
                    <p>Loading</p>
                : status.state == "error" ?
                    <p>{status.msg}</p>
                : data &&
                    <RuleForm 
                        rules={data.flag.rules}
                        flag={data.flag}
                    />
            }
        </div>
    )
}
import { useParams } from "react-router"
import useFetch from "../hooks/useFetch"
import FlagRules from "../components/FlagRules";
import { useContext } from "react";
import TokenContext from "../contexts/TokenContext";

export interface payload {
    flag: {
        id: number;
        name: string;
        isEnabled: boolean;
        rules: {
            id: number | string; // only to be used in label htmlFor and input ids
            attribute: "id" | "username" | "occupation" | "powerLevel";
            value: string;
            operator: "startsWith" | "endsWith" | "equal" | "notEqual" | "lessThan" | "greaterThan";
        }[];
    }
}

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
                    <FlagRules flag={data.flag}/>
            }
        </div>
    )
}
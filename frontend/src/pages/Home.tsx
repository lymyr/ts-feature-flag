import { useContext } from "react"
import useFetch from "../hooks/useFetch"
import TokenContext from "../contexts/TokenContext"
import type { flags } from "../types/flagTypes"
import FlagList from "../components/FlagList"
import { jwtDecode } from "jwt-decode"
import type { FormData } from "../types/registerTypes"
import FlagContext from "../contexts/FlagContext"
import AddFlag from "../components/AddFlag"
import styles from "./Home.module.css"

export type user = Omit<FormData, "password" | "confirmPassword"> | {
    occupation: "admin"
}

export default function Home() {
    const tokenContext = useContext(TokenContext)
    const [token] = tokenContext || [""]
    const { status, data, setData } = useFetch<Record<"flags", flags>>("/client", {
        headers: {
            authorization: `bearer ${token}`
        }
    })

    const user: user | undefined = token ? jwtDecode(token) : undefined

    return (
        <>
            <FlagContext value={[data, setData]}>
                <div className={styles.container}>
                    { user?.occupation == "admin" &&
                        <AddFlag />
                    }
                    {
                        status.state == "loading" ?
                            <p className={styles.text}>loading</p>
                        : status.state == "error" ?
                            <p className={styles.text}>{status.msg}</p>
                        : data && data.flags.length > 0 ?
                            <FlagList flags={data.flags} user={user}/>
                        : <p className={styles.text}>no flags yet</p>
                    }
                </div>
            </FlagContext>
        </>
    )
}
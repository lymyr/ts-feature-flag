import { useState } from "react"
import type { payload } from "../types/flagTypes"
import UpdateFlag from "./UpdateFlag"
import { Link } from "react-router"
import styles from "./AdminHomeFlag.module.css"

interface props {
    isAdmin: boolean
    flag: Omit<payload["flag"], "rules">
    index: number
}

export default function AdminHomeFlag({isAdmin, flag, index}: props) {
    const [edit, setEdit] = useState(false)
    return (
        <div className={
            flag.isEnabled ? `${styles.container}` : `${styles.container} ${styles.disabled}`
        }>
            {
                isAdmin ? 
                    (
                        edit ? 
                            <div className={styles.admin}>
                                <button onClick={() => setEdit(false)}>X</button>
                                <div>
                                    <UpdateFlag flag={flag} index={index} setEdit={setEdit}/>
                                </div>
                            </div>
                        :
                            <div className={styles.admin}>
                                <button onClick={() => setEdit(true)}>Edit</button>
                                <div>
                                    <p>{flag.name}</p>
                                    <Link to={`/flags/${flag.id}`}><button>Rules</button></Link>
                                </div>
                            </div>
                    )
                : 
                    <p>{flag.name}</p>
            }
        </div>
    )
}
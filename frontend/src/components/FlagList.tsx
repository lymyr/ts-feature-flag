import type { payload } from "../types/flagTypes"
import type { user } from "../pages/Home"
import AdminHomeFlag from "./AdminHomeFlag";
import styles from "./FlagList.module.css"

interface props {
    flags: Omit<payload["flag"], "rules">[];
    user: user | undefined;
}

export interface handledError {
    formErrors: string[],
    fieldErrors: {
        id: string[]
    }
}

export default function FlagList({flags, user}: props) {
    return (
        <div className={
            user?.occupation != "admin" ? `${styles.container}` : `${styles.container} ${styles.admin}`
        }>
            {
                flags.map((flag, i) => {
                    return (
                        <AdminHomeFlag 
                            flag={flag} 
                            isAdmin={user?.occupation == "admin"} 
                            index={i}
                            key={flag.id}
                        />
                    )
                })
            }
        </div>
    )
}
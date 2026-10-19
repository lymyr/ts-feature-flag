import { useState } from "react"
import type { payload } from "../types/flagTypes"
import UpdateFlag from "./UpdateFlag"
import { Link } from "react-router"

interface props {
    isAdmin: boolean
    flag: Omit<payload["flag"], "rules">
    index: number
}

export default function AdminHomeFlag({isAdmin, flag, index}: props) {
    const [edit, setEdit] = useState(false)
    return (
        <div>
            {
                isAdmin ? 
                    (
                        edit ? 
                            <div>
                                <button onClick={() => setEdit(false)}>X</button>
                                <UpdateFlag flag={flag} index={index} setEdit={setEdit}/>
                            </div>
                        :
                            <div>
                                <button onClick={() => setEdit(true)}>Edit</button>
                                <p>{flag.name}</p>
                                <Link to={`/flags/${flag.id}`}><button>Rules</button></Link>
                            </div>
                    )
                : 
                    <p>{flag.name}</p>
            }
        </div>
    )
}
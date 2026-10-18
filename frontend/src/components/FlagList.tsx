import type { flags } from "../types/flagTypes"
import type { user } from "../pages/Home"
import { Link } from "react-router";
import DeleteFlag from "./DeleteFlag";

interface props {
    flags: flags;
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
        <div>
            {
                flags.map((flag) => {
                    return (
                        <div key={flag.id}>
                            <div>
                                <p>{flag.name}</p>
                                {user?.occupation == "admin" &&
                                    <div>
                                        <DeleteFlag flagId={flag.id} />
                                        <Link to={`flags/${flag.id}`}><button>Edit</button></Link>
                                    </div>
                                }
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}
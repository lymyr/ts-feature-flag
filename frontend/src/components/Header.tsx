import { useContext } from "react"
import TokenContext from "../contexts/TokenContext"
import { Link } from "react-router"

export default function Header() {
    const tokenContext = useContext(TokenContext)
    const [, setToken] = tokenContext || ["", () => {}]

    function handleLogout() {
        localStorage.removeItem("token")
        setToken("")
    }
    
    return (
        <header>
            <div>
                <Link to={"/"}><h1>Feature Flag</h1></Link>
            </div>
            <div>
                <nav>

                </nav>
                <button onClick={handleLogout}>Log out</button>
            </div>
        </header>
    )
}
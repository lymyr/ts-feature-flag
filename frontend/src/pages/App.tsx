import { Outlet } from "react-router";
import useToken from "../hooks/useToken";
import TokenContext from "../contexts/TokenContext";

export default function App() {
    const [token, setToken] = useToken()
    console.log(token)
    return (
        <>
            <TokenContext value={[token, setToken]}>
                <Outlet />
            </TokenContext>
        </>
    )
}
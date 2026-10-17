import { Outlet } from "react-router";
import useToken from "../hooks/useToken";
import TokenContext from "../contexts/TokenContext";
import Header from "../components/Header";

export default function App() {
    const [token, setToken] = useToken()
    
    return (
        <>
            <TokenContext value={[token, setToken]}>
                <Header />
                <Outlet />
            </TokenContext>
        </>
    )
}
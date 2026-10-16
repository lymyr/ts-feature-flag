import { createContext } from "react";


export default createContext<null | [string | null, React.Dispatch<React.SetStateAction<string | null>>]>(null)
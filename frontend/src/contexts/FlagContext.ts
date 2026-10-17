import { createContext } from "react";
import type { flags } from "../types/flagTypes";

type FlagContextType = 
    undefined |
    [
        Record<"flags", flags> | undefined, 
        React.Dispatch<React.SetStateAction<Record<"flags", flags> | undefined>>
    ]

export default createContext<FlagContextType>(undefined)
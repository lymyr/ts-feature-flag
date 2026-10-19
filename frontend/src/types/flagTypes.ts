export interface payload {
    flag: {
        id: number;
        name: string;
        isEnabled: boolean;
        rules: {
            id: number | string; // only to be used in label htmlFor and input ids
            attribute: "id" | "username" | "occupation" | "powerLevel";
            value: string;
            operator: "startsWith" | "endsWith" | "equal" | "notEqual" | "lessThan" | "greaterThan";
        }[];
    }
}

export type flag = Omit<payload["flag"], "rules">
export type flags = flag[]
export type rule = payload["flag"]["rules"][number]
export type rules = rule[]
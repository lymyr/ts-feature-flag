export interface FormData {
    username: string;
    password: string;
    confirmPassword: string;
    occupation: occupation | "";
    powerLevel: string;
}

export type setFormData = React.Dispatch<React.SetStateAction<FormData>>

export type setError = React.Dispatch<React.SetStateAction<error | undefined>>

export type error = string | {
    formErrors: Array<string>;
    fieldErrors: {
        username?: Array<string>;
        password?: Array<string>;
        confirmPassword?: Array<string>;
        occupation?: Array<string>;
        powerLevel?: Array<string>;
    };
}

export type setLoading = React.Dispatch<React.SetStateAction<boolean>>

export type occupation = "citizen"|"pirate"|"marine"|"bountyHunter"
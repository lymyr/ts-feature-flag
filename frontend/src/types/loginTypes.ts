export interface FormData {
    username: string
    password: string
}

export type setFormData = React.Dispatch<React.SetStateAction<FormData>>

export type setError = React.Dispatch<React.SetStateAction<error | undefined>>

export type setLoading = React.Dispatch<React.SetStateAction<boolean>>

export type error = string | {formErrors: Array<string>, fieldErrors: {username?: Array<string>, password?: Array<string>}}
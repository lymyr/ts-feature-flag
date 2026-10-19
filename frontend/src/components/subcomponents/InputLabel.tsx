import type React from "react"

interface props<T>{
    label: string
    formData: T
    inputType: "text" | "email" | "password" | "number"
    attr: keyof T
    setFormData: React.Dispatch<React.SetStateAction<T>>
    id?: string
    inputAttr?: object
}

export default function InputLabel<T>({
    label,
    attr,
    formData,
    inputType,
    setFormData,
    id,
    inputAttr
}: props<T>) {
    return (
        <div>
            <label 
                htmlFor={id ? id : `${label.split(" ").join("-")}`}
            >
                {label}
            </label>
            <input 
                id={id ? id : `${label.split(" ").join("-")}`} 
                value={formData[attr] ? formData[attr] as string : ""}
                onChange={(e) => setFormData({
                    ...formData, 
                    [attr]: e.target.value
                })}
                type={inputType}
                {...inputAttr}
            />
        </div>
    )
}
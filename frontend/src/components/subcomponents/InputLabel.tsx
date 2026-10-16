import type React from "react"

interface props<T>{
    label: string
    formData: T
    inputType: "text" | "email" | "password" | "number"
    attr: keyof T
    setFormData: React.Dispatch<React.SetStateAction<T>>
    inputAttr?: object
}

export default function InputLabel<T extends Record<string, string>>({
    label,
    attr,
    formData,
    inputType,
    setFormData,
    inputAttr
}: props<T>) {
    return (
        <div>
            <label 
                htmlFor={`${label.split(" ").join("-")}`}
            >
                {label}
            </label>
            <input 
                id={`${label.split(" ").join("-")}`} 
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
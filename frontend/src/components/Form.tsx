import type React from "react"

interface props {
    title: string;
    btnTitle: string;
    loading: boolean,
    onSubmit: () => void;
    children: React.ReactNode;
}

export default function Form({ 
    title, 
    btnTitle,
    onSubmit,
    children, 
    loading
}: props) {
    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            if (loading == false)
                onSubmit()
        }}>
            <div>
                <p>{title}</p>
                <div>
                    {children}
                </div>
                <button disabled={loading}>
                    {btnTitle}
                </button>
            </div>
        </form>
    )
}
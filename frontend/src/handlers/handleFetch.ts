export default async function handleFetch(
    urlPath: string, 
    options?: RequestInit, 
): Promise<Response> {
    let url: string
    if (import.meta.env.DEV) 
        url = import.meta.env.VITE_DEV_API_URL
    else 
        url = import.meta.env.VITE_API_URL
    
    const res = await fetch(`${url}${urlPath}`, {...options})
    return res
}
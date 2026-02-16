// Simplified toast hook
import { useState, useEffect } from "react"

export const useToast = () => {
    const [toasts, setToasts] = useState<any[]>([])

    const toast = ({ title, description, variant }: any) => {
        console.log(`Toast: ${title} - ${description} (${variant})`)
        // In a real app, this would add to a state array rendered by a Toaster component
        if (variant === 'destructive') {
            alert(`${title}: ${description}`)
        } else {
            alert(title)
        }
    }

    return { toast, toasts }
}

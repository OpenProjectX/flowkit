import { useEffect } from 'react'
import type { RefObject } from 'react'

import { getOS } from '../utils'

/**
 * Focuses the referenced input on Ctrl+F (Cmd+F on macOS) and blurs it on Escape.
 * Ported from Flowise `ui/src/hooks/useSearchShortcut.jsx`.
 */
export const useSearchShortcut = (inputRef: RefObject<HTMLElement | null>): void => {
    useEffect(() => {
        const component = inputRef.current

        if (!component) return // Check if inputRef.current is defined

        const isMac = getOS() === 'macos'

        const handleKeyDown = (event: KeyboardEvent) => {
            if ((isMac && event.metaKey && event.key === 'f') || (!isMac && event.ctrlKey && event.key === 'f')) {
                event.preventDefault()
                component.focus()
            }
        }

        const handleInputEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') component.blur()
        }

        component.addEventListener('keydown', handleInputEscape)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            component.removeEventListener('keydown', handleInputEscape)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [inputRef]) // Add inputRef to the dependency array to ensure the effect is re-applied if inputRef changes
}

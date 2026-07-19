import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'

// ==============================|| ELEMENT REFERENCE HOOK ||============================== //

/**
 * Tracks whether the component is still mounted, so async callbacks can
 * avoid setting state after unmount. Ported from Flowise `ui/src/hooks/useScriptRef.jsx`.
 */
export const useScriptRef = (): MutableRefObject<boolean> => {
    const scripted = useRef(true)

    useEffect(
        () => () => {
            scripted.current = false
        },
        []
    )

    return scripted
}

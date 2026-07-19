import { useContext } from 'react'

import { ConfirmContext } from './ConfirmContext'
import type { ConfirmContextValue } from './ConfirmContext'

/**
 * Returns the promise-based confirm API: `const { confirm } = useConfirm()`,
 * then `const confirmed = await confirm({ title, description, ... })`.
 * Ported from Flowise `ui/src/hooks/useConfirm.jsx`.
 */
export const useConfirm = (): ConfirmContextValue => {
    const context = useContext(ConfirmContext)
    if (!context) throw new Error('useConfirm must be used within a ConfirmProvider')
    return context
}

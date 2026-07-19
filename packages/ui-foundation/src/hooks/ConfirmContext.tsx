import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

/**
 * Promise-based confirm dialog context.
 * Ported from Flowise `ui/src/store/context/ConfirmContext.jsx` + `ConfirmContextProvider.jsx`
 * + `dialogReducer.js`; the reducer/dispatch pair is replaced by plain state.
 */

export interface ConfirmOptions {
    title?: ReactNode
    description?: ReactNode
    confirmButtonName?: ReactNode
    cancelButtonName?: ReactNode
}

export interface ConfirmState {
    show: boolean
    title: ReactNode
    description: ReactNode
    confirmButtonName: ReactNode
    cancelButtonName: ReactNode
}

export interface ConfirmContextValue {
    confirmState: ConfirmState
    confirm: (options: ConfirmOptions) => Promise<boolean>
    onConfirm: () => void
    onCancel: () => void
}

export const ConfirmContext = createContext<ConfirmContextValue | null>(null)

/** Defaults matching Flowise's `dialogReducer` initial state. */
const initialConfirmState: ConfirmState = {
    show: false,
    title: '',
    description: '',
    confirmButtonName: 'OK',
    cancelButtonName: 'Cancel'
}

/**
 * Minimal internal dialog styled like Flowise's `ui-component/dialog/ConfirmDialog.jsx`.
 * MUI's `Dialog` already renders in a portal attached to `document.body`, so no manual
 * `createPortal` to a `#portal` element is needed.
 */
const ConfirmDialog = () => {
    const context = useContext(ConfirmContext)
    if (!context) return null
    const { confirmState, onConfirm, onCancel } = context

    return (
        <Dialog
            fullWidth
            maxWidth='xs'
            open={confirmState.show}
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {confirmState.title}
            </DialogTitle>
            <DialogContent>
                <span>{confirmState.description}</span>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{confirmState.cancelButtonName}</Button>
                <Button variant='contained' onClick={onConfirm}>
                    {confirmState.confirmButtonName}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
    const [confirmState, setConfirmState] = useState<ConfirmState>(initialConfirmState)
    const resolveRef = useRef<((value: boolean) => void) | null>(null)

    const closeConfirm = useCallback(() => {
        setConfirmState(initialConfirmState)
    }, [])

    const onConfirm = useCallback(() => {
        closeConfirm()
        resolveRef.current?.(true)
        resolveRef.current = null
    }, [closeConfirm])

    const onCancel = useCallback(() => {
        closeConfirm()
        resolveRef.current?.(false)
        resolveRef.current = null
    }, [closeConfirm])

    const confirm = useCallback((options: ConfirmOptions) => {
        setConfirmState({
            show: true,
            title: options.title ?? initialConfirmState.title,
            description: options.description ?? initialConfirmState.description,
            confirmButtonName: options.confirmButtonName ?? initialConfirmState.confirmButtonName,
            cancelButtonName: options.cancelButtonName ?? initialConfirmState.cancelButtonName
        })
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve
        })
    }, [])

    const value = useMemo(() => ({ confirmState, confirm, onConfirm, onCancel }), [confirmState, confirm, onConfirm, onCancel])

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <ConfirmDialog />
        </ConfirmContext.Provider>
    )
}

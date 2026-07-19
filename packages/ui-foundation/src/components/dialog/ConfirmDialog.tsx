import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { StyledButton } from '../button/StyledButton'

export interface ConfirmDialogProps {
    open: boolean
    title?: ReactNode
    description?: ReactNode
    cancelButtonName?: ReactNode
    confirmButtonName?: ReactNode
    onConfirm?: () => void
    onCancel?: () => void
}

export const ConfirmDialog = ({
    open,
    title,
    description,
    cancelButtonName,
    confirmButtonName,
    onConfirm,
    onCancel
}: ConfirmDialogProps) => {
    const portalElement = document.getElementById('portal')

    const component = open ? (
        <Dialog
            fullWidth
            maxWidth='xs'
            open={open}
            onClose={onCancel}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {title}
            </DialogTitle>
            <DialogContent>
                <span>{description}</span>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{cancelButtonName}</Button>
                <StyledButton variant='contained' onClick={onConfirm}>
                    {confirmButtonName}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return portalElement ? createPortal(component, portalElement) : <>{component}</>
}

export default ConfirmDialog

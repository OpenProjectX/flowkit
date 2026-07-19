import { Backdrop, CircularProgress } from '@mui/material'

export interface BackdropLoaderProps {
    open?: boolean
}

export const BackdropLoader = ({ open }: BackdropLoaderProps) => {
    return (
        <div>
            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={open ?? false}>
                <CircularProgress color='inherit' />
            </Backdrop>
        </div>
    )
}

export default BackdropLoader

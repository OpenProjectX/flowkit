import { IconButton } from '@mui/material'
import { IconClipboard } from '@tabler/icons-react'

export interface CopyToClipboardButtonProps {
    isDisabled?: boolean
    isLoading?: boolean
    /** Replaces Flowise's `useSelector(state => state.customization).isDarkMode` */
    isDarkMode?: boolean
    onClick?: () => void
}

export const CopyToClipboardButton = ({ isDisabled, isLoading, isDarkMode = false, onClick }: CopyToClipboardButtonProps) => {
    return (
        <IconButton
            disabled={isDisabled || isLoading}
            onClick={onClick}
            size='small'
            sx={{ background: 'transparent', border: 'none' }}
            title='Copy to clipboard'
        >
            <IconClipboard style={{ width: '20px', height: '20px' }} color={isLoading ? '#9e9e9e' : isDarkMode ? 'white' : '#1e88e5'} />
        </IconButton>
    )
}

export default CopyToClipboardButton

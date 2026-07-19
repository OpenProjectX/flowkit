import { Info } from '@mui/icons-material'
import { IconButton, Tooltip } from '@mui/material'
import { SxProps, Theme } from '@mui/material/styles'
import parser from 'html-react-parser'

export interface TooltipWithParserProps {
    title: string
    sx?: SxProps<Theme>
    /** Replaces Flowise's `useSelector(state => state.customization).isDarkMode` */
    isDarkMode?: boolean
}

export const TooltipWithParser = ({ title, sx, isDarkMode = false }: TooltipWithParserProps) => {
    return (
        <Tooltip title={parser(title)} placement='right'>
            <IconButton sx={{ height: 15, width: 15, ml: 2, mt: -0.5 }}>
                <Info
                    sx={{
                        ...(sx as object),
                        background: 'transparent',
                        color: isDarkMode ? 'white' : 'inherit',
                        height: 15,
                        width: 15
                    }}
                />
            </IconButton>
        </Tooltip>
    )
}

export default TooltipWithParser

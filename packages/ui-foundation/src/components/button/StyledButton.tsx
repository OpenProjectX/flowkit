import { ComponentType } from 'react'
import { styled } from '@mui/material/styles'
import { Button, ButtonProps } from '@mui/material'
import MuiToggleButton, { ToggleButtonProps } from '@mui/material/ToggleButton'

export const StyledButton: ComponentType<ButtonProps> = styled(Button)(({ theme, color = 'primary' }) => {
    const palette = theme.palette as unknown as Record<string, { main: string }>
    return {
        color: 'white',
        backgroundColor: palette[color as string].main,
        '&:hover': {
            backgroundColor: palette[color as string].main,
            backgroundImage: `linear-gradient(rgb(0 0 0/10%) 0 0)`
        }
    }
})

export const StyledToggleButton: ComponentType<ToggleButtonProps> = styled(MuiToggleButton)(({ theme, color = 'primary' }) => {
    const palette = theme.palette as unknown as Record<string, { main: string }>
    return {
        '&.Mui-selected, &.Mui-selected:hover': {
            color: 'white',
            backgroundColor: palette[color as string].main
        }
    }
})

export type StyledButtonProps = ButtonProps
export type StyledToggleButtonProps = ToggleButtonProps

export default StyledButton

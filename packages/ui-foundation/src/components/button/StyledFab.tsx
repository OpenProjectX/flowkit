import { ComponentType } from 'react'
import { styled } from '@mui/material/styles'
import { Fab, FabProps } from '@mui/material'

export const StyledFab: ComponentType<FabProps> = styled(Fab)(({ theme, color = 'primary' }) => {
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

export type StyledFabProps = FabProps

export default StyledFab

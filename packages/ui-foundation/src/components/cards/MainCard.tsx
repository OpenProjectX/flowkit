import { forwardRef, ReactNode } from 'react'

// material-ui
import { Card, CardContent, CardHeader, Divider, Typography } from '@mui/material'
import { CardProps } from '@mui/material/Card'
import { SxProps, Theme } from '@mui/material/styles'

// constant
const headerSX = {
    '& .MuiCardHeader-action': { mr: 0 }
}

export interface MainCardProps extends Omit<CardProps, 'title' | 'content'> {
    border?: boolean
    boxShadow?: boolean
    children?: ReactNode
    content?: boolean
    contentClass?: string
    contentSX?: SxProps<Theme>
    darkTitle?: boolean
    maxWidth?: 'full' | 'sm' | 'md'
    secondary?: ReactNode
    shadow?: string
    sx?: SxProps<Theme>
    title?: ReactNode
}

// ==============================|| CUSTOM MAIN CARD ||============================== //

const MainCard = forwardRef<HTMLDivElement, MainCardProps>(function MainCard(
    {
        boxShadow,
        children,
        content = true,
        contentClass = '',
        contentSX = {
            px: 2,
            py: 0
        },
        darkTitle,
        maxWidth = 'full',
        secondary,
        shadow,
        sx = {},
        title,
        ...others
    },
    ref
) {
    const otherProps = { ...others, border: others.border === false ? undefined : others.border }
    return (
        <Card
            ref={ref}
            {...otherProps}
            sx={{
                background: 'transparent',
                ':hover': {
                    boxShadow: boxShadow ? shadow || '0 2px 14px 0 rgb(32 40 45 / 8%)' : 'inherit'
                },
                maxWidth: maxWidth === 'sm' ? '800px' : maxWidth === 'md' ? '960px' : '1280px',
                mx: 'auto',
                ...sx
            }}
        >
            {/* card header and action */}
            {!darkTitle && title && <CardHeader sx={headerSX} title={title} action={secondary} />}
            {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant='h3'>{title}</Typography>} action={secondary} />}

            {/* content & header divider */}
            {title && <Divider />}

            {/* card content */}
            {content && (
                <CardContent sx={contentSX} className={contentClass}>
                    {children}
                </CardContent>
            )}
            {!content && children}
        </Card>
    )
})

export default MainCard

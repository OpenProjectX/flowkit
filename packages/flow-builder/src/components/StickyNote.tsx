import { memo, useRef, useState } from 'react'
import type { NodeProps } from 'reactflow'
import { NodeToolbar } from 'reactflow'
import { alpha, darken, lighten, styled, useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { Box, ButtonGroup, IconButton } from '@mui/material'
import { MainCard, Input } from '@openprojectx/ui-foundation'
import { IconCopy, IconTrash } from '@tabler/icons-react'
import type { BuilderNodeData } from '../types'
import { useFlowBuilder } from '../FlowBuilderProvider'

const CardWrapper = styled(MainCard)(({ theme }: { theme: Theme }) => ({
    background: theme.palette.card.main,
    color: theme.palette.text.primary,
    border: 'solid 1px',
    width: 'max-content',
    height: 'auto',
    padding: '10px',
    boxShadow: 'none'
}))

const StyledNodeToolbar = styled(NodeToolbar)(({ theme }: { theme: Theme }) => ({
    backgroundColor: theme.palette.card.main,
    color: theme.palette.text.primary,
    padding: '5px',
    borderRadius: '10px',
    boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)'
}))

/**
 * Annotation node: a colored card holding a single free-text param
 * (`data.inputParams[0]`). Enabled via `features.stickyNote`.
 */
const StickyNote = ({ data }: NodeProps<BuilderNodeData>) => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'
    const ref = useRef<HTMLDivElement>(null)

    const { deleteNode, duplicateNode, config } = useFlowBuilder()
    const [inputParam] = data.inputParams ?? []
    const [isHovered, setIsHovered] = useState(false)

    const nodeColor = config.resolveNodeColor?.(data) ?? data.color ?? '#666666'

    const getStateColor = () => {
        if (data.selected) return nodeColor
        if (isHovered) return alpha(nodeColor, 0.8)
        return alpha(nodeColor, 0.5)
    }

    const getBackgroundColor = () => {
        if (isDarkMode) {
            return isHovered ? darken(nodeColor, 0.7) : darken(nodeColor, 0.8)
        }
        return isHovered ? lighten(nodeColor, 0.8) : lighten(nodeColor, 0.9)
    }

    if (!inputParam) return null

    return (
        <div ref={ref} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <StyledNodeToolbar>
                <ButtonGroup sx={{ gap: 1 }} variant='outlined' aria-label='sticky note actions'>
                    <IconButton
                        size='small'
                        title='Duplicate'
                        onClick={() => duplicateNode(data.id)}
                        sx={{ color: isDarkMode ? 'white' : 'inherit', '&:hover': { color: theme.palette.primary.main } }}
                    >
                        <IconCopy size={20} />
                    </IconButton>
                    <IconButton
                        size='small'
                        title='Delete'
                        onClick={() => deleteNode(data.id)}
                        sx={{ color: isDarkMode ? 'white' : 'inherit', '&:hover': { color: theme.palette.error.main } }}
                    >
                        <IconTrash size={20} />
                    </IconButton>
                </ButtonGroup>
            </StyledNodeToolbar>
            <CardWrapper
                content={false}
                sx={{
                    borderColor: getStateColor(),
                    borderWidth: '1px',
                    boxShadow: data.selected ? `0 0 0 1px ${getStateColor()} !important` : 'none',
                    minHeight: 60,
                    height: 'auto',
                    backgroundColor: getBackgroundColor(),
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                        boxShadow: data.selected ? `0 0 0 1px ${getStateColor()} !important` : 'none'
                    }
                }}
                border={false}
            >
                <Box>
                    <Input
                        key={data.id}
                        inputParam={inputParam as never}
                        onChange={(newValue: string) => {
                            data.inputs[inputParam.name] = newValue
                        }}
                        value={(data.inputs[inputParam.name] as string) ?? (inputParam.default as string) ?? ''}
                    />
                </Box>
            </CardWrapper>
        </div>
    )
}

export default memo(StickyNote)

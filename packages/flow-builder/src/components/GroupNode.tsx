import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { NodeProps } from 'reactflow'
import { Background, Handle, NodeResizer, NodeToolbar, Position, useUpdateNodeInternals } from 'reactflow'
import { alpha, darken, lighten, styled, useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { Box, ButtonGroup, IconButton, Tooltip, Typography, Avatar } from '@mui/material'
import { MainCard } from '@openprojectx/ui-foundation'
import {
    IconAlertCircleFilled,
    IconCheck,
    IconCircleChevronRightFilled,
    IconCopy,
    IconExclamationMark,
    IconInfoCircle,
    IconLoader,
    IconTrash
} from '@tabler/icons-react'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import CancelIcon from '@mui/icons-material/Cancel'
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
 * Group/container node (generalized from Flowise's IterationNode): a resizable
 * card with its own dotted background. Child nodes reference it via
 * `parentNode` + `extent: 'parent'`; deleting it cascades to children
 * (handled by FlowBuilderProvider.deleteNode).
 */
const GroupNode = ({ data }: NodeProps<BuilderNodeData>) => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'
    const ref = useRef<HTMLDivElement>(null)
    const reactFlowWrapper = useRef<HTMLDivElement>(null)

    const updateNodeInternals = useUpdateNodeInternals()
    // eslint-disable-next-line unused-imports/no-unused-vars
    const [position, setPosition] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const { deleteNode, duplicateNode, reactFlowInstance, config } = useFlowBuilder()

    const [cardDimensions, setCardDimensions] = useState({ width: '300px', height: '250px' })

    useEffect(() => {
        if (reactFlowInstance) {
            const node = reactFlowInstance.getNodes().find((n) => n.id === data.id)
            if (node && node.width && node.height) {
                setCardDimensions({ width: `${node.width}px`, height: `${node.height}px` })
            }
        }
    }, [reactFlowInstance, data.id])

    const nodeColor = config.resolveNodeColor?.(data) ?? data.color ?? '#666666'
    const warningMessage = config.resolveNodeWarning?.(data)

    const getStateColor = () => {
        if (data.selected) return nodeColor
        if (isHovered) return alpha(nodeColor, 0.8)
        return alpha(nodeColor, 0.5)
    }

    const getOutputAnchors = () => data.outputAnchors ?? []

    const getAnchorPosition = (index: number) => {
        const currentHeight = ref.current?.clientHeight || 0
        const spacing = currentHeight / (getOutputAnchors().length + 1)
        const pos = spacing * (index + 1)
        if (pos > 0) {
            updateNodeInternals(data.id)
        }
        return pos
    }

    const getMinimumHeight = () => {
        const outputCount = getOutputAnchors().length
        return Math.max(60, outputCount * 20 + 40)
    }

    const getBackgroundColor = () => {
        if (isDarkMode) {
            return isHovered ? darken(nodeColor, 0.7) : darken(nodeColor, 0.8)
        }
        return isHovered ? lighten(nodeColor, 0.8) : lighten(nodeColor, 0.9)
    }

    const getStatusBackgroundColor = (status?: string) => {
        switch (status) {
            case 'ERROR':
                return theme.palette.error.dark
            case 'INPROGRESS':
                return theme.palette.warning.dark
            case 'STOPPED':
            case 'TERMINATED':
                return theme.palette.error.main
            case 'FINISHED':
                return theme.palette.success.dark
            default:
                return theme.palette.primary.dark
        }
    }

    useEffect(() => {
        if (ref.current) {
            setTimeout(() => {
                setPosition((ref.current as any)?.offsetTop + (ref.current?.clientHeight ?? 0) / 2)
                updateNodeInternals(data.id)
            }, 10)
        }
    }, [data, ref, updateNodeInternals])

    const onResizeEnd = useCallback((_e: unknown, params: { width: number; height: number }) => {
        setCardDimensions({ width: `${params.width}px`, height: `${params.height}px` })
    }, [])

    const icon = config.registry.renderIcon?.(data as never)

    return (
        <div ref={ref} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <NodeToolbar align='start' isVisible={true}>
                <Box style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                    <div
                        style={{
                            ...(theme.typography as any).commonAvatar,
                            ...(theme.typography as any).largeAvatar,
                            borderRadius: '15px',
                            cursor: 'grab',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: nodeColor
                        }}
                    >
                        {icon}
                    </div>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, ml: 1 }}>{data.label}</Typography>
                </Box>
            </NodeToolbar>
            <StyledNodeToolbar align='end'>
                <ButtonGroup sx={{ gap: 1 }} variant='outlined' aria-label='group actions'>
                    {(config.canDuplicateNode?.(data) ?? true) && (
                        <IconButton
                            size='small'
                            title='Duplicate'
                            onClick={() => duplicateNode(data.id)}
                            sx={{ color: isDarkMode ? 'white' : 'inherit', '&:hover': { color: theme.palette.primary.main } }}
                        >
                            <IconCopy size={20} />
                        </IconButton>
                    )}
                    <IconButton
                        size='small'
                        title='Delete'
                        onClick={() => deleteNode(data.id)}
                        sx={{ color: isDarkMode ? 'white' : 'inherit', '&:hover': { color: theme.palette.error.main } }}
                    >
                        <IconTrash size={20} />
                    </IconButton>
                    {config.onNodeInfo && (
                        <IconButton
                            size='small'
                            title='Info'
                            onClick={() => config.onNodeInfo?.(data)}
                            sx={{ color: isDarkMode ? 'white' : 'inherit', '&:hover': { color: theme.palette.info.main } }}
                        >
                            <IconInfoCircle size={20} />
                        </IconButton>
                    )}
                </ButtonGroup>
            </StyledNodeToolbar>
            <NodeResizer minWidth={300} minHeight={Math.max(getMinimumHeight(), 250)} onResizeEnd={onResizeEnd} />
            <CardWrapper
                content={false}
                sx={{
                    borderColor: getStateColor(),
                    borderWidth: '1px',
                    boxShadow: data.selected ? `0 0 0 1px ${getStateColor()} !important` : 'none',
                    minHeight: Math.max(getMinimumHeight(), 250),
                    minWidth: 300,
                    width: cardDimensions.width,
                    height: cardDimensions.height,
                    backgroundColor: getBackgroundColor(),
                    display: 'flex',
                    '&:hover': {
                        boxShadow: data.selected ? `0 0 0 1px ${getStateColor()} !important` : 'none'
                    }
                }}
                border={false}
            >
                {data.status && (
                    <Tooltip title={data.status === 'ERROR' ? (data.error as string) || 'Error' : ''}>
                        <Avatar
                            variant='rounded'
                            sx={{
                                ...(theme.typography as any).smallAvatar,
                                borderRadius: '50%',
                                background:
                                    data.status === 'STOPPED' || data.status === 'TERMINATED'
                                        ? 'white'
                                        : getStatusBackgroundColor(data.status),
                                color: 'white',
                                ml: 2,
                                position: 'absolute',
                                top: -10,
                                right: -10
                            }}
                        >
                            {data.status === 'INPROGRESS' ? (
                                <IconLoader className='flowkit-spin' />
                            ) : data.status === 'ERROR' ? (
                                <IconExclamationMark />
                            ) : data.status === 'TERMINATED' ? (
                                <CancelIcon sx={{ color: getStatusBackgroundColor(data.status) }} />
                            ) : data.status === 'STOPPED' ? (
                                <StopCircleIcon sx={{ color: getStatusBackgroundColor(data.status) }} />
                            ) : (
                                <IconCheck />
                            )}
                        </Avatar>
                    </Tooltip>
                )}

                {warningMessage && (
                    <Tooltip placement='right-start' title={<span style={{ whiteSpace: 'pre-line' }}>{warningMessage}</span>}>
                        <Avatar
                            variant='rounded'
                            sx={{
                                ...(theme.typography as any).smallAvatar,
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                top: -10,
                                left: -10
                            }}
                        >
                            <IconAlertCircleFilled color='orange' />
                        </Avatar>
                    </Tooltip>
                )}

                <Box sx={{ width: '100%' }}>
                    {!data.hideInput && (
                        <Handle
                            type='target'
                            position={Position.Left}
                            id={data.id}
                            style={{
                                width: 5,
                                height: 20,
                                backgroundColor: 'transparent',
                                border: 'none',
                                position: 'absolute',
                                left: -2
                            }}
                        >
                            <div
                                style={{
                                    width: 5,
                                    height: 20,
                                    backgroundColor: nodeColor,
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        </Handle>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Box
                            sx={{
                                height: `calc(${cardDimensions.height} - 20px)`,
                                width: `${cardDimensions.width}`,
                                overflow: 'hidden',
                                position: 'relative',
                                borderRadius: '10px'
                            }}
                        >
                            <div
                                ref={reactFlowWrapper}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: theme.palette.background.default
                                }}
                            >
                                <Background color='#aaa' gap={16} />
                            </div>
                        </Box>
                    </div>
                    {getOutputAnchors().map((outputAnchor, index) => (
                        <Handle
                            type='source'
                            position={Position.Right}
                            key={outputAnchor.id}
                            id={outputAnchor.id}
                            style={{
                                height: 20,
                                width: 20,
                                top: getAnchorPosition(index),
                                backgroundColor: 'transparent',
                                border: 'none',
                                position: 'absolute',
                                right: -10,
                                opacity: isHovered ? 1 : 0,
                                transition: 'opacity 0.2s'
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: theme.palette.background.paper,
                                    pointerEvents: 'none'
                                }}
                            />
                            <IconCircleChevronRightFilled
                                size={20}
                                color={nodeColor}
                                style={{ pointerEvents: 'none', position: 'relative', zIndex: 1 }}
                            />
                        </Handle>
                    ))}
                </Box>
            </CardWrapper>
        </div>
    )
}

export default memo(GroupNode)

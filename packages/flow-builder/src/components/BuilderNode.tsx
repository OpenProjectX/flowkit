import { memo, useEffect, useRef, useState } from 'react'
import type { NodeProps } from 'reactflow'
import { Handle, NodeToolbar, Position, useUpdateNodeInternals } from 'reactflow'
import { alpha, darken, lighten, styled, useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { Avatar, Box, ButtonGroup, IconButton, Tooltip, Typography } from '@mui/material'
import { MainCard } from '@flowkit/ui-foundation'
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

const getStatusBackgroundColor = (theme: Theme, status?: string) => {
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

const StatusBadge = ({ data }: { data: BuilderNodeData }) => {
    const theme = useTheme()
    if (!data.status) return null
    return (
        <Tooltip title={data.status === 'ERROR' ? (data.error as string) || 'Error' : ''}>
            <Avatar
                variant='rounded'
                sx={{
                    ...(theme.typography as any).smallAvatar,
                    borderRadius: '50%',
                    background:
                        data.status === 'STOPPED' || data.status === 'TERMINATED' ? 'white' : getStatusBackgroundColor(theme, data.status),
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
                    <CancelIcon sx={{ color: getStatusBackgroundColor(theme, data.status) }} />
                ) : data.status === 'STOPPED' ? (
                    <StopCircleIcon sx={{ color: getStatusBackgroundColor(theme, data.status) }} />
                ) : (
                    <IconCheck />
                )}
            </Avatar>
        </Tooltip>
    )
}

const DefaultNodeIcon = ({ data }: { data: BuilderNodeData }) => {
    const theme = useTheme()
    const { config } = useFlowBuilder()
    const color = config.resolveNodeColor?.(data) ?? data.color ?? theme.palette.primary.main

    const custom = config.registry.renderIcon?.(data as never)
    if (custom) {
        return (
            <Box style={{ width: 50 }}>
                <div
                    style={{
                        ...(theme.typography as any).commonAvatar,
                        ...(theme.typography as any).largeAvatar,
                        borderRadius: '15px',
                        cursor: 'grab',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: color
                    }}
                >
                    {custom}
                </div>
            </Box>
        )
    }

    if (data.icon) {
        return (
            <Box style={{ width: 50 }}>
                <div
                    style={{
                        ...(theme.typography as any).commonAvatar,
                        ...(theme.typography as any).largeAvatar,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        cursor: 'grab'
                    }}
                >
                    <img style={{ width: '100%', height: '100%', padding: 5, objectFit: 'contain' }} src={data.icon} alt={data.name} />
                </div>
            </Box>
        )
    }

    return (
        <Box style={{ width: 50 }}>
            <div
                style={{
                    ...(theme.typography as any).commonAvatar,
                    ...(theme.typography as any).largeAvatar,
                    borderRadius: '15px',
                    background: color,
                    cursor: 'grab'
                }}
            />
        </Box>
    )
}

/**
 * Default node card (v2-agentflow look): color-tinted card, hover toolbar
 * (duplicate/delete/info), optional status + warning badges, left target
 * handle, hover-revealed right source handles, optional summary slot.
 */
const BuilderNode = ({ data }: NodeProps<BuilderNodeData>) => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'
    const ref = useRef<HTMLDivElement>(null)
    const updateNodeInternals = useUpdateNodeInternals()
    // eslint-disable-next-line unused-imports/no-unused-vars
    const [position, setPosition] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const { deleteNode, duplicateNode, config } = useFlowBuilder()

    const defaultColor = '#666666'
    const nodeColor = config.resolveNodeColor?.(data) ?? data.color ?? defaultColor
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

    useEffect(() => {
        if (ref.current) {
            setTimeout(() => {
                setPosition((ref.current as any)?.offsetTop + (ref.current?.clientHeight ?? 0) / 2)
                updateNodeInternals(data.id)
            }, 10)
        }
    }, [data, ref, updateNodeInternals])

    const summary = config.renderNodeSummary?.(data)

    return (
        <div ref={ref} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <StyledNodeToolbar>
                <ButtonGroup sx={{ gap: 1 }} variant='outlined' aria-label='node actions'>
                    {(config.canDuplicateNode?.(data) ?? true) && (
                        <IconButton
                            size='small'
                            title='Duplicate'
                            onClick={() => duplicateNode(data.id)}
                            sx={{
                                color: isDarkMode ? 'white' : 'inherit',
                                '&:hover': { color: theme.palette.primary.main }
                            }}
                        >
                            <IconCopy size={20} />
                        </IconButton>
                    )}
                    <IconButton
                        size='small'
                        title='Delete'
                        onClick={() => deleteNode(data.id)}
                        sx={{
                            color: isDarkMode ? 'white' : 'inherit',
                            '&:hover': { color: theme.palette.error.main }
                        }}
                    >
                        <IconTrash size={20} />
                    </IconButton>
                    {config.onNodeInfo && (
                        <IconButton
                            size='small'
                            title='Info'
                            onClick={() => config.onNodeInfo?.(data)}
                            sx={{
                                color: isDarkMode ? 'white' : 'inherit',
                                '&:hover': { color: theme.palette.info.main }
                            }}
                        >
                            <IconInfoCircle size={20} />
                        </IconButton>
                    )}
                </ButtonGroup>
            </StyledNodeToolbar>
            <CardWrapper
                content={false}
                sx={{
                    borderColor: getStateColor(),
                    borderWidth: '1px',
                    boxShadow: data.selected ? `0 0 0 1px ${getStateColor()} !important` : 'none',
                    minHeight: getMinimumHeight(),
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
                <StatusBadge data={data} />

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
                    {/* Generic target handle for anchor-less nodes (v2 style) */}
                    {!data.hideInput && !(data.inputAnchors?.length > 0) && (
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
                        <DefaultNodeIcon data={data} />
                        <Box>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{data.label}</Typography>
                            {summary}
                        </Box>
                    </div>

                    {/* Typed input anchors (v1 style) — one labeled target handle per anchor */}
                    {!data.hideInput &&
                        (data.inputAnchors ?? []).map((inputAnchor) => (
                            <div
                                key={inputAnchor.id}
                                style={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginTop: 4,
                                    padding: '2px 8px',
                                    borderRadius: 6,
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.75)'
                                }}
                            >
                                <Handle
                                    type='target'
                                    position={Position.Left}
                                    id={inputAnchor.id}
                                    style={{
                                        width: 10,
                                        height: 10,
                                        backgroundColor: nodeColor,
                                        border: '2px solid white',
                                        position: 'absolute',
                                        left: -14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        borderRadius: '50%'
                                    }}
                                />
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                    {inputAnchor.label}
                                    {inputAnchor.list ? ' (list)' : ''}
                                </Typography>
                            </div>
                        ))}
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
                                style={{
                                    pointerEvents: 'none',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            />
                        </Handle>
                    ))}
                </Box>
            </CardWrapper>
        </div>
    )
}

export default memo(BuilderNode)

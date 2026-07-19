import { memo, useEffect, useRef, useState } from 'react'
import { useUpdateNodeInternals } from 'reactflow'
import { Avatar, Box, ButtonBase, Dialog, DialogContent, Stack, TextField, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconCheck, IconInfoCircle, IconPencil, IconX } from '@tabler/icons-react'
import type { BuilderNodeData, InputParam } from '../types'
import { useFlowBuilder } from '../FlowBuilderProvider'
import { applyVisibleInputDefaults, showHideInputParams } from '../utils/visibility'
import SchemaFields from './SchemaFields'

/**
 * Node property inspector (dialog edit mode): opens on double-click, renames
 * the node label inline, and renders the node's visible input params through
 * the schema-driven `SchemaFields` with conditional-visibility recomputation.
 */
const PropertyInspectorDialog = () => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'
    const nodeNameRef = useRef<HTMLInputElement>(null)
    const { reactFlowInstance, dialogOpen, setDialogOpen, editNode, setEditNode } = useFlowBuilder()
    const updateNodeInternals = useUpdateNodeInternals()

    const [inputParams, setInputParams] = useState<InputParam[]>([])
    const [data, setData] = useState<BuilderNodeData | null>(null)
    const [isEditingNodeName, setEditingNodeName] = useState(false)
    const [nodeName, setNodeName] = useState('')

    const onCancel = () => {
        setDialogOpen(false)
        setEditNode(null)
    }

    const onNodeLabelChange = () => {
        if (!reactFlowInstance || !data) return
        reactFlowInstance.setNodes((nds) =>
            nds.map((node) => {
                if (node.id === data.id) {
                    node.data = { ...node.data, label: nodeNameRef.current?.value ?? node.data.label }
                    setData(node.data)
                }
                return node
            })
        )
        updateNodeInternals(data.id)
    }

    const onCustomDataChange = ({ inputParam, newValue }: { inputParam: InputParam; newValue: unknown }) => {
        if (!reactFlowInstance || !data) return
        reactFlowInstance.setNodes((nds) =>
            nds.map((node) => {
                if (node.id === data.id) {
                    const updatedInputs = applyVisibleInputDefaults(node.data.inputParams, {
                        ...node.data.inputs,
                        [inputParam.name]: newValue
                    })

                    const updatedInputParams = showHideInputParams({ ...node.data, inputs: updatedInputs })

                    // Remove inputs with display set to false
                    Object.keys(updatedInputs).forEach((key) => {
                        const input = updatedInputParams.find((param) => param.name === key)
                        if (input && input.display === false) {
                            delete updatedInputs[key]
                        }
                    })

                    node.data = {
                        ...node.data,
                        inputParams: updatedInputParams,
                        inputs: updatedInputs
                    }

                    setInputParams(updatedInputParams)
                    setData(node.data)
                }
                return node
            })
        )
    }

    useEffect(() => {
        if (editNode) {
            setData(editNode)
            setInputParams((editNode.inputParams ?? []).filter((inputParam) => !inputParam.hidden))
            if (editNode.label) setNodeName(editNode.label)
        } else {
            setData(null)
            setInputParams([])
        }
        return () => {
            setInputParams([])
            setData(null)
        }
    }, [editNode])

    if (!dialogOpen || !data) return null

    return (
        <Dialog onClose={onCancel} open={dialogOpen} fullWidth maxWidth='sm' aria-labelledby='property-inspector-title'>
            <DialogContent>
                {data.name && (
                    <Box sx={{ width: '100%' }}>
                        {!isEditingNodeName ? (
                            <Stack flexDirection='row' sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography
                                    sx={{ ml: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                    variant='h4'
                                    id='property-inspector-title'
                                >
                                    {nodeName}
                                </Typography>
                                {data.id && (
                                    <ButtonBase title='Edit Name' sx={{ borderRadius: '50%' }}>
                                        <Avatar
                                            variant='rounded'
                                            sx={{
                                                ...(theme.typography as any).commonAvatar,
                                                ...(theme.typography as any).mediumAvatar,
                                                transition: 'all .2s ease-in-out',
                                                ml: 1,
                                                background: theme.palette.secondary.light,
                                                color: theme.palette.secondary.dark,
                                                '&:hover': {
                                                    background: theme.palette.secondary.dark,
                                                    color: theme.palette.secondary.light
                                                }
                                            }}
                                            color='inherit'
                                            onClick={() => setEditingNodeName(true)}
                                        >
                                            <IconPencil stroke={1.5} size='1rem' />
                                        </Avatar>
                                    </ButtonBase>
                                )}
                            </Stack>
                        ) : (
                            <Stack flexDirection='row' sx={{ width: '100%' }}>
                                <TextField
                                    autoFocus
                                    size='small'
                                    sx={{ width: '100%', ml: 2 }}
                                    inputRef={nodeNameRef}
                                    defaultValue={nodeName}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            data.label = nodeNameRef.current?.value ?? data.label
                                            setNodeName(data.label)
                                            onNodeLabelChange()
                                            setEditingNodeName(false)
                                        } else if (e.key === 'Escape') {
                                            setEditingNodeName(false)
                                        }
                                    }}
                                />
                                <ButtonBase title='Save Name' sx={{ borderRadius: '50%' }}>
                                    <Avatar
                                        variant='rounded'
                                        sx={{
                                            ...(theme.typography as any).commonAvatar,
                                            ...(theme.typography as any).mediumAvatar,
                                            transition: 'all .2s ease-in-out',
                                            background: theme.palette.success.light,
                                            color: theme.palette.success.dark,
                                            ml: 1,
                                            '&:hover': {
                                                background: theme.palette.success.dark,
                                                color: theme.palette.success.light
                                            }
                                        }}
                                        color='inherit'
                                        onClick={() => {
                                            data.label = nodeNameRef.current?.value ?? data.label
                                            setNodeName(data.label)
                                            onNodeLabelChange()
                                            setEditingNodeName(false)
                                        }}
                                    >
                                        <IconCheck stroke={1.5} size='1rem' />
                                    </Avatar>
                                </ButtonBase>
                                <ButtonBase title='Cancel' sx={{ borderRadius: '50%' }}>
                                    <Avatar
                                        variant='rounded'
                                        sx={{
                                            ...(theme.typography as any).commonAvatar,
                                            ...(theme.typography as any).mediumAvatar,
                                            transition: 'all .2s ease-in-out',
                                            background: theme.palette.error.light,
                                            color: theme.palette.error.dark,
                                            ml: 1,
                                            '&:hover': {
                                                background: theme.palette.error.dark,
                                                color: theme.palette.error.light
                                            }
                                        }}
                                        color='inherit'
                                        onClick={() => setEditingNodeName(false)}
                                    >
                                        <IconX stroke={1.5} size='1rem' />
                                    </Avatar>
                                </ButtonBase>
                            </Stack>
                        )}
                    </Box>
                )}
                {Boolean(data.hint) && (
                    <Stack
                        direction='row'
                        alignItems='center'
                        sx={{
                            ml: 2,
                            mr: 2,
                            px: 1.5,
                            py: 1,
                            mt: 1,
                            mb: 1,
                            borderRadius: '8px',
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                            border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
                        }}
                    >
                        <IconInfoCircle size='1rem' stroke={1.5} color={theme.palette.info.main} style={{ marginRight: '6px' }} />
                        <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic', lineHeight: 1.2 }}>
                            {data.hint as string}
                        </Typography>
                    </Stack>
                )}
                <SchemaFields data={data} inputParams={inputParams} onDataChange={onCustomDataChange} />
            </DialogContent>
        </Dialog>
    )
}

export default memo(PropertyInspectorDialog)

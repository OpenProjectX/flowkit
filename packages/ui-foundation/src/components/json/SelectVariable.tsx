import { Box, List, ListItemButton, ListItem, ListItemAvatar, ListItemText, Typography, Stack } from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { AvailableVariableNode } from './getAvailableNodesForVariable'

import 'react-perfect-scrollbar/dist/css/styles.css'

const sequentialStateMessagesSelection = [
    {
        primary: '$flow.state.messages',
        secondary: `All messages from the start of the conversation till now`
    },
    {
        primary: '$flow.state.<replace-with-key>',
        secondary: `Current value of the state variable with specified key`
    },
    {
        primary: '$flow.state.messages[0].content',
        secondary: `First message content`
    },
    {
        primary: '$flow.state.messages[-1].content',
        secondary: `Last message content`
    }
]

export interface SelectVariableProps {
    availableNodesForVariable?: AvailableVariableNode[]
    disabled?: boolean
    onSelectAndReturnVal?: (value: string) => void
    isSequentialAgent?: boolean
    /** Replaces Flowise's `customization.borderRadius` (Flowise default: 12) */
    borderRadius?: number
    /** Resolves a node's icon URL (replaces Flowise's `${baseURL}/api/v1/node-icon/${name}`) */
    getNodeIcon?: (nodeName: string) => string
    /** Icon URL for the `question` entry (Flowise bundles a robot png) */
    questionIcon?: string
    /** Icon URL for the `chat_history` entry (Flowise bundles a chat-history png) */
    chatHistoryIcon?: string
    /** Icon URL for the `file_attachment` entry (Flowise bundles a file-attachment png) */
    fileAttachmentIcon?: string
    /** Icon URL for sequential-agent state entries (Flowise bundles a floppy-disc png) */
    stateIcon?: string
}

export const SelectVariable = ({
    availableNodesForVariable,
    disabled = false,
    onSelectAndReturnVal,
    isSequentialAgent,
    borderRadius = 12,
    getNodeIcon,
    questionIcon,
    chatHistoryIcon,
    fileAttachmentIcon,
    stateIcon
}: SelectVariableProps) => {
    const onSelectOutputResponseClick = (node: AvailableVariableNode | null, prefix?: string) => {
        const variablePath = node ? `${node.id}.data.instance` : prefix
        const newInput = `{{${variablePath}}}`
        onSelectAndReturnVal?.(newInput)
    }

    const renderAvatar = (iconSrc: string | undefined, alt: string) => (
        <ListItemAvatar>
            <div
                style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    backgroundColor: 'white'
                }}
            >
                {iconSrc && (
                    <img
                        style={{
                            width: '100%',
                            height: '100%',
                            padding: 10,
                            objectFit: 'contain'
                        }}
                        alt={alt}
                        src={iconSrc}
                    />
                )}
            </div>
        </ListItemAvatar>
    )

    return (
        <>
            {!disabled && (
                <div style={{ flex: 30 }}>
                    <Stack flexDirection='row' sx={{ mb: 1, ml: 2, mt: 2 }}>
                        <Typography variant='h5'>Select Variable</Typography>
                    </Stack>
                    <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 220px)', overflowX: 'hidden' }}>
                        <Box sx={{ pl: 2, pr: 2 }}>
                            <List>
                                <ListItemButton
                                    sx={{
                                        p: 0,
                                        borderRadius: `${borderRadius}px`,
                                        boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                                        mb: 1
                                    }}
                                    disabled={disabled}
                                    onClick={() => onSelectOutputResponseClick(null, 'question')}
                                >
                                    <ListItem alignItems='center'>
                                        {renderAvatar(questionIcon, 'AI')}
                                        <ListItemText sx={{ ml: 1 }} primary='question' secondary={`User's question from chatbox`} />
                                    </ListItem>
                                </ListItemButton>
                                <ListItemButton
                                    sx={{
                                        p: 0,
                                        borderRadius: `${borderRadius}px`,
                                        boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                                        mb: 1
                                    }}
                                    disabled={disabled}
                                    onClick={() => onSelectOutputResponseClick(null, 'chat_history')}
                                >
                                    <ListItem alignItems='center'>
                                        {renderAvatar(chatHistoryIcon, 'chatHistory')}
                                        <ListItemText
                                            sx={{ ml: 1 }}
                                            primary='chat_history'
                                            secondary={`Past conversation history between user and AI`}
                                        />
                                    </ListItem>
                                </ListItemButton>
                                <ListItemButton
                                    sx={{
                                        p: 0,
                                        borderRadius: `${borderRadius}px`,
                                        boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                                        mb: 1
                                    }}
                                    disabled={disabled}
                                    onClick={() => onSelectOutputResponseClick(null, 'file_attachment')}
                                >
                                    <ListItem alignItems='center'>
                                        {renderAvatar(fileAttachmentIcon, 'fileAttachment')}
                                        <ListItemText
                                            sx={{ ml: 1 }}
                                            primary='file_attachment'
                                            secondary={`Files uploaded from the chat when Full File Upload is enabled on the Configuration`}
                                        />
                                    </ListItem>
                                </ListItemButton>
                                {availableNodesForVariable &&
                                    availableNodesForVariable.length > 0 &&
                                    availableNodesForVariable.map((node, index) => {
                                        const selectedOutputAnchor =
                                            (node.data.outputAnchors?.length &&
                                                node.data.outputAnchors[0].options &&
                                                node.data.outputAnchors[0].options.find(
                                                    (ancr) => ancr.name === node.data.outputs?.['output']
                                                )) ||
                                            undefined
                                        return (
                                            <ListItemButton
                                                key={index}
                                                sx={{
                                                    p: 0,
                                                    borderRadius: `${borderRadius}px`,
                                                    boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                                                    mb: 1
                                                }}
                                                disabled={disabled}
                                                onClick={() => onSelectOutputResponseClick(node)}
                                            >
                                                <ListItem alignItems='center'>
                                                    {renderAvatar(
                                                        getNodeIcon && node.data.name ? getNodeIcon(node.data.name) : undefined,
                                                        node.data.name ?? ''
                                                    )}
                                                    <ListItemText
                                                        sx={{ ml: 1 }}
                                                        primary={
                                                            node.data.inputs?.chainName ??
                                                            node.data.inputs?.functionName ??
                                                            node.data.inputs?.variableName ??
                                                            node.data.id
                                                        }
                                                        secondary={
                                                            node.data.name === 'ifElseFunction'
                                                                ? `${node.data.description}`
                                                                : `${selectedOutputAnchor?.label ?? 'output'} from ${node.data.label}`
                                                        }
                                                    />
                                                </ListItem>
                                            </ListItemButton>
                                        )
                                    })}
                                {isSequentialAgent &&
                                    (sequentialStateMessagesSelection || []).map((item, index) => (
                                        <ListItemButton
                                            key={index}
                                            sx={{
                                                p: 0,
                                                borderRadius: `${borderRadius}px`,
                                                boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)',
                                                mb: 1
                                            }}
                                            disabled={disabled}
                                            onClick={() => onSelectAndReturnVal?.(item.primary)}
                                        >
                                            <ListItem alignItems='center'>
                                                {renderAvatar(stateIcon, 'state')}
                                                <ListItemText sx={{ ml: 1 }} primary={item.primary} secondary={item.secondary} />
                                            </ListItem>
                                        </ListItemButton>
                                    ))}
                            </List>
                        </Box>
                    </PerfectScrollbar>
                </div>
            )}
        </>
    )
}

export default SelectVariable

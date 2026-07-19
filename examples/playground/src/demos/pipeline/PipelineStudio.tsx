import { useMemo } from 'react'
import { Box, Button, Typography } from '@mui/material'
import {
    FlowBuilderCanvas,
    FlowBuilderProvider,
    typedPortsIsValidConnection,
    useFlowBuilder,
    parseFlowDocument
} from '@openprojectx/flow-builder'
import type { FlowBuilderConfig, FlowDocument } from '@openprojectx/flow-builder'
import '@openprojectx/flow-builder/styles.css'
import { pipelineOperators } from './operators'

const STORAGE_KEY = 'flowkit.pipeline'

/**
 * The whole point of the kit: a working builder for a NEW domain in ~80 lines.
 * Static registry + typed ports + default node/edge/forms; the only custom
 * code is persistence (localStorage) and the header slot.
 */
const PipelineStudio = () => {
    const config = useMemo<FlowBuilderConfig>(
        () => ({
            registry: {
                list: async () => pipelineOperators,
                renderIcon: (node) => <span style={{ fontSize: 20 }}>{node.icon}</span>
            },
            // Typed ports: Record[] producers may only feed Record[] consumers
            isValidConnection: typedPortsIsValidConnection,
            // v1-style type-signed output handles (`-output-<name>-Record[]`)
            outputStrategy: 'standard',
            initialFlow: parseFlowDocument(localStorage.getItem(STORAGE_KEY) ?? '') ?? undefined,
            onSave: (doc: FlowDocument) => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
            },
            features: { minimap: true, stickyNote: false },
            slots: { header: <PipelineHeader /> }
        }),
        []
    )

    return (
        <FlowBuilderProvider config={config}>
            <FlowBuilderCanvas />
        </FlowBuilderProvider>
    )
}

const PipelineHeader = () => {
    const { saveFlow, isDirty } = useFlowBuilder()
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                Data Pipeline Studio
            </Typography>
            <Typography variant='caption' color='text.secondary'>
                drag operators from the palette · typed ports only connect Record[] → Record[]
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {isDirty && (
                <Typography variant='caption' color='warning.main'>
                    unsaved changes
                </Typography>
            )}
            <Button size='small' variant='contained' onClick={() => saveFlow()}>
                Save
            </Button>
        </Box>
    )
}

export default PipelineStudio

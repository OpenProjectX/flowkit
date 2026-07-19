import { useMemo, useState } from 'react'
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material'
import { FlowBuilderCanvas, FlowBuilderProvider, defaultIsValidConnection, parseFlowDocument, useFlowBuilder } from '@flowkit/flow-builder'
import type { FlowBuilderConfig, FlowDocument } from '@flowkit/flow-builder'
import '@flowkit/flow-builder/styles.css'
import { bpmnElements } from './elements'
import { BpmnEndNode, BpmnGatewayNode, BpmnStartNode, BpmnTaskNode } from './nodes'

const STORAGE_KEY = 'flowkit.bpmn'

/** Map a saved document to a BPMN-ish structure, just to prove custom serialization. */
const toBpmnJson = (doc: FlowDocument) => ({
    definitions: {
        elements: doc.nodes.map((node) => ({
            id: node.id,
            type: (node.data as any).name,
            label: (node.data as any).label,
            position: node.position
        })),
        sequenceFlows: doc.edges.map((edge) => ({
            id: edge.id,
            sourceRef: edge.source,
            targetRef: edge.target,
            label: (edge.data as any)?.edgeLabel
        }))
    }
})

/**
 * Same kit, different domain: BPMN shapes via `nodeRenderers`, sequence-flow
 * rules via `isValidConnection`, singleton start event via `validateDrop`,
 * gateway branch labels via `resolveEdgeLabel`.
 */
const BpmnBuilder = () => {
    const config = useMemo<FlowBuilderConfig>(
        () => ({
            registry: {
                list: async () => bpmnElements
            },
            nodeRenderers: {
                bpmnStart: BpmnStartNode,
                bpmnEnd: BpmnEndNode,
                bpmnTask: BpmnTaskNode,
                bpmnGateway: BpmnGatewayNode
            },
            resolveNodeType: (schema) => {
                switch (schema.bpmn) {
                    case 'start':
                        return 'bpmnStart'
                    case 'end':
                        return 'bpmnEnd'
                    case 'gateway':
                        return 'bpmnGateway'
                    default:
                        return 'bpmnTask'
                }
            },
            isValidConnection: (connection, nodes, edges) => {
                const source = nodes.find((n) => n.id === connection.source)
                const target = nodes.find((n) => n.id === connection.target)
                if (!source || !target) return false
                if (target.type === 'bpmnStart') return false // nothing flows INTO a start event
                if (source.type === 'bpmnEnd') return false // nothing flows OUT of an end event
                return defaultIsValidConnection(connection, nodes, edges)
            },
            validateDrop: (schema, { nodes }) =>
                schema.name === 'startEvent' && nodes.some((n) => n.data.name === 'startEvent')
                    ? 'Only one Start Event is allowed'
                    : undefined,
            resolveEdgeLabel: (connection) => {
                if (!connection.sourceHandle?.startsWith('exclusiveGateway')) return undefined
                if (connection.sourceHandle.endsWith('-output-0')) return 'yes'
                if (connection.sourceHandle.endsWith('-output-1')) return 'no'
                return undefined
            },
            initialFlow: parseFlowDocument(localStorage.getItem(STORAGE_KEY) ?? '') ?? undefined,
            onSave: (doc) => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
            },
            features: { minimap: true },
            slots: { header: <BpmnHeader /> }
        }),
        []
    )

    return (
        <FlowBuilderProvider config={config}>
            <FlowBuilderCanvas />
        </FlowBuilderProvider>
    )
}

const BpmnHeader = () => {
    const { saveFlow, isDirty } = useFlowBuilder()
    const [exportDoc, setExportDoc] = useState<FlowDocument | null>(null)

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                BPMN Builder
            </Typography>
            <Typography variant='caption' color='text.secondary'>
                custom shapes · sequence-flow rules · gateway branch labels
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {isDirty && (
                <Typography variant='caption' color='warning.main'>
                    unsaved changes
                </Typography>
            )}
            <Button size='small' variant='outlined' onClick={async () => setExportDoc(await saveFlow())}>
                Export BPMN JSON
            </Button>
            <Button size='small' variant='contained' onClick={() => saveFlow()}>
                Save
            </Button>
            <Dialog open={exportDoc !== null} onClose={() => setExportDoc(null)} fullWidth maxWidth='sm'>
                <DialogContent>
                    <Typography variant='h5' sx={{ mb: 1 }}>
                        BPMN-ish export
                    </Typography>
                    <Box component='pre' sx={{ fontSize: '0.75rem', overflow: 'auto', maxHeight: 400 }}>
                        {exportDoc ? JSON.stringify(toBpmnJson(exportDoc), null, 2) : ''}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    )
}

export default BpmnBuilder

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Edge, ReactFlowInstance } from 'reactflow'
import { ReactFlowProvider } from 'reactflow'
import { cloneDeep, isEqual } from 'lodash'
import type {
    BuilderNode,
    BuilderNodeData,
    BuilderNodeStatus,
    FlowBuilderConfig,
    FlowBuilderContextValue,
    FlowDocument,
    InputParam
} from './types'
import { getUniqueNodeId } from './utils/graph'
import { showHideInputParams } from './utils/visibility'
import { defaultSerialize } from './utils/serialize'

const FlowBuilderContext = createContext<FlowBuilderContextValue | null>(null)

/** Escape a string for safe use inside a RegExp. */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Reference convention shared with Flowise: a connected input holds the string
 * `{{sourceNodeId.data.instance}}` (or `{{sourceNodeId.<anything>}}`), and list
 * inputs hold an array of such strings. The default disconnect logic below only
 * acts on values matching that convention, so consumers that never write refs
 * are unaffected. Override via `config.refScrubber` for full control.
 */
const refRegexFor = (sourceNodeId: string) => new RegExp(`\\{\\{${escapeRegExp(sourceNodeId)}\\.[^}]*\\}\\}`)

const isRefString = (value: unknown): value is string => typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')

export interface FlowBuilderProviderProps {
    config: FlowBuilderConfig
    children: ReactNode
}

/**
 * Holds the React Flow instance and exposes graph mutations (delete /
 * duplicate / data change / status badges) plus dirty + dialog state.
 * Mounted once per builder; the canvas registers its instance via onInit.
 */
export const FlowBuilderProvider = ({ config, children }: FlowBuilderProviderProps) => {
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
    const [isDirty, setIsDirty] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editNode, setEditNode] = useState<BuilderNodeData | null>(null)

    const setDirty = useCallback(
        (dirty = true) => {
            setIsDirty((prev) => {
                if (prev !== dirty) config.onDirtyChange?.(dirty)
                return dirty
            })
        },
        [config]
    )

    const getInstance = useCallback((): ReactFlowInstance => {
        if (!reactFlowInstance) throw new Error('[flowkit] React Flow instance is not initialized yet')
        return reactFlowInstance
    }, [reactFlowInstance])

    const setNodeStatus = useCallback(
        ({ nodeId, status, error }: { nodeId: string; status: BuilderNodeStatus | undefined; error?: string }) => {
            getInstance().setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === nodeId) {
                        node.data = { ...node.data, status, error }
                    }
                    return node
                })
            )
        },
        [getInstance]
    )

    const clearNodeStatuses = useCallback(() => {
        getInstance().setNodes((nds) =>
            nds.map((node) => {
                node.data = { ...node.data, status: undefined, error: undefined }
                return node
            })
        )
    }, [getInstance])

    const onNodeDataChange = useCallback(
        ({ nodeId, inputParam, newValue }: { nodeId: string; inputParam: InputParam; newValue: unknown }) => {
            const instance = getInstance()
            const updatedNodes = instance.getNodes().map((node) => {
                if (node.id === nodeId) {
                    const updatedInputs: Record<string, unknown> = { ...node.data.inputs }
                    updatedInputs[inputParam.name] = newValue

                    const updatedInputParams = showHideInputParams({ ...node.data, inputs: updatedInputs })

                    // Remove inputs with display set to false
                    Object.keys(updatedInputs).forEach((key) => {
                        const input = updatedInputParams.find((param) => param.name === key)
                        if (input && input.display === false) {
                            delete updatedInputs[key]
                        }
                    })

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            inputParams: updatedInputParams,
                            inputs: updatedInputs
                        }
                    }
                }
                return node
            })

            // Only setNodes when inputParams actually changed
            const hasChanges = updatedNodes.some(
                (node, index) => !isEqual(node.data.inputParams, instance.getNodes()[index].data.inputParams)
            )

            if (hasChanges) {
                instance.setNodes(updatedNodes)
            }
        },
        [getInstance]
    )

    /**
     * After an edge disappears (or its source node is deleted), scrub the
     * target node's input that recorded the connection. Default implements the
     * `{{ref}}` convention; `config.refScrubber` replaces it entirely.
     */
    const deleteConnectedInput = useCallback(
        (id: string, type: 'node' | 'edge') => {
            const instance = getInstance()
            const connectedEdges =
                type === 'node'
                    ? instance.getEdges().filter((edge) => edge.source === id)
                    : instance.getEdges().filter((edge) => edge.id === id)

            for (const edge of connectedEdges) {
                const targetNodeId = edge.target
                const sourceNodeId = edge.source
                const targetInput = edge.targetHandle?.split('-')[2]
                if (!targetInput) continue

                instance.setNodes((nds) => {
                    if (config.refScrubber) {
                        return config.refScrubber(nds as BuilderNode[], sourceNodeId) as typeof nds
                    }
                    return nds.map((node) => {
                        if (node.id === targetNodeId) {
                            let value: unknown
                            const inputAnchor = node.data.inputAnchors?.find((ancr: InputParam) => ancr.name === targetInput)
                            const inputParam = node.data.inputParams?.find((param: InputParam) => param.name === targetInput)

                            if (inputAnchor && inputAnchor.list) {
                                const values = (node.data.inputs[targetInput] as string[] | undefined) || []
                                value = values.filter((item) => !item.includes(sourceNodeId))
                            } else if (inputParam && inputParam.acceptVariable) {
                                const current = (node.data.inputs[targetInput] as string | undefined) ?? ''
                                value = current.replace(refRegexFor(sourceNodeId), '') || ''
                            } else {
                                value = ''
                            }
                            node.data = {
                                ...node.data,
                                inputs: {
                                    ...node.data.inputs,
                                    [targetInput]: value
                                }
                            }
                        }
                        return node
                    })
                })
            }
        },
        [getInstance, config]
    )

    const deleteNode = useCallback(
        (nodeid: string) => {
            const instance = getInstance()
            deleteConnectedInput(nodeid, 'node')

            // Gather the node and all its descendants (group children)
            const nodesToDelete = new Set<string>()
            const collectDescendants = (parentId: string) => {
                const childNodes = instance.getNodes().filter((node) => node.parentNode === parentId)
                childNodes.forEach((childNode) => {
                    nodesToDelete.add(childNode.id)
                    collectDescendants(childNode.id)
                })
            }
            collectDescendants(nodeid)
            nodesToDelete.add(nodeid)

            nodesToDelete.forEach((id) => {
                if (id !== nodeid) deleteConnectedInput(id, 'node')
            })

            instance.setNodes((nodes) => nodes.filter((node) => !nodesToDelete.has(node.id)))
            instance.setEdges((edges) => edges.filter((edge) => !nodesToDelete.has(edge.source) && !nodesToDelete.has(edge.target)))

            setDirty()
        },
        [getInstance, deleteConnectedInput, setDirty]
    )

    const deleteEdge = useCallback(
        (edgeid: string) => {
            const instance = getInstance()
            deleteConnectedInput(edgeid, 'edge')
            instance.setEdges(instance.getEdges().filter((edge) => edge.id !== edgeid))
            setDirty()
        },
        [getInstance, deleteConnectedInput, setDirty]
    )

    const duplicateNode = useCallback(
        (id: string, distance = 50) => {
            const instance = getInstance()
            const nodes = instance.getNodes()
            const originalNode = nodes.find((n) => n.id === id)
            if (!originalNode) return

            const newNodeId = getUniqueNodeId(originalNode.data, nodes)
            const clonedNode = cloneDeep(originalNode)

            const duplicatedNode = {
                ...clonedNode,
                id: newNodeId,
                position: {
                    x: clonedNode.position.x + (clonedNode.width ?? 0) + distance,
                    y: clonedNode.position.y
                },
                positionAbsolute: {
                    x: (clonedNode.positionAbsolute?.x ?? clonedNode.position.x) + (clonedNode.width ?? 0) + distance,
                    y: clonedNode.positionAbsolute?.y ?? clonedNode.position.y
                },
                data: {
                    ...clonedNode.data,
                    id: newNodeId,
                    label: clonedNode.data.label + ` (${newNodeId.split('_').pop()})`
                },
                selected: false
            }

            for (const key of ['inputParams', 'inputAnchors'] as const) {
                for (const item of duplicatedNode.data[key] ?? []) {
                    if (item.id) {
                        item.id = item.id.replace(id, newNodeId)
                    }
                }
            }

            for (const item of duplicatedNode.data.outputAnchors ?? []) {
                if (item.id) {
                    item.id = item.id.replace(id, newNodeId)
                }
                if (item.options) {
                    for (const output of item.options) {
                        if (output.id) output.id = output.id.replace(id, newNodeId)
                    }
                }
            }

            // Clear connected inputs (refs to other nodes must not survive duplication)
            for (const inputName in duplicatedNode.data.inputs) {
                const inputValue = duplicatedNode.data.inputs[inputName]
                if (isRefString(inputValue)) {
                    duplicatedNode.data.inputs[inputName] = ''
                } else if (Array.isArray(inputValue)) {
                    duplicatedNode.data.inputs[inputName] = inputValue.filter((item) => !isRefString(item))
                }
            }

            instance.setNodes([...nodes, duplicatedNode])
            setDirty()
        },
        [getInstance, setDirty]
    )

    const saveFlow = useCallback(async (): Promise<FlowDocument> => {
        const instance = getInstance()
        const serialize = config.serialize ?? defaultSerialize
        const doc = serialize(instance)
        await config.onSave?.(doc)
        setDirty(false)
        return doc
    }, [getInstance, config, setDirty])

    const loadFlow = useCallback(
        (doc: FlowDocument) => {
            const instance = getInstance()
            const deserialized = config.deserialize
                ? config.deserialize(doc)
                : { nodes: doc.nodes, edges: doc.edges, viewport: doc.viewport }
            instance.setNodes((deserialized.nodes ?? []) as never)
            instance.setEdges((deserialized.edges ?? []) as never)
            if (deserialized.viewport) {
                instance.setViewport(deserialized.viewport)
            }
            setDirty()
        },
        [getInstance, config, setDirty]
    )

    const value = useMemo<FlowBuilderContextValue>(
        () => ({
            reactFlowInstance,
            setReactFlowInstance,
            get nodes() {
                return (reactFlowInstance?.getNodes() ?? []) as BuilderNode[]
            },
            get edges() {
                return (reactFlowInstance?.getEdges() ?? []) as Edge[]
            },
            isDirty,
            setDirty,
            deleteNode,
            deleteEdge,
            duplicateNode,
            onNodeDataChange,
            setNodeStatus,
            clearNodeStatuses,
            dialogOpen,
            setDialogOpen,
            editNode,
            setEditNode,
            saveFlow,
            loadFlow,
            config
        }),
        [
            reactFlowInstance,
            isDirty,
            setDirty,
            deleteNode,
            deleteEdge,
            duplicateNode,
            onNodeDataChange,
            setNodeStatus,
            clearNodeStatuses,
            dialogOpen,
            editNode,
            saveFlow,
            loadFlow,
            config
        ]
    )

    return (
        <ReactFlowProvider>
            <FlowBuilderContext.Provider value={value}>{children}</FlowBuilderContext.Provider>
        </ReactFlowProvider>
    )
}

/** Access the builder context. Throws when used outside a FlowBuilderProvider. */
export const useFlowBuilder = (): FlowBuilderContextValue => {
    const ctx = useContext(FlowBuilderContext)
    if (!ctx) throw new Error('[flowkit] useFlowBuilder must be used within a FlowBuilderProvider')
    return ctx
}

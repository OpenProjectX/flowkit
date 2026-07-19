import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import ReactFlow, { addEdge, Background, Controls, MiniMap, useEdgesState, useNodesState } from 'reactflow'
import type { Connection, Edge, Node } from 'reactflow'
import 'reactflow/dist/style.css'
import './styles.css'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useSnackbar } from 'notistack'
import { IconArtboard, IconArtboardOff, IconMagnetFilled, IconMagnetOff } from '@tabler/icons-react'
import type { BuilderNode, BuilderNodeData, BuilderNodeSchema, FlowDocument } from './types'
import { useFlowBuilder } from './FlowBuilderProvider'
import BuilderNodeComponent from './components/BuilderNode'
import StickyNote from './components/StickyNote'
import GroupNode from './components/GroupNode'
import BuilderEdge from './components/BuilderEdge'
import BuilderConnectionLine from './components/BuilderConnectionLine'
import NodePalette from './components/NodePalette'
import PropertyInspectorDialog from './components/PropertyInspectorDialog'
import { getUniqueNodeId, getUniqueNodeLabel, initNode } from './utils/graph'
import { defaultIsValidConnection } from './utils/handles'
import { parseFlowDocument } from './utils/serialize'

const DEFAULT_NODE_TYPE = 'builderNode'
const DEFAULT_EDGE_TYPE = 'builderEdge'

const defaultResolveNodeType = (schema: BuilderNodeSchema): string => {
    if (schema.type === 'StickyNote') return 'stickyNote'
    if (schema.type === 'Group') return 'groupNode'
    return DEFAULT_NODE_TYPE
}

export interface FlowBuilderCanvasProps {
    /** Rendered inside the ReactFlow pane (floating). Prefer `config.slots`. */
    children?: React.ReactNode
}

/**
 * The builder canvas. Renders the React Flow pane with drop-from-palette,
 * typed connections, selection, group parenting, controls (snap/background),
 * MiniMap, sticky notes and the node palette — all driven by the
 * `FlowBuilderConfig` held by the enclosing `FlowBuilderProvider`.
 */
export const FlowBuilderCanvas = ({ children }: FlowBuilderCanvasProps) => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'
    const { enqueueSnackbar } = useSnackbar()
    const { reactFlowInstance, setReactFlowInstance, setDirty, dialogOpen, setDialogOpen, setEditNode, loadFlow, config } = useFlowBuilder()

    const features = config.features ?? {}
    const resolveNodeType = config.resolveNodeType ?? defaultResolveNodeType
    const edgeType = config.edgeType ?? DEFAULT_EDGE_TYPE

    const nodeTypes = useMemo(
        () => ({
            [DEFAULT_NODE_TYPE]: BuilderNodeComponent,
            stickyNote: StickyNote,
            groupNode: GroupNode,
            ...config.nodeRenderers
        }),
        [config.nodeRenderers]
    )
    const edgeTypes = useMemo(() => ({ [DEFAULT_EDGE_TYPE]: BuilderEdge, ...config.edgeRenderers }), [config.edgeRenderers])

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [isSnappingEnabled, setIsSnappingEnabled] = useState(false)
    const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(true)
    const [paletteNodes, setPaletteNodes] = useState<BuilderNodeSchema[]>([])

    const reactFlowWrapper = useRef<HTMLDivElement>(null)

    /* ------------------------------ registry ------------------------------ */
    useEffect(() => {
        let mounted = true
        config.registry
            .list()
            .then((list) => {
                if (mounted) setPaletteNodes(list)
            })
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.error('[flowkit] registry.list() failed', err)
            })
        return () => {
            mounted = false
        }
    }, [config.registry])

    /* --------------------------- initial document -------------------------- */
    const initialFlowRef = useRef<FlowDocument | undefined>(config.initialFlow)
    useEffect(() => {
        if (initialFlowRef.current) {
            const doc = initialFlowRef.current
            setNodes((doc.nodes ?? []) as Node<BuilderNodeData>[])
            setEdges((doc.edges ?? []) as Edge[])
            setDirty(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /* ----------------------------- interactions ---------------------------- */

    const onConnect = useCallback(
        (params: Connection) => {
            const instance = reactFlowInstance
            if (!instance) return

            const isValid = config.isValidConnection
                ? config.isValidConnection(params, instance.getNodes() as BuilderNode[], instance.getEdges())
                : defaultIsValidConnection(params, instance.getNodes() as BuilderNode[], instance.getEdges())
            if (!isValid) return

            const sourceNode = instance.getNodes().find((node) => node.id === params.source)
            const targetNode = instance.getNodes().find((node) => node.id === params.target)

            const resolveColor = (node?: Node<BuilderNodeData>) =>
                node ? config.resolveNodeColor?.(node.data) ?? node.data.color ?? theme.palette.primary.main : theme.palette.primary.main

            // Edges between children of the same group render above the group
            const isWithinGroup = sourceNode?.parentNode && targetNode?.parentNode && sourceNode.parentNode === targetNode.parentNode

            const newEdge: Edge = {
                ...params,
                data: {
                    ...((params as any).data ?? {}),
                    sourceColor: resolveColor(sourceNode),
                    targetColor: resolveColor(targetNode),
                    edgeLabel: config.resolveEdgeLabel?.(params)
                },
                ...(isWithinGroup ? { zIndex: 9999 } : {}),
                type: edgeType,
                id: `${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`
            } as Edge
            setEdges((eds) => addEdge(newEdge, eds))

            // Let the consumer record the connection on the target node's inputs
            if (config.onConnectInput && targetNode) {
                instance.setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === params.target) {
                            const anchor = [...(node.data.inputAnchors ?? []), ...(node.data.inputParams ?? [])].find(
                                (a) => a.id === params.targetHandle
                            )
                            if (anchor) config.onConnectInput!(node.data, anchor, params.source!)
                        }
                        return node
                    })
                )
            }
            setDirty()
        },
        [reactFlowInstance, config, edgeType, setEdges, setDirty, theme]
    )

    const onNodeClick = useCallback(
        (_event: React.MouseEvent, clickedNode: Node<BuilderNodeData>) => {
            setNodes((nds) =>
                nds.map((node) => {
                    node.data = { ...node.data, selected: node.id === clickedNode.id }
                    return node
                })
            )
        },
        [setNodes]
    )

    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault()
            const instance = reactFlowInstance
            if (!instance || !reactFlowWrapper.current) return
            if (features.readOnly) return

            const raw = event.dataTransfer.getData('application/reactflow')
            if (typeof raw === 'undefined' || !raw) return

            const nodeData = JSON.parse(raw) as BuilderNodeSchema
            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
            const position = instance.project({
                x: event.clientX - reactFlowBounds.left - 100,
                y: event.clientY - reactFlowBounds.top - 50
            })
            const currentNodes = instance.getNodes()

            // Drop-inside-group detection (groupNodes feature)
            let parentGroup: BuilderNode | null = null
            if (features.groupNodes) {
                for (const node of currentNodes) {
                    if (node.type !== 'groupNode') continue
                    const nodeWidth = node.width || 300
                    const nodeHeight = node.height || 250
                    const nodeLeft = node.position.x
                    const nodeRight = nodeLeft + nodeWidth
                    const nodeTop = node.position.y
                    const nodeBottom = nodeTop + nodeHeight
                    if (position.x >= nodeLeft && position.x <= nodeRight && position.y >= nodeTop && position.y <= nodeBottom) {
                        parentGroup = node as BuilderNode
                        break
                    }
                }
            }

            // Consumer validation (singleton rules, group membership rules, ...)
            const rejection = config.validateDrop?.(nodeData, { nodes: currentNodes as BuilderNode[], parentGroup })
            if (rejection) {
                enqueueSnackbar(rejection, { variant: 'error', persist: true })
                return
            }

            const newNodeId = getUniqueNodeId(nodeData, currentNodes)
            const newNodeLabel = getUniqueNodeLabel(nodeData, currentNodes)

            const newNode: Node<BuilderNodeData> = {
                id: newNodeId,
                position,
                data: {
                    ...initNode(nodeData, newNodeId, {
                        isConnectionParam: config.isConnectionParam,
                        outputStrategy: config.outputStrategy
                    }),
                    id: newNodeId,
                    label: newNodeLabel
                } as BuilderNodeData,
                type: resolveNodeType(nodeData)
            }

            if (parentGroup) {
                newNode.parentNode = parentGroup.id
                newNode.extent = 'parent'
                newNode.position = {
                    x: position.x - parentGroup.position.x,
                    y: position.y - parentGroup.position.y
                }
            }

            setNodes((nds) =>
                (nds ?? []).concat(newNode).map((node) => {
                    node.data = { ...node.data, selected: node.id === newNode.id }
                    return node
                })
            )
            setTimeout(() => setDirty(), 0)
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [reactFlowInstance, config, features.groupNodes, resolveNodeType]
    )

    const onNodeDoubleClick = useCallback(
        (_event: React.MouseEvent, node: Node<BuilderNodeData>) => {
            if (!node || !node.data) return
            if (config.nodeEditMode === 'inline') return
            if (features.readOnly) return
            if (node.type === 'stickyNote') return
            setEditNode(node.data)
            setDialogOpen(true)
        },
        [config.nodeEditMode, features.readOnly, setDialogOpen, setEditNode]
    )

    /* ------------------------- paste-to-load (import) ---------------------- */
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const pasteData = e.clipboardData?.getData('text') ?? ''
            if (pasteData.includes('{"nodes":[') && pasteData.includes('],"edges":[')) {
                const doc = parseFlowDocument(pasteData)
                if (doc) loadFlow(doc)
            }
        }
        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const showPalette = features.palette !== false && !features.readOnly

    // Palette filtering: feature flags + consumer filter compose
    const paletteFilter = useMemo(() => {
        const filters: ((n: BuilderNodeSchema) => boolean)[] = []
        if (features.stickyNote === false) filters.push((n) => n.type !== 'StickyNote')
        if (features.groupNodes === false) filters.push((n) => resolveNodeType(n) !== 'groupNode')
        if (config.paletteFilter) filters.push(config.paletteFilter)
        return filters.length ? (n: BuilderNodeSchema) => filters.every((f) => f(n)) : undefined
    }, [features.stickyNote, features.groupNodes, config.paletteFilter, resolveNodeType])

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            {config.slots?.header}
            <div className='flowkit-parent-wrapper'>
                <div className='reactflow-wrapper' ref={reactFlowWrapper} style={{ height: '100%', width: '100%' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onNodeClick={onNodeClick}
                        onNodeDoubleClick={onNodeDoubleClick}
                        onEdgesChange={onEdgesChange}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeDragStop={() => setDirty()}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        fitView
                        deleteKeyCode={dialogOpen || features.readOnly ? null : ['Delete']}
                        minZoom={features.minZoom ?? 0.5}
                        snapGrid={[25, 25]}
                        snapToGrid={isSnappingEnabled}
                        connectionLineComponent={BuilderConnectionLine}
                        nodesDraggable={!features.readOnly}
                        nodesConnectable={!features.readOnly}
                        elementsSelectable={!features.readOnly}
                        className='flowkit-canvas'
                    >
                        <Controls
                            className={isDarkMode ? 'flowkit-dark-controls' : ''}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {features.snapping !== false && (
                                <button
                                    className='react-flow__controls-button react-flow__controls-interactive'
                                    onClick={() => setIsSnappingEnabled(!isSnappingEnabled)}
                                    title='toggle snapping'
                                    aria-label='toggle snapping'
                                >
                                    {isSnappingEnabled ? <IconMagnetFilled /> : <IconMagnetOff />}
                                </button>
                            )}
                            {features.backgroundDots !== false && (
                                <button
                                    className='react-flow__controls-button react-flow__controls-interactive'
                                    onClick={() => setIsBackgroundEnabled(!isBackgroundEnabled)}
                                    title='toggle background'
                                    aria-label='toggle background'
                                >
                                    {isBackgroundEnabled ? <IconArtboard /> : <IconArtboardOff />}
                                </button>
                            )}
                        </Controls>
                        {features.minimap !== false && (
                            <MiniMap
                                nodeStrokeWidth={3}
                                nodeColor={isDarkMode ? '#2d2d2d' : '#e2e2e2'}
                                nodeStrokeColor={isDarkMode ? '#525252' : '#fff'}
                                maskColor={isDarkMode ? 'rgb(45, 45, 45, 0.6)' : 'rgb(240, 240, 240, 0.6)'}
                                style={{ backgroundColor: isDarkMode ? theme.palette.background.default : '#fff' }}
                            />
                        )}
                        {isBackgroundEnabled && <Background color='#aaa' gap={16} />}
                        {showPalette && (
                            <NodePalette nodesData={paletteNodes} filter={paletteFilter} extraActions={config.slots?.paletteActions} />
                        )}
                        {config.slots?.floatingActions}
                        {children}
                    </ReactFlow>
                </div>
            </div>
            <PropertyInspectorDialog />
        </Box>
    )
}

export default FlowBuilderCanvas

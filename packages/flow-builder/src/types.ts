import type { ComponentType, ReactNode } from 'react'
import type { Connection, Edge, Node, ReactFlowInstance, Viewport } from 'reactflow'

/* -------------------------------------------------------------------------- */
/* Node schema — the portable description of one palette entry                 */
/* -------------------------------------------------------------------------- */

/** An option inside an `options` / `multiOptions` param or output anchor. */
export interface BuilderParamOption {
    label: string
    name: string
    description?: string
    [key: string]: unknown
}

/**
 * A form-rendered node input. `type` selects the field renderer
 * (string, number, boolean, options, multiOptions, asyncOptions, json, code,
 * file, date, array, datagrid, tabs, password, credential, ...).
 */
export interface InputParam {
    /** Unique handle/param id — built by initNode as `${nodeId}-input-${name}-${type}`. */
    id?: string
    label: string
    name: string
    type: string
    default?: unknown
    description?: string
    optional?: boolean
    placeholder?: string
    rows?: number
    list?: boolean
    acceptVariable?: boolean
    options?: BuilderParamOption[]
    /** Conditional visibility maps, keyed by sibling param name. */
    show?: Record<string, unknown>
    hide?: Record<string, unknown>
    /** Runtime-only flag managed by the visibility engine. */
    display?: boolean
    [key: string]: unknown
}

/** A connection port on the input side. `type` is a `|`-separated list of accepted port types. */
export interface InputAnchor {
    id?: string
    label: string
    name: string
    type: string
    list?: boolean
    optional?: boolean
    hidden?: boolean
    [key: string]: unknown
}

/** One selectable output on a multi-output (`type: 'options'`) output anchor. */
export interface OutputOption {
    id: string
    name: string
    label: string
    description?: string
    type?: string
    isAnchor?: boolean
    hidden?: boolean
    [key: string]: unknown
}

/** The output side of a node: either a single anchor or an `options` group. */
export interface OutputAnchor {
    id?: string
    name: string
    label: string
    type?: string
    description?: string
    options?: OutputOption[]
    default?: string
    [key: string]: unknown
}

/** What the registry returns per draggable palette entry. */
export interface BuilderNodeSchema {
    name: string
    label: string
    category: string
    version?: number
    description?: string
    badge?: 'NEW' | 'DEPRECATING' | string
    /** Icon URL or emoji — interpreted by `NodeRegistryAdapter.renderIcon`. */
    icon?: string
    /** Base color for node card / edge gradient. */
    color?: string
    baseClasses?: string[]
    hideOutput?: boolean
    inputs?: InputParam[]
    credential?: InputParam & { credentialNames?: string[] }
    outputs?: OutputAnchor[]
    [key: string]: unknown
}

/* -------------------------------------------------------------------------- */
/* Canvas node data — schema + live values + UI state                          */
/* -------------------------------------------------------------------------- */

/** Execution-ish status rendered as the node badge (driven by the consumer). */
export type BuilderNodeStatus = 'INPROGRESS' | 'FINISHED' | 'ERROR' | 'TERMINATED' | 'IDLE' | string

/**
 * Live canvas node data: the schema fields plus runtime values and UI state.
 * NOTE: declared explicitly (not via `Omit<BuilderNodeSchema>`) because `Omit`
 * over an index-signature type erases declared prop types.
 */
export interface BuilderNodeData {
    /* — mirrored schema fields — */
    name: string
    label: string
    category?: string
    version?: number
    description?: string
    badge?: string
    icon?: string
    color?: string
    baseClasses?: string[]
    hideOutput?: boolean
    hideInput?: boolean
    credential?: InputParam & { credentialNames?: string[] }
    hint?: string
    /** Raw schema input defs (pre-initNode). */
    outputs?: Record<string, unknown>

    /* — runtime — */
    id: string
    /** Live param values, keyed by param name. */
    inputs: Record<string, unknown>
    inputAnchors: InputAnchor[]
    inputParams: InputParam[]
    outputAnchors: OutputAnchor[]

    /* — UI state — */
    selected?: boolean
    status?: BuilderNodeStatus
    error?: string
    [key: string]: unknown
}

export type BuilderNode = Node<BuilderNodeData>

/** Serialized flow — what gets saved/loaded. */
export interface FlowDocument<N = BuilderNode, E = Edge> {
    nodes: N[]
    edges: E[]
    viewport?: Viewport
    [key: string]: unknown
}

/* -------------------------------------------------------------------------- */
/* Registry adapter — where palette nodes come from                            */
/* -------------------------------------------------------------------------- */

export interface CategoryGroup {
    label: string
    nodes: BuilderNodeSchema[]
}

export interface NodeRegistryAdapter {
    /** Fetch (or build) the full list of available node schemas. */
    list(): Promise<BuilderNodeSchema[]>
    /** Custom palette/node icon renderer. Defaults to `<img src={icon}>` or a colored dot. */
    renderIcon?(node: BuilderNodeSchema): ReactNode
    /** Group nodes for the palette. Defaults to grouping by `category`. */
    categories?(nodes: BuilderNodeSchema[]): CategoryGroup[]
}

/* -------------------------------------------------------------------------- */
/* Field renderers — schema-driven form controls                               */
/* -------------------------------------------------------------------------- */

export interface FieldRendererProps {
    inputParam: InputParam
    data: BuilderNodeData
    /** Current value (`data.inputs[inputParam.name]`). */
    value: unknown
    onChange: (newValue: unknown) => void
    disabled?: boolean
    /** Set when rendered inside an `array` item — feeds `$index` visibility paths. */
    arrayIndex?: number
    /** The parent `array` param when rendered inside one. */
    parentParam?: InputParam
}

export type FieldRenderer = ComponentType<FieldRendererProps>

/**
 * Maps an `InputParam.type` to its control. Consumer renderers are merged
 * OVER the kit defaults, and may also be keyed `"nodeName:paramName"` for
 * one-off per-node overrides.
 */
export type FieldRendererMap = Record<string, FieldRenderer>

/* -------------------------------------------------------------------------- */
/* Rules & callbacks                                                           */
/* -------------------------------------------------------------------------- */

export type IsValidConnectionFn = (connection: Connection, nodes: BuilderNode[], edges: Edge[]) => boolean

/** Predicate deciding whether a raw schema input becomes a form param (true) or a connection anchor (false). */
export type IsConnectionParamFn = (param: InputParam) => boolean

export type SerializeFn = (rf: ReactFlowInstance) => FlowDocument
export type DeserializeFn = (doc: FlowDocument) => { nodes: BuilderNode[]; edges: Edge[]; viewport?: Viewport }

/* -------------------------------------------------------------------------- */
/* The config object — one object to rule a builder                            */
/* -------------------------------------------------------------------------- */

export interface FlowBuilderFeatures {
    minimap?: boolean
    stickyNote?: boolean
    groupNodes?: boolean
    snapping?: boolean
    backgroundDots?: boolean
    /** Show the palette FAB. Default true. */
    palette?: boolean
    /** Read-only mode: no add/edit/delete. Default false. */
    readOnly?: boolean
    /** Minimum zoom level. Default 0.5. */
    minZoom?: number
}

export interface FlowBuilderSlots {
    /** Rendered above the canvas (e.g. a header/toolbar). */
    header?: ReactNode
    /** Rendered floating above the canvas (e.g. chat preview FAB). */
    floatingActions?: ReactNode
    /** Extra FABs next to the palette's add button (e.g. AI-generate). */
    paletteActions?: ReactNode
}

export interface FlowBuilderConfig {
    /** Where palette nodes come from. Required. */
    registry: NodeRegistryAdapter

    /** Merged over the kit's default field renderers. */
    fieldRenderers?: FieldRendererMap
    /**
     * Fetcher backing the `asyncOptions` / `asyncMultiOptions` field renderers
     * (e.g. Flowise's node-load-method endpoint).
     */
    asyncOptionsFetcher?: (args: { nodeName: string; methodName?: string; params?: Record<string, unknown> }) => Promise<unknown>
    /** Extra/override React Flow node types. */
    nodeRenderers?: Record<string, ComponentType<any>>
    /** Extra/override React Flow edge types. */
    edgeRenderers?: Record<string, ComponentType<any>>

    /** Connection validation. Default: no self-connections + no cycles. */
    isValidConnection?: IsValidConnectionFn
    /**
     * Called after a connection is made so the consumer can record it in the
     * target node's inputs (e.g. Flowise writes `{{nodeId.data.instance}}`).
     */
    onConnectInput?: (targetNodeData: BuilderNodeData, targetParam: InputParam | InputAnchor, sourceNodeId: string) => void
    /** Called when a node is deleted so the consumer can scrub references to it. Return the cleaned nodes. */
    refScrubber?: (nodes: BuilderNode[], deletedNodeId: string) => BuilderNode[]

    /** Override the param-vs-anchor split for schema inputs. Default: kit whitelist of form types. */
    isConnectionParam?: IsConnectionParamFn
    /** Output anchor strategy: 'multi' (v2 style, one handle per output) or 'standard' (v1 style, type-signed handles). Default 'multi'. */
    outputStrategy?: 'multi' | 'standard'

    /** Extra palette filter (e.g. consumer category blacklists). */
    paletteFilter?: (node: BuilderNodeSchema) => boolean

    /** Serialization. Default: reactflow `toObject()`. */
    serialize?: SerializeFn
    deserialize?: DeserializeFn

    /** Persistence callbacks. */
    onSave?: (doc: FlowDocument) => Promise<void> | void
    onDirtyChange?: (dirty: boolean) => void

    /** Node card / edge gradient color. Default: `data.color` then theme primary. */
    resolveNodeColor?: (nodeData: BuilderNodeData) => string

    /** Color for the in-progress connection line, keyed by source handle id. Default: theme primary. */
    connectionLineColor?: (fromHandleId: string | null) => string
    /** Optional label on the in-progress connection line (e.g. condition index). */
    connectionLineLabel?: (fromHandleId: string | null) => string | undefined

    /** Extra content rendered under the node label (summary chips etc.). */
    renderNodeSummary?: (nodeData: BuilderNodeData) => ReactNode
    /** When provided, the node toolbar shows an Info button invoking this. */
    onNodeInfo?: (nodeData: BuilderNodeData) => void
    /** Warning badge text for a node (outdated version, deprecation...). */
    resolveNodeWarning?: (nodeData: BuilderNodeData) => string | undefined
    /** Whether the node toolbar offers Duplicate. Default: true. */
    canDuplicateNode?: (nodeData: BuilderNodeData) => boolean
    /**
     * Side effects after an `array` param changes — e.g. Flowise updates the
     * condition node's output anchors and prunes stale edges here.
     */
    onArrayChange?: (args: {
        data: BuilderNodeData
        inputParam: InputParam
        items: Record<string, unknown>[]
        action: 'ADD' | 'DELETE' | 'CHANGE'
        index?: number
    }) => void

    /** How node params are edited. Default 'dialog' (double-click inspector). */
    nodeEditMode?: 'dialog' | 'inline'

    /** Map a dropped schema to a React Flow node type. Default: 'StickyNote' → 'stickyNote', 'Group' → 'groupNode', else 'builderNode'. */
    resolveNodeType?: (schema: BuilderNodeSchema) => string
    /** Edge type for new connections. Default: 'builderEdge'. */
    edgeType?: string
    /** Label computed for a new edge (e.g. condition index). */
    resolveEdgeLabel?: (connection: Connection) => string | undefined
    /**
     * Validate a palette drop. Return an error message to reject (shown via
     * snackbar), or undefined to allow. Covers singleton rules and
     * group-membership rules.
     */
    validateDrop?: (schema: BuilderNodeSchema, ctx: { nodes: BuilderNode[]; parentGroup: BuilderNode | null }) => string | undefined

    features?: FlowBuilderFeatures
    slots?: FlowBuilderSlots

    /** Initial document to load. */
    initialFlow?: FlowDocument
}

/* -------------------------------------------------------------------------- */
/* Provider context                                                            */
/* -------------------------------------------------------------------------- */

export interface FlowBuilderContextValue {
    reactFlowInstance: ReactFlowInstance | null
    setReactFlowInstance: (instance: ReactFlowInstance) => void
    /** Imperative snapshots (non-reactive) — same idiom as Flowise. */
    nodes: BuilderNode[]
    edges: Edge[]
    isDirty: boolean
    setDirty: (dirty?: boolean) => void
    deleteNode: (nodeId: string) => void
    deleteEdge: (edgeId: string) => void
    duplicateNode: (nodeId: string) => void
    onNodeDataChange: (args: { nodeId: string; inputParam: InputParam; newValue: unknown }) => void
    /** Consumer-driven execution status badge on a node. */
    setNodeStatus: (args: { nodeId: string; status: BuilderNodeStatus | undefined; error?: string }) => void
    clearNodeStatuses: () => void
    /** True while any modal dialog is open (suspends the Delete key). */
    dialogOpen: boolean
    setDialogOpen: (open: boolean) => void
    /** The node currently open in the property inspector (dialog edit mode). */
    editNode: BuilderNodeData | null
    setEditNode: (data: BuilderNodeData | null) => void
    /** Serialize the current canvas and hand it to `config.onSave`. Clears the dirty flag. */
    saveFlow: () => Promise<FlowDocument>
    /** Replace the canvas contents with a document (import/paste). Sets the dirty flag. */
    loadFlow: (doc: FlowDocument) => void
    config: FlowBuilderConfig
}

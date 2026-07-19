// @openprojectx/flow-builder — public API

// Core contract
export type {
    BuilderParamOption,
    InputParam,
    InputAnchor,
    OutputOption,
    OutputAnchor,
    BuilderNodeSchema,
    BuilderNodeStatus,
    BuilderNodeData,
    BuilderNode,
    FlowDocument,
    CategoryGroup,
    NodeRegistryAdapter,
    FieldRendererProps,
    FieldRenderer,
    FieldRendererMap,
    IsValidConnectionFn,
    IsConnectionParamFn,
    SerializeFn,
    DeserializeFn,
    FlowBuilderFeatures,
    FlowBuilderSlots,
    FlowBuilderConfig,
    FlowBuilderContextValue
} from './types'

// Provider & canvas
export { FlowBuilderProvider, useFlowBuilder } from './FlowBuilderProvider'
export { FlowBuilderCanvas } from './FlowBuilderCanvas'

// Building blocks (for custom node/edge renderers)
export { default as BuilderNodeCard } from './components/BuilderNode'
export { default as BuilderEdge } from './components/BuilderEdge'
export { default as BuilderConnectionLine } from './components/BuilderConnectionLine'
export { default as GroupNode } from './components/GroupNode'
export { default as StickyNote } from './components/StickyNote'
export { default as NodePalette } from './components/NodePalette'
export { default as PropertyInspectorDialog } from './components/PropertyInspectorDialog'
export { default as SchemaFields } from './components/SchemaFields'

// Graph utils
export {
    getUniqueNodeId,
    getUniqueNodeLabel,
    initNode,
    initializeDefaultNodeData,
    defaultIsConnectionParam,
    FORM_PARAM_TYPES
} from './utils/graph'
export type { InitNodeOptions, InitializedNodeData } from './utils/graph'
export {
    buildInputHandleId,
    buildOutputHandleId,
    parseHandleTypes,
    isInputHandle,
    isOutputHandle,
    typesIntersect,
    respectsListAnchors,
    wouldCreateCycle,
    noSelfNoCycles,
    defaultIsValidConnection,
    typedPortsIsValidConnection
} from './utils/handles'
export { showHideInputs, showHideInputParams, showHideInputAnchors, applyVisibleInputDefaults } from './utils/visibility'
export { defaultSerialize, defaultDeserialize, parseFlowDocument } from './utils/serialize'

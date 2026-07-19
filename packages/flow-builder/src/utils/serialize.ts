import type { Edge, ReactFlowInstance } from 'reactflow'
import type { BuilderNode, FlowDocument } from '../types'

/**
 * Default serializer: React Flow's toObject(), with transient UI flags
 * (`selected`) stripped from node data so saved documents are stable.
 */
export const defaultSerialize = (rf: ReactFlowInstance): FlowDocument => {
    const obj = rf.toObject()
    const nodes = (obj.nodes as BuilderNode[]).map((node) => ({
        ...node,
        data: { ...node.data, selected: false }
    }))
    return { ...obj, nodes }
}

/** Default deserializer: accepts a FlowDocument as produced by {@link defaultSerialize}. */
export const defaultDeserialize = (doc: FlowDocument): { nodes: BuilderNode[]; edges: Edge[]; viewport?: FlowDocument['viewport'] } => ({
    nodes: (doc.nodes ?? []) as BuilderNode[],
    edges: (doc.edges ?? []) as Edge[],
    viewport: doc.viewport
})

/** Parse a FlowDocument from a JSON string, returning null on malformed input. */
export const parseFlowDocument = (raw: string): FlowDocument | null => {
    try {
        const parsed = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
            return parsed as FlowDocument
        }
        return null
    } catch {
        return null
    }
}

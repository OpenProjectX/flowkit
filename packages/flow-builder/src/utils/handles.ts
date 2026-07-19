import type { Connection, Edge } from 'reactflow'
import type { BuilderNode } from '../types'

/* -------------------------------------------------------------------------- */
/* Handle id encoding                                                          */
/*                                                                             */
/* Handle ids carry a machine-readable type signature so connection rules can  */
/* be evaluated without a registry lookup:                                     */
/*   input:  `${nodeId}-input-${paramName}-${typeA|typeB}`                     */
/*   output: `${nodeId}-output-${outputName}-${typeA|typeB}`                   */
/* -------------------------------------------------------------------------- */

export const buildInputHandleId = (nodeId: string, name: string, type: string): string => `${nodeId}-input-${name}-${type}`

export const buildOutputHandleId = (nodeId: string, name: string, types: string[] | string): string =>
    `${nodeId}-output-${name}-${Array.isArray(types) ? types.join('|') : types}`

/** Extracts the accepted/emittted type list from a handle id. */
export const parseHandleTypes = (handleId: string): string[] => {
    const parts = handleId.split('-')
    const typeSegment = parts[parts.length - 1]
    return typeSegment.split('|').map((t) => t.trim())
}

export const isInputHandle = (handleId: string): boolean => handleId.split('-').includes('input')

export const isOutputHandle = (handleId: string): boolean => handleId.split('-').includes('output')

/* -------------------------------------------------------------------------- */
/* Connection rules (composable)                                               */
/* -------------------------------------------------------------------------- */

/** Rejects connections where the source and target share no compatible type. */
export const typesIntersect = (connection: Connection): boolean => {
    if (!connection.sourceHandle || !connection.targetHandle) return false
    const sourceTypes = parseHandleTypes(connection.sourceHandle)
    const targetTypes = parseHandleTypes(connection.targetHandle)
    return targetTypes.some((t) => sourceTypes.includes(t))
}

/**
 * Rejects a second edge into a non-`list` target handle.
 * Looks the anchor up on the target node's `inputAnchors`/`inputParams`.
 */
export const respectsListAnchors = (connection: Connection, nodes: BuilderNode[], edges: Edge[]): boolean => {
    const targetNode = nodes.find((n) => n.id === connection.target)
    const existingEdge = edges.find((e) => e.targetHandle === connection.targetHandle)
    if (!targetNode) return !existingEdge

    const anchor =
        targetNode.data.inputAnchors?.find((a) => a.id === connection.targetHandle) ||
        targetNode.data.inputParams?.find((a) => a.id === connection.targetHandle)

    if (anchor?.list) return true
    if (anchor && !existingEdge) return true
    return false
}

/** Depth-first cycle check: would adding source → target create a cycle? */
export const wouldCreateCycle = (sourceId: string, targetId: string, edges: Edge[]): boolean => {
    if (sourceId === targetId) return true

    const graph: Record<string, string[]> = {}
    edges.forEach((edge) => {
        if (!graph[edge.source]) graph[edge.source] = []
        graph[edge.source].push(edge.target)
    })

    const visited = new Set<string>()
    const hasPath = (current: string, destination: string): boolean => {
        if (current === destination) return true
        if (visited.has(current)) return false
        visited.add(current)
        const neighbors = graph[current] || []
        for (const neighbor of neighbors) {
            if (hasPath(neighbor, destination)) return true
        }
        return false
    }

    return hasPath(targetId, sourceId)
}

/** Rejects self-connections and cycles. */
export const noSelfNoCycles = (connection: Connection, edges: Edge[]): boolean => {
    if (!connection.source || !connection.target) return false
    if (connection.source === connection.target) return false
    return !wouldCreateCycle(connection.source, connection.target, edges)
}

/**
 * The kit default: no self-connections, no cycles.
 * (Consumers wanting Flowise-style typed ports compose `typesIntersect` +
 *  `respectsListAnchors`, e.g. the data-pipeline example.)
 */
export const defaultIsValidConnection = (connection: Connection, _nodes: BuilderNode[], edges: Edge[]): boolean =>
    noSelfNoCycles(connection, edges)

/** Flowise v1-style rule: type intersection + list/single-target enforcement. */
export const typedPortsIsValidConnection = (connection: Connection, nodes: BuilderNode[], edges: Edge[]): boolean => {
    if (!typesIntersect(connection)) return false
    return respectsListAnchors(connection, nodes, edges)
}

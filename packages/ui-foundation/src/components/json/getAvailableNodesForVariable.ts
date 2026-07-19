import { uniq } from 'lodash'

/**
 * Minimal structural types for flow nodes/edges (compatible with react-flow shapes)
 * so the variable helpers stay decoupled from any canvas implementation.
 */
export interface AvailableVariableNodeData {
    name?: string
    label?: string
    category?: string
    description?: string
    inputs?: Record<string, any>
    outputAnchors?: Array<{ options?: Array<{ name?: string; label?: string }> }>
    outputs?: Record<string, any>
    [key: string]: any
}

export interface AvailableVariableNode {
    id: string
    parentNode?: string
    data: AvailableVariableNodeData
}

export interface AvailableVariableEdge {
    source: string
    target: string
    targetHandle: string
}

// copied from Flowise's `utils/genericHelper.getAvailableNodesForVariable` (kept local to stay decoupled)
export const getAvailableNodesForVariable = (
    nodes: AvailableVariableNode[],
    edges: AvailableVariableEdge[],
    target: string,
    targetHandle: string,
    includesStart = false
): AvailableVariableNode[] => {
    // example edge id = "llmChain_0-llmChain_0-output-outputPrediction-string|json-llmChain_1-llmChain_1-input-promptValues-string"
    //                    {source}  -{sourceHandle}                           -{target}  -{targetHandle}
    const parentNodes: AvailableVariableNode[] = []

    const isAgentFlowV2 = nodes.find((nd) => nd.id === target)?.data?.category === 'Agent Flows'

    const isSeqAgent = nodes.find((nd) => nd.id === target)?.data?.category === 'Sequential Agents'

    function collectParentNodes(targetNodeId: string, nodes: AvailableVariableNode[], edges: AvailableVariableEdge[]) {
        const inputEdges = edges.filter(
            (edg) => edg.target === targetNodeId && edg.targetHandle.includes(`${targetNodeId}-input-sequentialNode`)
        )

        // Traverse each edge found
        inputEdges.forEach((edge) => {
            const parentNode = nodes.find((nd) => nd.id === edge.source)
            if (!parentNode) return

            // Recursive call to explore further up the tree
            collectParentNodes(parentNode.id, nodes, edges)

            // Check and add the parent node to the list if it does not include specific names
            const excludeNodeNames = ['seqAgent', 'seqLLMNode', 'seqToolNode', 'seqCustomFunction', 'seqExecuteFlow']
            if (excludeNodeNames.includes(parentNode.data.name ?? '')) {
                parentNodes.push(parentNode)
            }
        })
    }
    function collectAgentFlowV2ParentNodes(targetNodeId: string, nodes: AvailableVariableNode[], edges: AvailableVariableEdge[]) {
        const inputEdges = edges.filter((edg) => edg.target === targetNodeId && edg.targetHandle === targetNodeId)

        // Traverse each edge found
        inputEdges.forEach((edge) => {
            const parentNode = nodes.find((nd) => nd.id === edge.source)
            if (!parentNode) return

            // Recursive call to explore further up the tree
            collectAgentFlowV2ParentNodes(parentNode.id, nodes, edges)

            // Check and add the parent node to the list if it does not include specific names
            const excludeNodeNames = ['startAgentflow']
            if (!excludeNodeNames.includes(parentNode.data.name ?? '') || includesStart) {
                parentNodes.push(parentNode)
            }
        })
    }

    if (isSeqAgent) {
        collectParentNodes(target, nodes, edges)
        return uniq(parentNodes)
    } else if (isAgentFlowV2) {
        collectAgentFlowV2ParentNodes(target, nodes, edges)
        const parentNodeId = nodes.find((nd) => nd.id === target)?.parentNode
        if (parentNodeId) {
            collectAgentFlowV2ParentNodes(parentNodeId, nodes, edges)
        }
        return uniq(parentNodes)
    } else {
        const inputEdges = edges.filter((edg) => edg.target === target && edg.targetHandle === targetHandle)
        if (inputEdges && inputEdges.length) {
            for (let j = 0; j < inputEdges.length; j += 1) {
                const node = nodes.find((nd) => nd.id === inputEdges[j].source)
                parentNodes.push(node as AvailableVariableNode)
            }
        }
        return parentNodes
    }
}

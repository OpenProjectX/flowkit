import type { BuilderNodeSchema, InputParam, OutputAnchor, OutputOption } from '../types'
import { showHideInputAnchors, showHideInputParams } from './visibility'

/* -------------------------------------------------------------------------- */
/* Node id / label                                                             */
/* -------------------------------------------------------------------------- */

export const getUniqueNodeId = (nodeData: { name: string }, nodes: { id: string }[]): string => {
    let suffix = 0
    let baseId = `${nodeData.name}_${suffix}`
    while (nodes.some((node) => node.id === baseId)) {
        suffix += 1
        baseId = `${nodeData.name}_${suffix}`
    }
    return baseId
}

export const getUniqueNodeLabel = (nodeData: { name: string; label: string; type?: string }, nodes: { id: string }[]): string => {
    if (nodeData.type === 'StickyNote') return nodeData.label
    let suffix = 0
    let baseId = `${nodeData.name}_${suffix}`
    while (nodes.some((node) => node.id === baseId)) {
        suffix += 1
        baseId = `${nodeData.name}_${suffix}`
    }
    return `${nodeData.label} ${suffix}`
}

/* -------------------------------------------------------------------------- */
/* initNode — turn a registry schema into canvas node data                     */
/* -------------------------------------------------------------------------- */

/**
 * Default param-vs-anchor split: inputs whose `type` is a known form-control
 * type become rendered params; everything else becomes a connection anchor.
 * Consumers can override via `FlowBuilderConfig.isConnectionParam`.
 */
export const FORM_PARAM_TYPES = [
    'asyncOptions',
    'asyncMultiOptions',
    'options',
    'multiOptions',
    'array',
    'datagrid',
    'string',
    'number',
    'boolean',
    'password',
    'json',
    'code',
    'date',
    'file',
    'folder',
    'tabs',
    'conditionFunction',
    'timePicker',
    'weekDaysPicker',
    'monthDaysPicker',
    'datePicker',
    'credential'
]

export const defaultIsConnectionParam = (param: InputParam): boolean => !FORM_PARAM_TYPES.includes(param.type)

export const initializeDefaultNodeData = (nodeParams: { name: string; default?: unknown }[] = []): Record<string, unknown> => {
    const initialValues: Record<string, unknown> = {}
    for (const input of nodeParams) {
        initialValues[input.name] = input.default || ''
    }
    return initialValues
}

const createOutputOption = (output: OutputAnchor, newNodeId: string): OutputOption => {
    const outputBaseClasses = (output.baseClasses as string[] | undefined) ?? []
    const baseClasses = outputBaseClasses.length > 1 ? outputBaseClasses.join('|') : outputBaseClasses[0] || ''

    return {
        id: `${newNodeId}-output-${output.name}-${baseClasses}`,
        name: output.name,
        label: output.label,
        description: output.description ?? '',
        type: outputBaseClasses.length > 1 ? outputBaseClasses.join(' | ') : outputBaseClasses[0] || '',
        isAnchor: output?.isAnchor as boolean | undefined,
        hidden: output?.hidden as boolean | undefined
    }
}

/**
 * 'multi' (default, v2 agentflow style): one anchor per declared output, or a
 * single `${nodeId}-output-${name}` anchor when no outputs are declared.
 */
const createMultiOutputs = (nodeData: BuilderNodeSchema, newNodeId: string): OutputAnchor[] => {
    if (nodeData.hideOutput) return []
    if (nodeData.outputs?.length) {
        return nodeData.outputs.map((_, index) => ({
            id: `${newNodeId}-output-${index}`,
            label: nodeData.label,
            name: nodeData.name
        }))
    }
    return [
        {
            id: `${newNodeId}-output-${nodeData.name}`,
            label: nodeData.label,
            name: nodeData.name
        }
    ]
}

/** 'standard' (v1 style): a single `options` output anchor when outputs are declared. */
const createStandardOutputs = (nodeData: BuilderNodeSchema, newNodeId: string): OutputAnchor[] => {
    if (nodeData.hideOutput) return []
    if (nodeData.outputs?.length) {
        const outputOptions = nodeData.outputs.map((output) => createOutputOption(output, newNodeId))
        return [
            {
                name: 'output',
                label: 'Output',
                type: 'options',
                description: (nodeData.outputs[0].description as string | undefined) ?? '',
                options: outputOptions,
                default: nodeData.outputs[0].name
            }
        ]
    }
    const baseClasses = nodeData.baseClasses ?? []
    return [
        {
            id: `${newNodeId}-output-${nodeData.name}-${baseClasses.join('|')}`,
            name: nodeData.name,
            label: (nodeData.type as string | undefined) ?? nodeData.label,
            description: nodeData.description ?? '',
            type: baseClasses.join(' | ')
        }
    ]
}

export interface InitNodeOptions {
    /** Override the param-vs-anchor split. Default: {@link defaultIsConnectionParam}. */
    isConnectionParam?: (param: InputParam) => boolean
    /** Output anchor strategy. Default: 'multi'. */
    outputStrategy?: 'multi' | 'standard'
}

/** The result of {@link initNode}: the schema plus computed canvas fields. */
export type InitializedNodeData<T extends BuilderNodeSchema = BuilderNodeSchema> = T & {
    inputs: Record<string, unknown>
    inputAnchors: InputParam[]
    inputParams: InputParam[]
    outputAnchors: OutputAnchor[]
}

/**
 * Turns a registry node schema into canvas-ready node data:
 *  - splits raw `inputs` into `inputParams` (form fields) / `inputAnchors` (ports)
 *  - builds handle ids encoding the type signature
 *  - seeds `inputs` with declared defaults and applies conditional visibility
 * Mutates and returns `nodeData` (same contract as Flowise's initNode).
 */
export const initNode = <T extends BuilderNodeSchema>(
    nodeData: T,
    newNodeId: string,
    options: InitNodeOptions = {}
): InitializedNodeData<T> => {
    const isConnectionParam = options.isConnectionParam ?? defaultIsConnectionParam
    const outputStrategy = options.outputStrategy ?? 'multi'

    const inputAnchors: InputParam[] = []
    const inputParams: InputParam[] = []
    const incoming = nodeData.inputs ? nodeData.inputs.length : 0

    for (let i = 0; i < incoming; i += 1) {
        const raw = nodeData.inputs![i]
        const newInput = {
            ...raw,
            id: `${newNodeId}-input-${raw.name}-${raw.type}`
        }
        if (isConnectionParam(raw)) {
            inputAnchors.push(newInput)
        } else {
            inputParams.push(newInput)
        }
    }

    // Credential param (if any) renders first
    if (nodeData.credential) {
        inputParams.unshift({
            ...nodeData.credential,
            id: `${newNodeId}-input-${nodeData.credential.name}-${nodeData.credential.type ?? 'credential'}`
        })
    }

    const outputAnchors =
        outputStrategy === 'standard' ? createStandardOutputs(nodeData, newNodeId) : createMultiOutputs(nodeData, newNodeId)

    if (nodeData.inputs) {
        const defaultInputs = initializeDefaultNodeData(nodeData.inputs)
        ;(nodeData as any).inputAnchors = showHideInputAnchors({ ...(nodeData as any), inputAnchors, inputs: defaultInputs })
        ;(nodeData as any).inputParams = showHideInputParams({ ...(nodeData as any), inputParams, inputs: defaultInputs })
        ;(nodeData as any).inputs = defaultInputs
    } else {
        ;(nodeData as any).inputAnchors = []
        ;(nodeData as any).inputParams = []
        ;(nodeData as any).inputs = {}
    }

    if (nodeData.outputs) {
        ;(nodeData as any).outputs = initializeDefaultNodeData(outputAnchors as any)
    } else {
        ;(nodeData as any).outputs = {}
    }
    ;(nodeData as any).outputAnchors = outputAnchors

    // Credential slot starts empty (the id is stored on data.credential at save time)
    if (nodeData.credential) (nodeData as any).credential = ''
    ;(nodeData as any).id = newNodeId

    return nodeData as InitializedNodeData<T>
}

import { get, isEqual } from 'lodash'
import type { InputParam } from '../types'

/* -------------------------------------------------------------------------- */
/* Conditional visibility engine                                               */
/*                                                                             */
/* Params declare `show` / `hide` maps keyed by a path into `nodeData.inputs`. */
/* A param renders unless a rule flips its `display` flag to false.            */
/* Ported 1:1 from Flowise's genericHelper.js.                                 */
/* -------------------------------------------------------------------------- */

interface VisibilityNodeData {
    inputs?: Record<string, unknown>
    inputParams?: InputParam[]
    inputAnchors?: InputParam[]
    [key: string]: unknown
}

const _showHideOperation = (nodeData: VisibilityNodeData, inputParam: InputParam, displayType: 'show' | 'hide', arrayIndex?: number) => {
    const displayOptions = inputParam[displayType]
    if (!displayOptions) return
    /* For example:
    show: {
        enableMemory: true
    }
    */
    Object.keys(displayOptions).forEach((rawPath) => {
        const comparisonValue = displayOptions[rawPath]
        let path = rawPath
        if (path.includes('$index') && arrayIndex !== undefined) {
            path = path.replace('$index', String(arrayIndex))
        }
        let groundValue: unknown = get(nodeData.inputs, path, '')
        if (groundValue && typeof groundValue === 'string' && groundValue.startsWith('[') && groundValue.endsWith(']')) {
            groundValue = JSON.parse(groundValue)
        }

        // Handle case where groundValue is an array
        if (Array.isArray(groundValue)) {
            if (Array.isArray(comparisonValue)) {
                // Both are arrays - check if there's any intersection
                const hasIntersection = comparisonValue.some((val) => (groundValue as unknown[]).includes(val))
                if (displayType === 'show' && !hasIntersection) {
                    inputParam.display = false
                }
                if (displayType === 'hide' && hasIntersection) {
                    inputParam.display = false
                }
            } else if (typeof comparisonValue === 'string') {
                // comparisonValue is string, groundValue is array - check if array contains the string
                const matchFound = groundValue.some((val) => comparisonValue === val || new RegExp(comparisonValue).test(val))
                if (displayType === 'show' && !matchFound) {
                    inputParam.display = false
                }
                if (displayType === 'hide' && matchFound) {
                    inputParam.display = false
                }
            } else if (typeof comparisonValue === 'boolean' || typeof comparisonValue === 'number') {
                // For boolean/number comparison with array, check if array contains the value
                const matchFound = groundValue.includes(comparisonValue)
                if (displayType === 'show' && !matchFound) {
                    inputParam.display = false
                }
                if (displayType === 'hide' && matchFound) {
                    inputParam.display = false
                }
            } else if (typeof comparisonValue === 'object' && comparisonValue !== null) {
                // For object comparison with array, use deep equality check
                const matchFound = groundValue.some((val) => isEqual(comparisonValue, val))
                if (displayType === 'show' && !matchFound) {
                    inputParam.display = false
                }
                if (displayType === 'hide' && matchFound) {
                    inputParam.display = false
                }
            }
        } else {
            // Original logic for non-array groundValue
            if (Array.isArray(comparisonValue)) {
                if (displayType === 'show' && !comparisonValue.includes(groundValue)) {
                    inputParam.display = false
                }
                if (displayType === 'hide' && comparisonValue.includes(groundValue)) {
                    inputParam.display = false
                }
            } else if (typeof comparisonValue === 'string') {
                if (
                    displayType === 'show' &&
                    !(comparisonValue === groundValue || new RegExp(comparisonValue).test(groundValue as string))
                ) {
                    inputParam.display = false
                }
                if (
                    displayType === 'hide' &&
                    (comparisonValue === groundValue || new RegExp(comparisonValue).test(groundValue as string))
                ) {
                    inputParam.display = false
                }
            } else if (typeof comparisonValue === 'boolean') {
                if (displayType === 'show' && comparisonValue !== groundValue) {
                    inputParam.display = false
                }
                if (displayType === 'hide' && comparisonValue === groundValue) {
                    inputParam.display = false
                }
            } else if (typeof comparisonValue === 'object' && comparisonValue !== null) {
                if (displayType === 'show' && !isEqual(comparisonValue, groundValue)) {
                    inputParam.display = false
                }
                if (displayType === 'hide' && isEqual(comparisonValue, groundValue)) {
                    inputParam.display = false
                }
            } else if (typeof comparisonValue === 'number') {
                if (displayType === 'show' && comparisonValue !== groundValue) {
                    inputParam.display = false
                }
                if (displayType === 'hide' && comparisonValue === groundValue) {
                    inputParam.display = false
                }
            }
        }
    })
}

const _inputsWithDeclaredDefaults = (params: InputParam[], inputs?: Record<string, unknown>): Record<string, unknown> => {
    const merged = { ...(inputs ?? {}) }
    for (const param of params) {
        if (!param || param.default === undefined) continue
        if (merged[param.name] === undefined) {
            merged[param.name] = param.default
        }
    }
    return merged
}

export const showHideInputs = (
    nodeData: VisibilityNodeData,
    inputType: 'inputParams' | 'inputAnchors' | null,
    overrideParams?: InputParam[],
    arrayIndex?: number
): InputParam[] => {
    const params = overrideParams ?? (inputType ? (nodeData[inputType] as InputParam[] | undefined) : undefined) ?? []
    const effectiveNodeData = { ...nodeData, inputs: _inputsWithDeclaredDefaults(params, nodeData.inputs) }

    for (const inputParam of params) {
        // Reset display flag to true for each inputParam
        inputParam.display = true

        if (inputParam.show) {
            _showHideOperation(effectiveNodeData, inputParam, 'show', arrayIndex)
        }
        if (inputParam.hide) {
            _showHideOperation(effectiveNodeData, inputParam, 'hide', arrayIndex)
        }

        // Filter individual options within dropdowns based on their own show/hide conditions
        if (inputParam.type === 'options' && inputParam.options) {
            inputParam.options = inputParam.options.filter((opt) => {
                const option = opt as InputParam
                if (typeof opt === 'string' || (!option.show && !option.hide)) return true
                const synthetic: InputParam = { show: option.show, hide: option.hide, display: true } as InputParam
                if (option.show) _showHideOperation(nodeData, synthetic, 'show', arrayIndex)
                if (option.hide) _showHideOperation(nodeData, synthetic, 'hide', arrayIndex)
                return synthetic.display !== false
            })
        }
    }

    return params
}

export const showHideInputParams = (nodeData: VisibilityNodeData): InputParam[] => {
    return showHideInputs(nodeData, 'inputParams')
}

export const showHideInputAnchors = (nodeData: VisibilityNodeData): InputParam[] => {
    return showHideInputs(nodeData, 'inputAnchors')
}

export const applyVisibleInputDefaults = (params: InputParam[], inputs?: Record<string, unknown>): Record<string, unknown> => {
    const result = { ...(inputs ?? {}) }
    const evaluated = showHideInputs({ inputs: result }, null, params)
    for (const param of evaluated) {
        if (!param || param.default === undefined) continue
        if (param.display === false) continue
        if (result[param.name] !== undefined) continue
        result[param.name] = param.default
    }
    return result
}

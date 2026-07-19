import { memo, useMemo } from 'react'
import type { BuilderNodeData, FieldRendererMap, InputParam } from '../types'
import { useFlowBuilder } from '../FlowBuilderProvider'
import { defaultFieldRenderers } from './fields'

export interface SchemaFieldsProps {
    /** The node being edited. */
    data: BuilderNodeData
    /** Params to render. Defaults to `data.inputParams`. Hidden/`display:false` params are skipped. */
    inputParams?: InputParam[]
    /** Change handler. Defaults to the provider's `onNodeDataChange` (recomputes visibility). */
    onDataChange?: (args: { inputParam: InputParam; newValue: unknown }) => void
    disabled?: boolean
    /** Extra renderers merged over `config.fieldRenderers` (which merge over kit defaults). */
    fieldRenderers?: FieldRendererMap
    /** Forwarded to field renderers when rendering items of an `array` param. */
    arrayIndex?: number
    parentParam?: InputParam
}

/**
 * Schema-driven form engine. Renders one field per input param, resolved from
 * the merged renderer registry:
 *   1. `"nodeName:paramName"` override
 *   2. `param.type` renderer
 *   3. `default` fallback (plain text input)
 */
const SchemaFields = ({ data, inputParams, onDataChange, disabled, fieldRenderers, arrayIndex, parentParam }: SchemaFieldsProps) => {
    const { config, onNodeDataChange } = useFlowBuilder()

    const registry = useMemo<FieldRendererMap>(
        () => ({ ...defaultFieldRenderers, ...config.fieldRenderers, ...fieldRenderers }),
        [config.fieldRenderers, fieldRenderers]
    )

    const params = (inputParams ?? data.inputParams ?? []).filter((inputParam) => inputParam.display !== false && !inputParam.hidden)

    const handleChange = (inputParam: InputParam, newValue: unknown) => {
        if (onDataChange) {
            onDataChange({ inputParam, newValue })
        } else {
            onNodeDataChange({ nodeId: data.id, inputParam, newValue })
        }
    }

    return (
        <>
            {params.map((inputParam) => {
                const Renderer = registry[`${data.name}:${inputParam.name}`] ?? registry[inputParam.type] ?? registry.default
                if (!Renderer) return null
                return (
                    <Renderer
                        key={inputParam.id ?? inputParam.name}
                        inputParam={inputParam}
                        data={data}
                        value={data.inputs[inputParam.name]}
                        onChange={(newValue) => handleChange(inputParam, newValue)}
                        disabled={disabled}
                        arrayIndex={arrayIndex}
                        parentParam={parentParam}
                    />
                )
            })}
        </>
    )
}

export default memo(SchemaFields)

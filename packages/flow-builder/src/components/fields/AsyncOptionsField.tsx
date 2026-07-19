import { memo } from 'react'
import { AsyncDropdown } from '@flowkit/ui-foundation'
import type { FieldRendererProps } from '../../types'
import { useFlowBuilder } from '../../FlowBuilderProvider'
import FieldWrapper from './FieldWrapper'

/**
 * `asyncOptions` / `asyncMultiOptions` — dropdown whose options come from
 * `config.asyncOptionsFetcher` (e.g. Flowise's node-load-method endpoint).
 * Receives the node's current input values as fetch params, since option
 * lists typically depend on sibling inputs.
 */
const AsyncOptionsField = memo(({ inputParam, data, value, onChange, disabled }: FieldRendererProps) => {
    const { config } = useFlowBuilder()
    const isMulti = inputParam.type === 'asyncMultiOptions'

    return (
        <FieldWrapper inputParam={inputParam}>
            <AsyncDropdown
                key={`${data.id}_${JSON.stringify(data.inputs[inputParam.name])}`}
                disabled={disabled}
                name={inputParam.name}
                value={(value as string) ?? (inputParam.default as string) ?? (isMulti ? '[]' : '')}
                multiple={isMulti}
                freeSolo={Boolean(inputParam.freeSolo)}
                loadMethod={(inputParam.loadMethod as string) ?? undefined}
                fetchParams={{ nodeName: data.name, inputs: data.inputs }}
                fetcher={(args) =>
                    config.asyncOptionsFetcher?.({
                        nodeName: data.name,
                        methodName: (args.method as string) ?? (inputParam.loadMethod as string),
                        params: { inputs: data.inputs, ...(args.params ?? {}) }
                    }) ?? Promise.resolve([])
                }
                onSelect={onChange}
            />
        </FieldWrapper>
    )
})

AsyncOptionsField.displayName = 'AsyncOptionsField'

export default AsyncOptionsField

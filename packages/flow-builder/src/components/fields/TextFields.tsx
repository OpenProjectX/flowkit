import { memo } from 'react'
import { Input, SensitiveInput } from '@flowkit/ui-foundation'
import type { FieldRendererProps } from '../../types'
import { useFlowBuilder } from '../../FlowBuilderProvider'
import FieldWrapper from './FieldWrapper'

/** `string` — single-line text (with variable suggestions when the param allows). */
export const StringField = memo(({ inputParam, data, value, onChange, disabled }: FieldRendererProps) => {
    const { reactFlowInstance } = useFlowBuilder()
    return (
        <FieldWrapper inputParam={inputParam}>
            <Input
                inputParam={inputParam as never}
                value={(value as string) ?? (inputParam.default as string) ?? ''}
                onChange={onChange}
                disabled={disabled}
                nodes={reactFlowInstance?.getNodes() as never}
                edges={reactFlowInstance?.getEdges() as never}
                nodeId={data.id}
            />
        </FieldWrapper>
    )
})
StringField.displayName = 'StringField'

/** `number` — numeric text input. */
export const NumberField = memo(({ inputParam, data, value, onChange, disabled }: FieldRendererProps) => {
    const { reactFlowInstance } = useFlowBuilder()
    return (
        <FieldWrapper inputParam={inputParam}>
            <Input
                inputParam={{ ...inputParam, type: 'number' } as never}
                value={(value as number) ?? (inputParam.default as number) ?? ''}
                onChange={(v) => onChange(Number(v))}
                disabled={disabled}
                nodes={reactFlowInstance?.getNodes() as never}
                edges={reactFlowInstance?.getEdges() as never}
                nodeId={data.id}
            />
        </FieldWrapper>
    )
})
NumberField.displayName = 'NumberField'

/** `password` — masked input with reveal support. */
export const PasswordField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => (
    <FieldWrapper inputParam={inputParam}>
        <SensitiveInput inputParam={inputParam as never} value={(value as string) ?? ''} onChange={onChange} disabled={disabled} />
    </FieldWrapper>
))
PasswordField.displayName = 'PasswordField'

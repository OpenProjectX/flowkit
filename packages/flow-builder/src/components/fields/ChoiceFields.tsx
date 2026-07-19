import { memo } from 'react'
import { FormControlLabel, Switch } from '@mui/material'
import { Dropdown, MultiDropdown } from '@flowkit/ui-foundation'
import type { DropdownOption } from '@flowkit/ui-foundation'
import type { FieldRendererProps } from '../../types'
import FieldWrapper from './FieldWrapper'

const toOptions = (inputParam: FieldRendererProps['inputParam']): DropdownOption[] =>
    (inputParam.options ?? []).map((opt) =>
        typeof opt === 'string' ? { label: opt, name: opt } : { label: opt.label, name: opt.name, description: opt.description }
    )

/** `options` — single-select dropdown. */
export const OptionsField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => {
    return (
        <FieldWrapper inputParam={inputParam}>
            <Dropdown
                name={inputParam.name}
                options={toOptions(inputParam)}
                value={(value as string) ?? (inputParam.default as string) ?? ''}
                onSelect={onChange}
                disabled={disabled}
                disableClearable={!inputParam.optional}
            />
        </FieldWrapper>
    )
})
OptionsField.displayName = 'OptionsField'

/** `multiOptions` — multi-select dropdown; value is a JSON-array string (Flowise convention). */
export const MultiOptionsField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => {
    return (
        <FieldWrapper inputParam={inputParam}>
            <MultiDropdown
                name={inputParam.name}
                options={toOptions(inputParam)}
                value={(value as string) ?? (inputParam.default as string) ?? ''}
                onSelect={onChange}
                disabled={disabled}
            />
        </FieldWrapper>
    )
})
MultiOptionsField.displayName = 'MultiOptionsField'

/** `boolean` — labeled switch. */
export const BooleanField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => {
    const checked = (value as boolean) ?? (inputParam.default as boolean) ?? false
    return (
        <FieldWrapper inputParam={inputParam}>
            <FormControlLabel
                control={<Switch size='small' checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />}
                label={checked ? 'Enabled' : 'Disabled'}
                sx={{ ml: 0.5 }}
            />
        </FieldWrapper>
    )
})
BooleanField.displayName = 'BooleanField'

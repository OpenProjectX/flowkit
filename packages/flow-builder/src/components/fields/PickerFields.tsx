import { memo } from 'react'
import { useTheme } from '@mui/material/styles'
import { DatePicker, MonthDaysPicker, TimePicker, WeekDaysPicker } from '@openprojectx/ui-foundation'
import type { FieldRendererProps } from '../../types'
import FieldWrapper from './FieldWrapper'

/** `datePicker` / `date` — calendar date input. */
export const DatePickerField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => {
    const theme = useTheme()
    return (
        <FieldWrapper inputParam={inputParam}>
            <DatePicker
                value={(value as string) ?? (inputParam.default as string) ?? ''}
                onChange={onChange}
                disabled={disabled}
                isDarkMode={theme.palette.mode === 'dark'}
            />
        </FieldWrapper>
    )
})
DatePickerField.displayName = 'DatePickerField'

/** `timePicker` — time-of-day input. */
export const TimePickerField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => {
    const theme = useTheme()
    return (
        <FieldWrapper inputParam={inputParam}>
            <TimePicker
                value={(value as string) ?? (inputParam.default as string) ?? ''}
                onChange={onChange}
                disabled={disabled}
                isDarkMode={theme.palette.mode === 'dark'}
            />
        </FieldWrapper>
    )
})
TimePickerField.displayName = 'TimePickerField'

/** `weekDaysPicker` — weekday multi-select. */
export const WeekDaysPickerField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => (
    <FieldWrapper inputParam={inputParam}>
        <WeekDaysPicker value={(value as string) ?? (inputParam.default as string) ?? ''} onChange={onChange} disabled={disabled} />
    </FieldWrapper>
))
WeekDaysPickerField.displayName = 'WeekDaysPickerField'

/** `monthDaysPicker` — day-of-month multi-select. */
export const MonthDaysPickerField = memo(({ inputParam, value, onChange, disabled }: FieldRendererProps) => (
    <FieldWrapper inputParam={inputParam}>
        <MonthDaysPicker value={(value as string) ?? (inputParam.default as string) ?? ''} onChange={onChange} disabled={disabled} />
    </FieldWrapper>
))
MonthDaysPickerField.displayName = 'MonthDaysPickerField'

import { useState, useEffect, ChangeEvent, MouseEvent } from 'react'
import { Box, TextField } from '@mui/material'
import { useTheme } from '@mui/material/styles'

export interface DatePickerProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    placeholder?: string
    /** Replaces Flowise's `useSelector(state => state.customization?.isDarkMode)` */
    isDarkMode?: boolean
}

export const DatePicker = ({ value, onChange, disabled = false, placeholder = 'YYYY-MM-DD', isDarkMode = false }: DatePickerProps) => {
    const theme = useTheme()

    // Normalise to "YYYY-MM-DD" for the native date input
    const toDateString = (val?: string) => {
        if (!val) return ''
        const d = new Date(val)
        if (isNaN(d.getTime())) return ''
        return d.toISOString().slice(0, 10)
    }

    const [dateValue, setDateValue] = useState(toDateString(value))

    useEffect(() => {
        setDateValue(toDateString(value))
    }, [value])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value // "YYYY-MM-DD" or ""
        setDateValue(newValue)
        // Propagate as ISO string (end-of-day UTC) so backend can parse it as a Date
        onChange(newValue ? new Date(newValue).toISOString() : '')
    }

    return (
        <Box className={isDarkMode ? 'picker-dark' : ''} sx={{ mt: 1, width: '100%' }}>
            <TextField
                fullWidth
                size='small'
                type='date'
                disabled={disabled}
                value={dateValue}
                onChange={handleChange}
                placeholder={placeholder}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                    onClick: (e: MouseEvent<HTMLInputElement>) => {
                        if (!disabled) e.currentTarget.showPicker?.()
                    }
                }}
                sx={{
                    '& .MuiInputBase-root': {
                        cursor: disabled ? 'default' : 'pointer',
                        '& fieldset': {
                            borderColor: theme.palette.grey[900] + 25
                        }
                    },
                    '& input': {
                        cursor: disabled ? 'default' : 'pointer'
                    }
                }}
            />
        </Box>
    )
}

export default DatePicker

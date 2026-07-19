import { useState, useEffect, ChangeEvent, MouseEvent } from 'react'
import { Box, TextField } from '@mui/material'
import { useTheme } from '@mui/material/styles'

export interface TimePickerProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    placeholder?: string
    /** Replaces Flowise's `useSelector(state => state.customization?.isDarkMode)` */
    isDarkMode?: boolean
}

export const TimePicker = ({ value, onChange, disabled = false, placeholder = '09:00', isDarkMode = false }: TimePickerProps) => {
    const theme = useTheme()
    const [timeValue, setTimeValue] = useState(value || '')

    useEffect(() => {
        setTimeValue(value || '')
    }, [value])

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setTimeValue(newValue)
        onChange(newValue)
    }

    return (
        <Box className={isDarkMode ? 'picker-dark' : ''} sx={{ mt: 1, width: '100%' }}>
            <TextField
                fullWidth
                size='small'
                type='time'
                disabled={disabled}
                value={timeValue}
                onChange={handleChange}
                placeholder={placeholder}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                    step: 60,
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

export default TimePicker

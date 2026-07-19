import { useState } from 'react'
import { FormControlLabel, Checkbox } from '@mui/material'

export interface CheckboxInputProps {
    value?: boolean
    label?: string
    onChange: (value: boolean) => void
    disabled?: boolean
}

export const CheckboxInput = ({ value, label, onChange, disabled = false }: CheckboxInputProps) => {
    const [myValue, setMyValue] = useState(value)

    return (
        <>
            <FormControlLabel
                sx={{ mt: 1, width: '100%' }}
                control={
                    <Checkbox
                        disabled={disabled}
                        checked={myValue}
                        onChange={(event) => {
                            setMyValue(event.target.checked)
                            onChange(event.target.checked)
                        }}
                    />
                }
                label={label}
            />
        </>
    )
}

export default CheckboxInput

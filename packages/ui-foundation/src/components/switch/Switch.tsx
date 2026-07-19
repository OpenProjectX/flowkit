import { useEffect, useState } from 'react'
import { FormControl, Switch, Typography } from '@mui/material'

export interface SwitchInputProps {
    label?: string
    value?: string | boolean
    onChange: (value: boolean) => void
    disabled?: boolean
}

export const SwitchInput = ({ label, value, onChange, disabled = false }: SwitchInputProps) => {
    const [myValue, setMyValue] = useState(value !== undefined ? !!value : false)

    useEffect(() => {
        setMyValue(value !== undefined ? !!value : false)
    }, [value])

    return (
        <>
            <FormControl
                sx={{ mt: 1, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                size='small'
            >
                {label && <Typography>{label}</Typography>}
                <Switch
                    disabled={disabled}
                    checked={myValue}
                    onChange={(event) => {
                        setMyValue(event.target.checked)
                        onChange(event.target.checked)
                    }}
                />
            </FormControl>
        </>
    )
}

export default SwitchInput

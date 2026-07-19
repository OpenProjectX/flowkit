import { useState, useRef } from 'react'
import { FormControl, OutlinedInput, InputAdornment, IconButton, CircularProgress, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { InputParam } from './InputParam'

const MASKED_CHARS = '••••••'
const MULTILINE_DOTS = '••••••••••••••'

/** Default redacted placeholder (Flowise's `REDACTED_CREDENTIAL_VALUE`) */
export const DEFAULT_REDACTED_VALUE = '_FLOWISE_BLANK_07167752-1a71-43b1-bf8f-4f32252165db'

export interface SensitiveInputProps {
    inputParam: InputParam
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    /** Async reveal handler for redacted/masked values; resolves with the clear-text value */
    onReveal?: () => Promise<string | undefined>
    /** Sentinel value representing a redacted credential (defaults to Flowise's redacted placeholder) */
    redactedValue?: string
}

export const SensitiveInput = ({
    inputParam,
    value,
    onChange,
    disabled = false,
    onReveal,
    redactedValue = DEFAULT_REDACTED_VALUE
}: SensitiveInputProps) => {
    const theme = useTheme()
    const [myValue, setMyValue] = useState(value ?? '')
    const [isVisible, setIsVisible] = useState(false)
    const [isRevealing, setIsRevealing] = useState(false)
    const maskedUrlRef = useRef<string | null>(typeof value === 'string' && value.includes(MASKED_CHARS) ? value : null)

    const isUrl = inputParam?.type === 'url'
    const isMultilinePassword = !!inputParam?.rows && inputParam?.type === 'password'
    const isMaskedUrl = isUrl && typeof myValue === 'string' && myValue.includes(MASKED_CHARS)
    const isRedactedMultiline = isMultilinePassword && myValue === redactedValue

    const handleToggle = async () => {
        if (!isVisible && onReveal && (myValue === redactedValue || isMaskedUrl)) {
            setIsRevealing(true)
            const revealed = await onReveal()
            setIsRevealing(false)
            if (revealed !== undefined) {
                setMyValue(revealed)
                onChange(revealed)
            }
        } else if (isVisible && maskedUrlRef.current) {
            setMyValue(maskedUrlRef.current)
        }
        setIsVisible((prev) => !prev)
    }

    const inputSx = {
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[900] + 25
        }
    }

    // URL in ADD mode: plain text input, no masking needed
    if (isUrl && !onReveal) {
        return (
            <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
                <OutlinedInput
                    id={inputParam.name}
                    size='small'
                    disabled={disabled}
                    type='text'
                    placeholder={inputParam.placeholder}
                    value={myValue}
                    name={inputParam.name}
                    onChange={(e) => {
                        setMyValue(e.target.value)
                        onChange(e.target.value)
                    }}
                    sx={inputSx}
                />
            </FormControl>
        )
    }

    return (
        <>
            <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
                <OutlinedInput
                    id={inputParam.name}
                    size='small'
                    disabled={disabled}
                    type={isUrl ? (isVisible || isMaskedUrl ? 'text' : 'password') : 'password'}
                    placeholder={inputParam.placeholder}
                    multiline={isMultilinePassword}
                    rows={isMultilinePassword ? inputParam.rows ?? 1 : undefined}
                    value={isRedactedMultiline ? MULTILINE_DOTS : myValue}
                    name={inputParam.name}
                    onChange={(e) => {
                        setMyValue(e.target.value)
                        onChange(e.target.value)
                    }}
                    onFocus={() => {
                        if (isRedactedMultiline) {
                            setMyValue('')
                            onChange('')
                        }
                    }}
                    onBlur={(e) => {
                        if (isMultilinePassword && e.target.value === '') {
                            setMyValue(redactedValue)
                            onChange(redactedValue)
                        }
                    }}
                    inputProps={{
                        readOnly: isUrl && isMaskedUrl && !isVisible
                    }}
                    endAdornment={
                        isUrl && onReveal ? (
                            <InputAdornment position='end'>
                                <IconButton
                                    edge='end'
                                    onClick={handleToggle}
                                    onMouseDown={(e) => e.preventDefault()}
                                    aria-label={isVisible ? 'Hide' : 'Show'}
                                    disabled={isRevealing}
                                >
                                    {isRevealing ? (
                                        <CircularProgress size={16} />
                                    ) : isVisible ? (
                                        <IconEyeOff size={18} />
                                    ) : (
                                        <IconEye size={18} />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ) : undefined
                    }
                    sx={inputSx}
                />
            </FormControl>
            {isUrl && onReveal && (
                <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                    Click the eye icon to reveal the value before editing.
                </Typography>
            )}
        </>
    )
}

export default SensitiveInput

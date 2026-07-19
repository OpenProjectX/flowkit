import { useState, useEffect, useRef } from 'react'
import { FormControl, OutlinedInput, InputBase, Popover, InputAdornment, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import SelectVariable from '../json/SelectVariable'
import { getAvailableNodesForVariable, AvailableVariableEdge, AvailableVariableNode } from '../json/getAvailableNodesForVariable'
import { InputParam } from './InputParam'

export interface InputProps {
    inputParam: InputParam
    value?: string | number
    nodes?: AvailableVariableNode[]
    edges?: AvailableVariableEdge[]
    nodeId?: string
    onChange: (value: string) => void
    onBlur?: (value: string) => void
    disabled?: boolean
}

export const Input = ({ inputParam, value, nodes, edges, nodeId, onChange, onBlur, disabled = false }: InputProps) => {
    const theme = useTheme()
    const [myValue, setMyValue] = useState(value ?? '')
    const [anchorEl, setAnchorEl] = useState<Element | null>(null)
    const [availableNodesForVariable, setAvailableNodesForVariable] = useState<AvailableVariableNode[]>([])
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
    const inputElementRef = useRef<HTMLInputElement | null>(null)
    const selectionRangeRef = useRef<{ start: number | null; end: number | null }>({ start: null, end: null })

    const openPopOver = Boolean(anchorEl)
    const hasPasswordToggle = (inputParam?.type === 'password' || inputParam?.type === 'url') && !!inputParam?.enablePasswordToggle

    const handleClosePopOver = () => {
        setAnchorEl(null)
    }

    const setNewVal = (val: string) => {
        const newVal = myValue + val.substring(2)
        onChange(newVal)
        setMyValue(newVal)
    }

    const getInputType = (type?: string) => {
        switch (type) {
            case 'string':
                return 'text'
            case 'password':
            case 'url':
                return 'password'
            case 'number':
                return 'number'
            case 'email':
                return 'email'
            default:
                return 'text'
        }
    }

    const handleTogglePasswordVisibility = () => {
        const inputElement = inputElementRef.current
        if (inputElement) {
            selectionRangeRef.current = {
                start: inputElement.selectionStart,
                end: inputElement.selectionEnd
            }
        }
        setIsPasswordVisible((prev) => !prev)
    }

    useEffect(() => {
        if (!hasPasswordToggle) return
        const { start, end } = selectionRangeRef.current
        if (start === null || end === null || !inputElementRef.current) return
        requestAnimationFrame(() => {
            inputElementRef.current?.focus()
            inputElementRef.current?.setSelectionRange(start, end)
        })
    }, [hasPasswordToggle, isPasswordVisible])

    useEffect(() => {
        if (!disabled && nodes && edges && nodeId && inputParam) {
            const nodesForVariable = inputParam?.acceptVariable
                ? getAvailableNodesForVariable(nodes, edges, nodeId, inputParam.id ?? '')
                : []
            setAvailableNodesForVariable(nodesForVariable)
        }
    }, [disabled, inputParam, nodes, edges, nodeId])

    useEffect(() => {
        if (typeof myValue === 'string' && myValue && myValue.endsWith('{{')) {
            setAnchorEl(ref.current)
        }
    }, [myValue])

    return (
        <>
            {inputParam.name === 'note' ? (
                <FormControl sx={{ width: '100%', height: 'auto' }} size='small'>
                    <InputBase
                        id={nodeId}
                        size='small'
                        disabled={disabled}
                        type={getInputType(inputParam.type)}
                        placeholder={inputParam.placeholder}
                        multiline={!!inputParam.rows}
                        minRows={inputParam.rows ?? 1}
                        value={myValue}
                        name={inputParam.name}
                        onChange={(e) => {
                            setMyValue(e.target.value)
                            onChange(e.target.value)
                        }}
                        onBlur={(e) => {
                            if (onBlur) onBlur(e.target.value)
                        }}
                        inputProps={{
                            step: inputParam.step ?? 1,
                            style: {
                                border: 'none',
                                background: 'none',
                                color: 'inherit'
                            }
                        }}
                        sx={{
                            border: 'none',
                            background: 'none',
                            padding: '10px 14px',
                            textarea: {
                                '&::placeholder': {
                                    color: '#616161'
                                }
                            }
                        }}
                    />
                </FormControl>
            ) : (
                <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
                    <OutlinedInput
                        id={inputParam.name}
                        size='small'
                        disabled={disabled}
                        type={hasPasswordToggle ? (isPasswordVisible ? 'text' : 'password') : getInputType(inputParam.type)}
                        placeholder={inputParam.placeholder}
                        multiline={!!inputParam.rows}
                        rows={inputParam.rows ?? 1}
                        value={myValue}
                        name={inputParam.name}
                        inputRef={inputElementRef}
                        onChange={(e) => {
                            setMyValue(e.target.value)
                            onChange(e.target.value)
                        }}
                        onBlur={(e) => {
                            if (onBlur) onBlur(e.target.value)
                        }}
                        inputProps={{
                            step: inputParam.step ?? 1,
                            style: {
                                height: inputParam.rows ? '90px' : 'inherit'
                            }
                        }}
                        endAdornment={
                            hasPasswordToggle ? (
                                <InputAdornment position='end'>
                                    <IconButton
                                        edge='end'
                                        onClick={handleTogglePasswordVisibility}
                                        onMouseDown={(e) => e.preventDefault()}
                                        aria-label={isPasswordVisible ? 'Hide' : 'Show'}
                                    >
                                        {isPasswordVisible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                    </IconButton>
                                </InputAdornment>
                            ) : undefined
                        }
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.grey[900] + 25
                            }
                        }}
                    />
                </FormControl>
            )}
            <div ref={ref}></div>
            {inputParam?.acceptVariable && (
                <Popover
                    open={openPopOver}
                    anchorEl={anchorEl}
                    onClose={handleClosePopOver}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                    }}
                >
                    <SelectVariable
                        disabled={disabled}
                        availableNodesForVariable={availableNodesForVariable}
                        onSelectAndReturnVal={(val) => {
                            setNewVal(val)
                            handleClosePopOver()
                        }}
                    />
                </Popover>
            )}
        </>
    )
}

export default Input

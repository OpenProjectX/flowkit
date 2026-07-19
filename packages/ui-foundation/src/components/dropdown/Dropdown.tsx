import { useState } from 'react'

import { Popper, FormControl, TextField, Box, Typography } from '@mui/material'
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import { useTheme, styled } from '@mui/material/styles'

const StyledPopper = styled(Popper)({
    boxShadow: '0px 8px 10px -5px rgb(0 0 0 / 20%), 0px 16px 24px 2px rgb(0 0 0 / 14%), 0px 6px 30px 5px rgb(0 0 0 / 12%)',
    borderRadius: '10px',
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 10,
            margin: 10
        }
    }
})

export interface DropdownOption {
    label?: string
    name: string
    description?: string
    imageSrc?: string
    [key: string]: unknown
}

export interface DropdownProps {
    name?: string
    value?: string
    loading?: boolean
    options?: DropdownOption[]
    onSelect?: (value: string) => void
    disabled?: boolean
    freeSolo?: boolean
    disableClearable?: boolean
    /** Replaces Flowise's `useSelector(state => state.customization).isDarkMode` */
    isDarkMode?: boolean
}

export const Dropdown = ({
    name,
    value,
    loading,
    options,
    onSelect,
    disabled = false,
    freeSolo = false,
    disableClearable = false,
    isDarkMode = false
}: DropdownProps) => {
    const findMatchingOptions = (options: DropdownOption[] = [], value?: string) => options.find((option) => option.name === value)
    const getDefaultOptionValue = () => ''
    const [internalValue, setInternalValue] = useState<string>(value ?? 'choose an option')
    const theme = useTheme()

    return (
        <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
            <Autocomplete
                id={name}
                disabled={disabled}
                freeSolo={freeSolo}
                disableClearable={disableClearable}
                size='small'
                loading={loading}
                options={options || []}
                value={findMatchingOptions(options, internalValue) || getDefaultOptionValue()}
                onChange={(e, selection) => {
                    const value = selection ? (selection as DropdownOption).name : ''
                    setInternalValue(value)
                    onSelect?.(value)
                }}
                PopperComponent={StyledPopper}
                renderInput={(params) => {
                    const matchingOption = findMatchingOptions(options, internalValue)
                    return (
                        <TextField
                            {...params}
                            value={internalValue}
                            sx={{
                                height: '100%',
                                '& .MuiInputBase-root': {
                                    height: '100%',
                                    '& fieldset': {
                                        borderColor: theme.palette.grey[900] + 25
                                    }
                                }
                            }}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: matchingOption?.imageSrc ? (
                                    <Box
                                        component='img'
                                        src={matchingOption.imageSrc}
                                        alt={matchingOption.label || 'Selected Option'}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%'
                                        }}
                                    />
                                ) : null
                            }}
                        />
                    )
                }}
                renderOption={(props, option) => (
                    <Box component='li' {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.imageSrc && (
                            <img
                                src={option.imageSrc}
                                alt={option.description}
                                style={{
                                    width: 30,
                                    height: 30,
                                    padding: 1,
                                    borderRadius: '50%'
                                }}
                            />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant='h5'>{option.label}</Typography>
                            {option.description && (
                                <Typography sx={{ color: isDarkMode ? '#9e9e9e' : '' }}>{option.description}</Typography>
                            )}
                        </div>
                    </Box>
                )}
                sx={{ height: '100%' }}
            />
        </FormControl>
    )
}

export default Dropdown

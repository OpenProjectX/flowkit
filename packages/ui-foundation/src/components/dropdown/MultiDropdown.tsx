import { useState } from 'react'

import { Popper, FormControl, TextField, Box, Typography } from '@mui/material'
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import { useTheme, styled, SxProps, Theme } from '@mui/material/styles'
import { DropdownOption } from './Dropdown'

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

export interface MultiDropdownProps {
    name?: string
    value?: string
    options?: DropdownOption[]
    onSelect?: (value: string) => void
    disabled?: boolean
    formControlSx?: SxProps<Theme>
    disableClearable?: boolean
    /** Replaces Flowise's `useSelector(state => state.customization).isDarkMode` */
    isDarkMode?: boolean
}

export const MultiDropdown = ({
    name,
    value,
    options,
    onSelect,
    formControlSx = {},
    disabled = false,
    disableClearable = false,
    isDarkMode = false
}: MultiDropdownProps) => {
    const findMatchingOptions = (options: DropdownOption[] = [], internalValue: string | string[]) => {
        let values: string[] = []
        if ('choose an option' !== internalValue && internalValue && typeof internalValue === 'string') values = JSON.parse(internalValue)
        else values = internalValue as string[]
        return options.filter((option) => values.includes(option.name))
    }
    const getDefaultOptionValue = () => []
    const [internalValue, setInternalValue] = useState<string | string[]>(value ?? [])
    const theme = useTheme()

    return (
        <FormControl sx={{ mt: 1, width: '100%', ...formControlSx }} size='small'>
            <Autocomplete
                id={name}
                disabled={disabled}
                disableClearable={disableClearable}
                size='small'
                multiple
                filterSelectedOptions
                options={options || []}
                value={findMatchingOptions(options, internalValue) || getDefaultOptionValue()}
                onChange={(e, selections) => {
                    let value = ''
                    if (selections.length) {
                        const selectionNames: string[] = []
                        for (let i = 0; i < selections.length; i += 1) {
                            selectionNames.push((selections[i] as DropdownOption).name)
                        }
                        value = JSON.stringify(selectionNames)
                    }
                    setInternalValue(value)
                    onSelect?.(value)
                }}
                PopperComponent={StyledPopper}
                renderInput={(params) => (
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
                    />
                )}
                renderOption={(props, option) => (
                    <Box component='li' {...props}>
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

export default MultiDropdown

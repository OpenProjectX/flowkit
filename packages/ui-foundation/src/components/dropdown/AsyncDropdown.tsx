import { useState, useEffect, Fragment } from 'react'

// Material
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete'
import { Popper, CircularProgress, TextField, Box, Typography, Tooltip } from '@mui/material'
import { useTheme, styled } from '@mui/material/styles'
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

export interface AsyncDropdownFetcherArgs {
    /** Name of the input param the dropdown is bound to */
    name: string
    /** Optional load method associated with the param (Flowise's `loadMethod`) */
    method?: string
    /** Free-form extra parameters supplied through `fetchParams` (e.g. nodeData, previousNodes, currentNode) */
    params?: Record<string, unknown>
}

export interface AsyncDropdownProps {
    name: string
    value?: string
    onSelect?: (value: string) => void
    /**
     * Injected data source (replaces Flowise's server call to `/api/v1/node-load-method/...`
     * and `credentialsApi.getCredentialsByName`). Must resolve with the list of options.
     */
    fetcher: (args: AsyncDropdownFetcherArgs) => Promise<unknown>
    /** Load method forwarded to the fetcher (Flowise resolves it from `nodeData.inputParams`) */
    loadMethod?: string
    /** Extra parameters forwarded to the fetcher */
    fetchParams?: Record<string, unknown>
    /** Rewrites an option's `imageSrc` (replaces Flowise's `${baseURL}/api/v1/node-icon/${name}`) */
    resolveImageSrc?: (optionName: string) => string
    isCreateNewOption?: boolean
    onCreateNew?: () => void
    disabled?: boolean
    freeSolo?: boolean
    disableClearable?: boolean
    multiple?: boolean
    fullWidth?: boolean
    /** Replaces Flowise's `useSelector(state => state.customization).isDarkMode` */
    isDarkMode?: boolean
    /** Called when the fetcher rejects; the error is also shown as helper text */
    onError?: (error: unknown) => void
}

export const AsyncDropdown = ({
    name,
    value,
    onSelect,
    fetcher,
    loadMethod,
    fetchParams,
    resolveImageSrc,
    isCreateNewOption,
    onCreateNew,
    disabled = false,
    freeSolo = false,
    disableClearable = false,
    multiple = false,
    fullWidth = false,
    isDarkMode = false,
    onError
}: AsyncDropdownProps) => {
    const theme = useTheme()

    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<DropdownOption[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)
    const findMatchingOptions = (options: DropdownOption[] = [], value?: string | string[]) => {
        if (multiple) {
            let values: string[] = []
            if ('choose an option' !== value && value && typeof value === 'string') {
                values = JSON.parse(value)
            } else {
                values = (value as string[]) ?? []
            }
            return options.filter((option) => values.includes(option.name))
        }
        return options.find((option) => option.name === value)
    }
    const getDefaultOptionValue = (): string | string[] => (multiple ? [] : '')
    const addNewOption: DropdownOption[] = [{ label: '- Create New -', name: '-create-' }]
    const [internalValue, setInternalValue] = useState<string | string[]>(value ?? 'choose an option')

    useEffect(() => {
        setLoading(true)
        const fetchData = async () => {
            try {
                const response = await fetcher({ name, method: loadMethod, params: fetchParams })
                const list: DropdownOption[] = Array.isArray(response) ? response : []
                const resolved = list.map((option) =>
                    option.imageSrc && resolveImageSrc ? { ...option, imageSrc: resolveImageSrc(option.name) } : option
                )
                if (isCreateNewOption) setOptions([...resolved, ...addNewOption])
                else setOptions([...resolved])
            } catch (err) {
                console.error(err)
                setError(err)
                onError?.(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Autocomplete<DropdownOption, boolean, boolean, boolean>
                id={name}
                freeSolo={freeSolo}
                disabled={disabled}
                disableClearable={disableClearable}
                multiple={multiple}
                filterSelectedOptions={multiple}
                size='small'
                sx={{ mt: 1, width: fullWidth ? '100%' : multiple ? '90%' : '100%' }}
                open={open}
                onOpen={() => {
                    setOpen(true)
                }}
                onClose={() => {
                    setOpen(false)
                }}
                options={options}
                value={findMatchingOptions(options, internalValue) || getDefaultOptionValue()}
                onChange={(e, selection) => {
                    if (multiple) {
                        let value = ''
                        const selections = selection as DropdownOption[]
                        if (selections.length) {
                            const selectionNames = selections.map((item) => item.name)
                            value = JSON.stringify(selectionNames)
                        }
                        setInternalValue(value)
                        onSelect?.(value)
                    } else {
                        const singleSelection = selection as DropdownOption | null
                        const value = singleSelection ? singleSelection.name : ''
                        if (isCreateNewOption && value === '-create-') {
                            onCreateNew?.()
                        } else {
                            setInternalValue(value)
                            onSelect?.(value)
                        }
                    }
                }}
                PopperComponent={StyledPopper}
                loading={loading}
                renderInput={(params) => {
                    const matchingOptions = multiple
                        ? (findMatchingOptions(options, internalValue) as DropdownOption[])
                        : ([findMatchingOptions(options, internalValue)].filter(Boolean) as DropdownOption[])

                    const textField = (
                        <TextField
                            {...params}
                            value={internalValue}
                            error={!!error}
                            helperText={error ? 'Failed to load options' : undefined}
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
                                startAdornment: (
                                    <>
                                        {matchingOptions.map((option) =>
                                            option?.imageSrc ? (
                                                <Box
                                                    key={option.name}
                                                    component='img'
                                                    src={option.imageSrc}
                                                    alt={option.label || 'Selected Option'}
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        marginRight: 0.5
                                                    }}
                                                />
                                            ) : null
                                        )}
                                        {params.InputProps.startAdornment}
                                    </>
                                ),
                                endAdornment: (
                                    <Fragment>
                                        {loading ? <CircularProgress color='inherit' size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </Fragment>
                                )
                            }}
                        />
                    )

                    return !multiple ? (
                        textField
                    ) : (
                        <Tooltip
                            title={
                                typeof internalValue === 'string' ? internalValue.replace(/[[\]"]/g, '').replace(/,/g, ', ') : internalValue
                            }
                            placement='top'
                            arrow
                        >
                            {textField}
                        </Tooltip>
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
            />
        </>
    )
}

export default AsyncDropdown

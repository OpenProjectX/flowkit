import { memo, useEffect, useState } from 'react'
import { Box, Button, Chip, IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { cloneDeep } from 'lodash'
import type { BuilderNodeData, FieldRendererProps, InputParam } from '../../types'
import { useFlowBuilder } from '../../FlowBuilderProvider'
import { showHideInputs } from '../../utils/visibility'
import SchemaFields from '../SchemaFields'
import FieldWrapper from './FieldWrapper'

/**
 * `array` — a list of item-groups, each rendered as a nested SchemaFields.
 * Item shape comes from `inputParam.array` (an InputParam[] template).
 * Conditional visibility inside items uses `$index` paths (see visibility.ts).
 *
 * Domain side effects on add/delete (e.g. Flowise's condition-node output
 * anchors) hook in via `config.onArrayChange`. `inputParam.minItems` keeps
 * the delete button hidden below a minimum count.
 */
const ArrayField = memo(({ inputParam, data, value, onChange, disabled }: FieldRendererProps) => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'
    const { config } = useFlowBuilder()
    const template = (inputParam.array as InputParam[] | undefined) ?? []

    const [arrayItems, setArrayItems] = useState<Record<string, unknown>[]>([]) // [{name: 'John', age: 30}, ...]
    const [itemParameters, setItemParameters] = useState<InputParam[][]>([]) // visible param defs per item

    const minItems = (inputParam.minItems as number | undefined) ?? 0

    // Initialize items + per-item visibility from the current value
    useEffect(() => {
        const rawItems = (value as Record<string, unknown>[]) ?? (data.inputs[inputParam.name] as Record<string, unknown>[]) ?? []
        const initialArrayItems = Array.isArray(rawItems) ? rawItems : []
        setArrayItems(initialArrayItems)

        const initialItemParameters: InputParam[][] = []
        for (let i = 0; i < initialArrayItems.length; i += 1) {
            const itemParams = showHideInputs(
                { ...data, inputs: { ...data.inputs, ...initialArrayItems[i] } },
                null,
                cloneDeep(template),
                i
            )
            initialItemParameters.push(itemParams)
        }
        setItemParameters(initialItemParameters)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, inputParam])

    const commit = (
        updatedArrayItems: Record<string, unknown>[],
        updatedItemParameters: InputParam[][],
        action: 'ADD' | 'DELETE' | 'CHANGE',
        index?: number
    ) => {
        setArrayItems(updatedArrayItems)
        setItemParameters(updatedItemParameters)
        data.inputs[inputParam.name] = updatedArrayItems
        onChange(updatedArrayItems)
        config.onArrayChange?.({ data, inputParam, items: updatedArrayItems, action, index })
    }

    const handleItemInputChange = (
        { inputParam: changedParam, newValue }: { inputParam: InputParam; newValue: unknown },
        itemIndex: number
    ) => {
        const updatedArrayItems = [...arrayItems]
        const updatedItem = { ...updatedArrayItems[itemIndex] }

        // Reset fields with show/hide rules so stale values don't persist
        for (const fieldDef of template) {
            if (fieldDef.show || fieldDef.hide) {
                updatedItem[fieldDef.name] = fieldDef.default || ''
            }
        }
        updatedItem[changedParam.name] = newValue
        updatedArrayItems[itemIndex] = updatedItem

        const newItemParams = showHideInputs({ ...data, inputs: { ...data.inputs, ...updatedItem } }, null, cloneDeep(template), itemIndex)
        const updatedItemParameters = [...itemParameters]
        updatedItemParameters[itemIndex] = newItemParams

        commit(updatedArrayItems, updatedItemParameters, 'CHANGE', itemIndex)
    }

    const handleAddItem = () => {
        const newItem: Record<string, unknown> = {}
        for (const fieldDef of template) {
            newItem[fieldDef.name] = fieldDef.default || ''
        }
        const updatedArrayItems = [...arrayItems, newItem]
        const updatedItemParameters: InputParam[][] = []
        for (let i = 0; i < updatedArrayItems.length; i += 1) {
            updatedItemParameters.push(
                showHideInputs({ ...data, inputs: { ...data.inputs, ...updatedArrayItems[i] } }, null, cloneDeep(template), i)
            )
        }
        commit(updatedArrayItems, updatedItemParameters, 'ADD')
    }

    const handleDeleteItem = (indexToDelete: number) => {
        const updatedArrayItems = arrayItems.filter((_, i) => i !== indexToDelete)
        const updatedItemParameters = itemParameters.filter((_, i) => i !== indexToDelete)
        commit(updatedArrayItems, updatedItemParameters, 'DELETE', indexToDelete)
    }

    const isDeleteButtonVisible = arrayItems.length > minItems

    return (
        <FieldWrapper inputParam={inputParam}>
            {arrayItems.map((itemValues, index) => {
                const itemData: BuilderNodeData = {
                    ...data,
                    inputs: itemValues,
                    inputParams: itemParameters[index] || []
                }
                return (
                    <Box
                        sx={{
                            p: 2,
                            mt: 2,
                            mb: 1,
                            border: 1,
                            borderColor: theme.palette.grey[900] + '25',
                            borderRadius: 2,
                            position: 'relative'
                        }}
                        key={index}
                    >
                        {isDeleteButtonVisible && !disabled && (
                            <IconButton
                                title='Delete'
                                onClick={() => handleDeleteItem(index)}
                                sx={{
                                    position: 'absolute',
                                    height: '35px',
                                    width: '35px',
                                    right: 10,
                                    top: 10,
                                    color: isDarkMode ? theme.palette.grey[300] : 'inherit',
                                    '&:hover': { color: 'red' }
                                }}
                            >
                                <IconTrash />
                            </IconButton>
                        )}
                        <Chip
                            label={`${index}`}
                            size='small'
                            sx={{ position: 'absolute', right: isDeleteButtonVisible ? 45 : 10, top: 16 }}
                        />
                        <SchemaFields
                            data={itemData}
                            inputParams={(itemParameters[index] || []).filter((param) => param.display !== false)}
                            disabled={disabled}
                            arrayIndex={index}
                            parentParam={inputParam}
                            onDataChange={({ inputParam: changedParam, newValue }) =>
                                handleItemInputChange({ inputParam: changedParam, newValue }, index)
                            }
                        />
                    </Box>
                )
            })}
            {!disabled && (
                <Button
                    fullWidth
                    size='small'
                    variant='outlined'
                    sx={{ borderRadius: '16px', mt: 2 }}
                    startIcon={<IconPlus />}
                    onClick={handleAddItem}
                >
                    Add {inputParam.label}
                </Button>
            )}
        </FieldWrapper>
    )
})

ArrayField.displayName = 'ArrayField'

export default ArrayField

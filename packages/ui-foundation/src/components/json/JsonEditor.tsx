import { useEffect, useState } from 'react'
import { FormControl, Popover } from '@mui/material'
import ReactJson, { InteractionProps, OnCopyProps } from 'react-json-view'
import SelectVariable from './SelectVariable'
import { cloneDeep } from 'lodash'
import { getAvailableNodesForVariable, AvailableVariableEdge, AvailableVariableNode } from './getAvailableNodesForVariable'
import { InputParam } from '../input/InputParam'

export interface JsonEditorInputProps {
    value?: string
    onChange?: (value: string) => void
    inputParam?: InputParam
    nodes?: AvailableVariableNode[]
    edges?: AvailableVariableEdge[]
    nodeId?: string
    disabled?: boolean
    isDarkMode?: boolean
    isSequentialAgent?: boolean
}

export const JsonEditorInput = ({
    value,
    onChange,
    inputParam,
    nodes,
    edges,
    nodeId,
    disabled = false,
    isDarkMode = false,
    isSequentialAgent = false
}: JsonEditorInputProps) => {
    const [myValue, setMyValue] = useState<Record<string, unknown>>(value ? JSON.parse(value) : {})
    const [availableNodesForVariable, setAvailableNodesForVariable] = useState<AvailableVariableNode[]>([])
    const [mouseUpKey, setMouseUpKey] = useState('')

    const [anchorEl, setAnchorEl] = useState<Element | null>(null)
    const openPopOver = Boolean(anchorEl)

    const handleClosePopOver = () => {
        setAnchorEl(null)
    }

    const setNewVal = (val: string) => {
        const newVal = cloneDeep(myValue)
        newVal[mouseUpKey] = val
        onChange?.(JSON.stringify(newVal))
        setMyValue((params) => ({
            ...params,
            [mouseUpKey]: val
        }))
    }

    const onClipboardCopy = (e: OnCopyProps) => {
        const src = e.src
        if (Array.isArray(src) || typeof src === 'object') {
            navigator.clipboard.writeText(JSON.stringify(src, null, '  '))
        } else {
            navigator.clipboard.writeText(src as string)
        }
    }

    useEffect(() => {
        if (!disabled && nodes && edges && nodeId && inputParam) {
            const nodesForVariable = inputParam?.acceptVariable
                ? getAvailableNodesForVariable(nodes, edges, nodeId, inputParam.id ?? '')
                : []
            setAvailableNodesForVariable(nodesForVariable)
        }
    }, [disabled, inputParam, nodes, edges, nodeId])

    return (
        <>
            <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
                {disabled && (
                    <ReactJson
                        theme={isDarkMode ? 'ocean' : 'rjv-default'}
                        style={{ padding: 10, borderRadius: 10 }}
                        src={myValue}
                        name={null}
                        enableClipboard={(e) => onClipboardCopy(e)}
                        quotesOnKeys={false}
                        displayDataTypes={false}
                    />
                )}
                {!disabled && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation()
                            }
                        }}
                        role='button'
                        aria-label='JSON Editor'
                        tabIndex={0}
                        key={JSON.stringify(myValue)}
                    >
                        <ReactJson
                            theme={isDarkMode ? 'ocean' : 'rjv-default'}
                            style={{ padding: 10, borderRadius: 10 }}
                            src={myValue}
                            name={null}
                            quotesOnKeys={false}
                            displayDataTypes={false}
                            enableClipboard={(e) => onClipboardCopy(e)}
                            onMouseUp={(event: { name?: string; currentTarget?: Element }) => {
                                if (inputParam?.acceptVariable) {
                                    setMouseUpKey(event.name ?? '')
                                    setAnchorEl(event.currentTarget ?? null)
                                }
                            }}
                            onEdit={(edit: InteractionProps) => {
                                setMyValue(edit.updated_src)
                                onChange?.(JSON.stringify(edit.updated_src))
                            }}
                            onAdd={() => {
                                //console.log(add)
                            }}
                            onDelete={(deleteobj: InteractionProps) => {
                                setMyValue(deleteobj.updated_src)
                                onChange?.(JSON.stringify(deleteobj.updated_src))
                            }}
                        />
                    </div>
                )}
            </FormControl>
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
                        isSequentialAgent={isSequentialAgent}
                    />
                </Popover>
            )}
        </>
    )
}

export default JsonEditorInput

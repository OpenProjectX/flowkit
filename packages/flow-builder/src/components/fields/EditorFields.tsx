import { memo, useState } from 'react'
import { Box, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CodeEditor, JsonEditorInput } from '@openprojectx/ui-foundation'
import type { FieldRendererProps } from '../../types'
import { useFlowBuilder } from '../../FlowBuilderProvider'
import FieldWrapper from './FieldWrapper'

/** `code` — CodeMirror editor (JS by default), with optional `codeExample` insert button. */
export const CodeField = memo(({ inputParam, data, value, onChange, disabled }: FieldRendererProps) => {
    const theme = useTheme()
    const [reloadTimestamp, setReloadTimestamp] = useState(0)
    return (
        <FieldWrapper inputParam={inputParam}>
            {Boolean(inputParam.codeExample) && !disabled && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                    <Button
                        variant='outlined'
                        size='small'
                        onClick={() => {
                            data.inputs[inputParam.name] = inputParam.codeExample
                            onChange(inputParam.codeExample)
                            setReloadTimestamp(Date.now())
                        }}
                    >
                        See Example
                    </Button>
                </Box>
            )}
            <CodeEditor
                key={`${data.id}-${inputParam.name}-${reloadTimestamp}`}
                value={(value as string) ?? (inputParam.default as string) ?? ''}
                theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                lang={(inputParam.codeLanguage as string) ?? 'js'}
                placeholder={inputParam.placeholder as string}
                disabled={disabled}
                onValueChange={onChange}
            />
        </FieldWrapper>
    )
})
CodeField.displayName = 'CodeField'

/** `json` — JSON editor with variable-suggestion support. */
export const JsonField = memo(({ inputParam, data, value, onChange, disabled }: FieldRendererProps) => {
    const { reactFlowInstance } = useFlowBuilder()
    const theme = useTheme()
    return (
        <FieldWrapper inputParam={inputParam}>
            <JsonEditorInput
                inputParam={inputParam as never}
                value={(value as string) ?? (inputParam.default as string) ?? ''}
                onChange={onChange}
                disabled={disabled}
                isDarkMode={theme.palette.mode === 'dark'}
                nodes={reactFlowInstance?.getNodes() as never}
                edges={reactFlowInstance?.getEdges() as never}
                nodeId={data.id}
            />
        </FieldWrapper>
    )
})
JsonField.displayName = 'JsonField'

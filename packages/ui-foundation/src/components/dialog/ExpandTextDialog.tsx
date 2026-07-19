import { createPortal } from 'react-dom'
import { ReactNode, useEffect, useState } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'

// MUI
import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { LoadingButton } from '@mui/lab'

// Project Import
import { StyledButton } from '../button/StyledButton'
import { CodeEditor } from '../editor/CodeEditor'
import { InputParam, InputParamHint } from '../input/InputParam'

import 'react-perfect-scrollbar/dist/css/styles.css'
import './ExpandTextDialog.css'

export interface ExpandTextDialogProps {
    show?: boolean
    dialogProps?: {
        value?: string
        inputParam?: InputParam
        languageType?: string
        disabled?: boolean
        cancelButtonName?: ReactNode
        confirmButtonName?: ReactNode
    }
    /** Replaces Flowise's `useSelector(state => state.customization).isDarkMode` */
    isDarkMode?: boolean
    onCancel?: () => void
    onConfirm?: (value: string, paramName?: string) => void
    onInputHintDialogClicked?: (hint: InputParamHint) => void
    /**
     * Injected executor for `code`-type params (replaces Flowise's `nodesApi.executeCustomFunctionNode`).
     * Receives the editor content and resolves with the execution result.
     */
    onExecute?: (javascriptFunction: string) => Promise<unknown>
}

export const ExpandTextDialog = ({
    show,
    dialogProps,
    isDarkMode = false,
    onCancel,
    onInputHintDialogClicked,
    onConfirm,
    onExecute
}: ExpandTextDialogProps) => {
    const portalElement = document.getElementById('portal')

    const theme = useTheme()

    const [inputValue, setInputValue] = useState('')
    const [inputParam, setInputParam] = useState<InputParam | null>(null)
    const [languageType, setLanguageType] = useState('json')
    const [loading, setLoading] = useState(false)
    const [codeExecutedResult, setCodeExecutedResult] = useState<unknown>('')

    useEffect(() => {
        if (dialogProps?.value) {
            setInputValue(dialogProps.value)
        }
        if (dialogProps?.inputParam) {
            setInputParam(dialogProps.inputParam)
            if (dialogProps.inputParam.type === 'code') {
                setLanguageType('js')
            }
        }
        if (dialogProps?.languageType) {
            setLanguageType(dialogProps.languageType)
        }

        return () => {
            setInputValue('')
            setLoading(false)
            setInputParam(null)
            setLanguageType('json')
            setCodeExecutedResult('')
        }
    }, [dialogProps])

    const handleExecute = async () => {
        if (!onExecute) return
        setLoading(true)
        try {
            const data = await onExecute(inputValue)
            if (typeof data === 'object') {
                setCodeExecutedResult(JSON.stringify(data, null, 2))
            } else {
                setCodeExecutedResult(data)
            }
        } catch (error) {
            const err = error as { response?: { data?: unknown } }
            if (typeof error === 'object' && err?.response?.data) {
                setCodeExecutedResult(err.response.data)
            } else if (typeof error === 'string') {
                setCodeExecutedResult(error)
            }
        } finally {
            setLoading(false)
        }
    }

    const component = show ? (
        <Dialog open={show} fullWidth maxWidth='md' aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
            <DialogContent>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {inputParam && (inputParam.type === 'string' || inputParam.type === 'code') && (
                        <div style={{ flex: 70 }}>
                            <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'row' }}>
                                <Typography variant='h4'>{inputParam.label}</Typography>
                                <div style={{ flex: 1 }} />
                                {inputParam.hint && (
                                    <Button
                                        sx={{ p: 0, px: 2 }}
                                        color='secondary'
                                        variant='text'
                                        onClick={() => {
                                            onInputHintDialogClicked?.(inputParam.hint as InputParamHint)
                                        }}
                                    >
                                        {inputParam.hint.label}
                                    </Button>
                                )}
                            </div>
                            <PerfectScrollbar
                                style={{
                                    border: '1px solid',
                                    borderColor: theme.palette.grey['500'],
                                    borderRadius: '12px',
                                    height: '100%',
                                    maxHeight: languageType === 'js' ? 'calc(100vh - 250px)' : 'calc(100vh - 220px)',
                                    overflowX: 'hidden',
                                    backgroundColor: 'white'
                                }}
                            >
                                <CodeEditor
                                    disabled={dialogProps?.disabled}
                                    value={inputValue}
                                    height={languageType === 'js' ? 'calc(100vh - 250px)' : 'calc(100vh - 220px)'}
                                    theme={isDarkMode ? 'dark' : 'light'}
                                    lang={languageType}
                                    placeholder={inputParam.placeholder}
                                    basicSetup={
                                        languageType !== 'js'
                                            ? {
                                                  lineNumbers: false,
                                                  foldGutter: false,
                                                  autocompletion: false,
                                                  highlightActiveLine: false
                                              }
                                            : {}
                                    }
                                    onValueChange={(code) => setInputValue(code)}
                                />
                            </PerfectScrollbar>
                        </div>
                    )}
                </div>
                {languageType === 'js' && !inputParam?.hideCodeExecute && onExecute && (
                    <LoadingButton
                        sx={{
                            mt: 2,
                            '&:hover': {
                                backgroundColor: theme.palette.secondary.main,
                                backgroundImage: `linear-gradient(rgb(0 0 0/10%) 0 0)`
                            },
                            '&:disabled': {
                                backgroundColor: theme.palette.secondary.main,
                                backgroundImage: `linear-gradient(rgb(0 0 0/50%) 0 0)`
                            }
                        }}
                        loading={loading}
                        variant='contained'
                        fullWidth
                        color='secondary'
                        onClick={handleExecute}
                    >
                        Execute
                    </LoadingButton>
                )}
                {Boolean(codeExecutedResult) && (
                    <div style={{ marginTop: '15px' }}>
                        <CodeEditor
                            disabled={true}
                            value={
                                typeof codeExecutedResult === 'object'
                                    ? JSON.stringify(codeExecutedResult, null, 2)
                                    : String(codeExecutedResult)
                            }
                            height='max-content'
                            theme={isDarkMode ? 'dark' : 'light'}
                            lang={'js'}
                            basicSetup={{ lineNumbers: false, foldGutter: false, autocompletion: false, highlightActiveLine: false }}
                        />
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{dialogProps?.cancelButtonName}</Button>
                <StyledButton
                    disabled={dialogProps?.disabled}
                    variant='contained'
                    onClick={() => onConfirm?.(inputValue, inputParam?.name)}
                >
                    {dialogProps?.confirmButtonName}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return portalElement ? createPortal(component, portalElement) : <>{component}</>
}

export default ExpandTextDialog

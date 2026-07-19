import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { sublime } from '@uiw/codemirror-theme-sublime'
import { EditorView } from '@codemirror/view'
import { useTheme, Theme } from '@mui/material/styles'

export interface CodeEditorProps {
    value?: string
    height?: string
    theme?: 'dark' | 'light'
    lang?: string
    placeholder?: string
    disabled?: boolean
    autoFocus?: boolean
    basicSetup?: ReactCodeMirrorProps['basicSetup']
    onValueChange?: (value: string) => void
}

export const CodeEditor = ({
    value,
    height,
    theme,
    lang,
    placeholder,
    disabled = false,
    autoFocus = false,
    basicSetup = {},
    onValueChange
}: CodeEditorProps) => {
    const colorTheme = useTheme() as Theme & { darkTextPrimary?: string }

    const customStyle = EditorView.baseTheme({
        '&': {
            color: '#191b1f',
            padding: '10px'
        },
        '.cm-placeholder': {
            color: 'rgba(120, 120, 120, 0.5)'
        },
        '.cm-content':
            lang !== 'js'
                ? {
                      fontFamily: `'Inter', 'Roboto', 'Arial', sans-serif`,
                      fontSize: '0.95rem',
                      letterSpacing: '0em',
                      fontWeight: 400,
                      lineHeight: '1.5em',
                      color: colorTheme.darkTextPrimary ?? ''
                  }
                : {}
    })

    return (
        <CodeMirror
            placeholder={placeholder}
            value={value}
            height={height ?? 'calc(100vh - 220px)'}
            theme={theme === 'dark' ? (lang === 'js' ? vscodeDark : sublime) : 'none'}
            extensions={[lang === 'js' ? javascript({ jsx: true }) : json(), EditorView.lineWrapping, customStyle]}
            onChange={onValueChange}
            readOnly={disabled}
            editable={!disabled}
            // eslint-disable-next-line
            autoFocus={autoFocus}
            basicSetup={basicSetup}
        />
    )
}

export default CodeEditor

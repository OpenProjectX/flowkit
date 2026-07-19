import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'

import { createFlowkitTheme } from './index'
import type { ThemeMode } from './types'

export const THEME_MODE_STORAGE_KEY = 'isDarkMode'

export interface ThemeModeContextValue {
    mode: ThemeMode
    isDarkMode: boolean
    toggleMode: () => void
    setMode: (mode: ThemeMode) => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

export interface FlowkitThemeProviderProps {
    children: ReactNode
    /**
     * Controlled mode. When provided, the parent owns the mode state (e.g. a Redux store)
     * and is notified of requested changes via `onModeChange`.
     */
    mode?: ThemeMode
    /** Called with the requested mode when `setMode`/`toggleMode` is used in controlled mode. */
    onModeChange?: (mode: ThemeMode) => void
    fontFamily?: string
    borderRadius?: number
}

/** Uncontrolled initial mode, matching Flowise's `customizationReducer` initial state. */
const getInitialMode = (): ThemeMode => {
    if (typeof window !== 'undefined' && window.localStorage.getItem(THEME_MODE_STORAGE_KEY) === 'true') return 'dark'
    return 'light'
}

/**
 * Builds the flowkit MUI theme and provides it (plus `CssBaseline`) to the tree.
 * Supports controlled (`mode` + `onModeChange`) and uncontrolled (internal state
 * persisted to `localStorage`) usage.
 */
export const FlowkitThemeProvider = ({
    children,
    mode: controlledMode,
    onModeChange,
    fontFamily,
    borderRadius
}: FlowkitThemeProviderProps) => {
    const isControlled = controlledMode !== undefined
    const [uncontrolledMode, setUncontrolledMode] = useState<ThemeMode>(getInitialMode)

    const mode: ThemeMode = controlledMode ?? uncontrolledMode
    const isDarkMode = mode === 'dark'

    const setMode = useCallback(
        (nextMode: ThemeMode) => {
            if (isControlled) {
                onModeChange?.(nextMode)
            } else {
                setUncontrolledMode(nextMode)
                if (typeof window !== 'undefined') window.localStorage.setItem(THEME_MODE_STORAGE_KEY, String(nextMode === 'dark'))
            }
        },
        [isControlled, onModeChange]
    )

    const toggleMode = useCallback(() => {
        setMode(isDarkMode ? 'light' : 'dark')
    }, [isDarkMode, setMode])

    const theme = useMemo(() => createFlowkitTheme({ mode, fontFamily, borderRadius }), [mode, fontFamily, borderRadius])

    const contextValue = useMemo(() => ({ mode, isDarkMode, toggleMode, setMode }), [mode, isDarkMode, toggleMode, setMode])

    return (
        <ThemeModeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeModeContext.Provider>
    )
}

export const useThemeMode = (): ThemeModeContextValue => {
    const context = useContext(ThemeModeContext)
    if (!context) throw new Error('useThemeMode must be used within a FlowkitThemeProvider')
    return context
}

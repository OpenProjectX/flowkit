import { createTheme } from '@mui/material/styles'
import type { Theme, ThemeOptions } from '@mui/material/styles'

// assets
import colors from './_themes-vars.module.scss'

// project imports
import componentStyleOverrides from './compStyleOverride'
import themePalette from './palette'
import themeTypography from './typography'
import './types'
import type { FlowkitThemeOptions, ThemeColors, ThemeOption } from './types'

/** Defaults matching Flowise (`ui/src/config.js` via `customizationReducer`). */
export const DEFAULT_FONT_FAMILY = `'Inter', 'Roboto', 'Arial', sans-serif`
export const DEFAULT_BORDER_RADIUS = 12

/**
 * Represent theme style and structure as per Material-UI.
 * Ported from Flowise `ui/src/themes/index.js`; the Redux `customization`
 * object is replaced by a plain `FlowkitThemeOptions` object.
 */
export const createFlowkitTheme = (options: FlowkitThemeOptions): Theme => {
    const { mode, fontFamily = DEFAULT_FONT_FAMILY, borderRadius = DEFAULT_BORDER_RADIUS } = options
    const color = colors as ThemeColors
    const isDarkMode = mode === 'dark'

    const themeOption: ThemeOption = isDarkMode
        ? {
              colors: color,
              heading: color.paper,
              paper: color.darkPrimaryLight,
              backgroundDefault: color.darkPaper,
              background: color.darkPrimaryLight,
              darkTextPrimary: color.paper,
              darkTextSecondary: color.paper,
              textDark: color.paper,
              menuSelected: color.darkSecondaryDark,
              menuSelectedBack: color.darkSecondaryLight,
              divider: color.darkPaper,
              isDarkMode,
              fontFamily,
              borderRadius
          }
        : {
              colors: color,
              heading: color.grey900,
              paper: color.paper,
              backgroundDefault: color.paper,
              background: color.primaryLight,
              darkTextPrimary: color.grey700,
              darkTextSecondary: color.grey500,
              textDark: color.grey900,
              menuSelected: color.secondaryDark,
              menuSelectedBack: color.secondaryLight,
              divider: color.grey200,
              isDarkMode,
              fontFamily,
              borderRadius
          }

    const themeOptions: ThemeOptions = {
        direction: 'ltr',
        palette: themePalette(themeOption),
        mixins: {
            toolbar: {
                minHeight: '48px',
                padding: '16px',
                '@media (min-width: 600px)': {
                    minHeight: '48px'
                }
            }
        },
        typography: themeTypography(themeOption)
    }

    const theme = createTheme(themeOptions)
    theme.components = componentStyleOverrides(themeOption)

    return theme
}

export { FlowkitThemeProvider, useThemeMode } from './ThemeProvider'
export type { FlowkitThemeProviderProps, ThemeModeContextValue } from './ThemeProvider'
export type {
    FlowkitThemeOptions,
    ThemeMode,
    ThemeOption,
    ThemeColors,
    SimplePaletteColorVariants,
    DarkPaletteColorVariants,
    TextBackgroundPalette,
    CardPalette,
    CanvasHeaderPalette,
    NodeToolTipPalette,
    CustomTypographyVariant
} from './types'

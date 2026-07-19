import type { CSSProperties } from 'react'

/** Color tokens exported from `_themes-vars.module.scss`. */
export interface ThemeColors {
    [key: string]: string
}

export type ThemeMode = 'light' | 'dark'

/** Public options accepted by `createFlowkitTheme`. Replaces Flowise's Redux `customization` object. */
export interface FlowkitThemeOptions {
    mode: ThemeMode
    fontFamily?: string
    borderRadius?: number
}

/**
 * Internal, fully-resolved theme option passed to the palette/typography/overrides builders.
 * Mirrors Flowise's `themeOption` with `customization.isDarkMode/fontFamily/borderRadius` flattened in.
 */
export interface ThemeOption {
    colors: ThemeColors
    heading: string
    paper: string
    backgroundDefault: string
    background: string
    darkTextPrimary: string
    darkTextSecondary: string
    textDark: string
    menuSelected: string
    menuSelectedBack: string
    divider: string
    isDarkMode: boolean
    fontFamily: string
    borderRadius: number
}

export interface SimplePaletteColorVariants {
    light: string
    main: string
    dark: string
}

export interface DarkPaletteColorVariants extends SimplePaletteColorVariants {
    800: string
    900: string
}

export interface TextBackgroundPalette {
    main: string
    border: string
}

export interface CardPalette {
    main: string
    light: string
    hover: string
}

export interface CanvasHeaderPalette {
    deployLight: string
    deployDark: string
    saveLight: string
    saveDark: string
    settingsLight: string
    settingsDark: string
}

export interface NodeToolTipPalette {
    background: string
    color: string
}

/** Custom typography entries carry nested `& ...` selectors, so allow arbitrary extra keys next to CSS props. */
export type CustomTypographyVariant = CSSProperties & Record<string, unknown>

declare module '@mui/material/styles' {
    interface Palette {
        transparent: string
        dark: DarkPaletteColorVariants
        orange: SimplePaletteColorVariants
        teal: SimplePaletteColorVariants
        textBackground: TextBackgroundPalette
        card: CardPalette
        asyncSelect: { main: string }
        timeMessage: { main: string }
        canvasHeader: CanvasHeaderPalette
        codeEditor: { main: string }
        nodeToolTip: NodeToolTipPalette
    }

    interface PaletteOptions {
        transparent?: string
        dark?: DarkPaletteColorVariants
        orange?: SimplePaletteColorVariants
        teal?: SimplePaletteColorVariants
        textBackground?: TextBackgroundPalette
        card?: CardPalette
        asyncSelect?: { main: string }
        timeMessage?: { main: string }
        canvasHeader?: CanvasHeaderPalette
        codeEditor?: { main: string }
        nodeToolTip?: NodeToolTipPalette
    }

    interface CommonColors {
        dark: string
    }

    interface PaletteColor {
        200?: string
        800?: string
    }

    interface SimplePaletteColorOptions {
        200?: string
        800?: string
    }

    interface TypeText {
        dark: string
        hint: string
    }

    interface TypographyVariants {
        customInput: CustomTypographyVariant
        mainContent: CustomTypographyVariant
        menuCaption: CustomTypographyVariant
        subMenuCaption: CustomTypographyVariant
        commonAvatar: CustomTypographyVariant
        smallAvatar: CustomTypographyVariant
        mediumAvatar: CustomTypographyVariant
        largeAvatar: CustomTypographyVariant
    }

    interface TypographyVariantsOptions {
        customInput?: CustomTypographyVariant
        mainContent?: CustomTypographyVariant
        menuCaption?: CustomTypographyVariant
        subMenuCaption?: CustomTypographyVariant
        commonAvatar?: CustomTypographyVariant
        smallAvatar?: CustomTypographyVariant
        mediumAvatar?: CustomTypographyVariant
        largeAvatar?: CustomTypographyVariant
    }
}

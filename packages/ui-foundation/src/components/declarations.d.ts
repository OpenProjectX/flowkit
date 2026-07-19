/**
 * Local ambient module declarations for packages that do not ship TypeScript types
 * (and have no `@types/*` packages published on npm), plus framer-motion@4 whose
 * bundled types are unreachable because its package.json "exports" map has no
 * "types" condition (moduleResolution: bundler).
 */

declare module 'framer-motion' {
    import { ComponentType, CSSProperties, ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'

    export interface MotionProps {
        children?: ReactNode
        animate?: Record<string, unknown> | boolean | string
        transition?: Record<string, unknown>
        whileHover?: Record<string, unknown>
        whileTap?: Record<string, unknown>
        onHoverStart?: () => void
        onHoverEnd?: () => void
        style?: CSSProperties
        [key: string]: unknown
    }

    export const motion: {
        div: ForwardRefExoticComponent<MotionProps & RefAttributes<HTMLDivElement>>
    } & Record<string, ComponentType<any>>

    export function useCycle<T>(...items: T[]): [T, (index?: number) => void]
}

declare module 'react-perfect-scrollbar' {
    import { Component, CSSProperties, ReactNode } from 'react'

    export interface ScrollBarProps {
        style?: CSSProperties
        className?: string
        children?: ReactNode
        option?: { [key: string]: unknown }
        onScroll?: (container: HTMLElement) => void
        [key: string]: unknown
    }

    export default class PerfectScrollbar extends Component<ScrollBarProps> {}
}

declare module 'react-json-view' {
    import * as React from 'react'

    export interface ReactJsonViewProps {
        /** This property contains your input JSON. Required. */
        src: object
        /** Contains the name of your root node. Use null or false for no name. Default: "root" */
        name?: string | null | false
        /** RJV supports base-16 themes. Default: "rjv-default" */
        theme?: ThemeKeys | ThemeObject
        /** Style attributes for react-json-view container. */
        style?: React.CSSProperties
        /** Style of expand/collapse icons. Default: "circle" */
        iconStyle?: 'circle' | 'triangle' | 'square'
        /** Set the indent-width for nested objects. Default: 4 */
        indentWidth?: number
        /** When set to true, all nodes will be collapsed by default. Default: false */
        collapsed?: boolean | number
        /** Strings will be cut off at that length when an integer value is assigned. Default: false */
        collapseStringsAfterLength?: number | false
        /** Callback to control what objects and arrays should be collapsed by default. Default: false */
        shouldCollapse?: false | ((field: CollapsedFieldProps) => boolean)
        /** Arrays will be displayed in groups by count of the value. Default: 100 */
        groupArraysAfterLength?: number
        /** When prop is not false, the user can copy objects and arrays to clipboard. Default: true */
        enableClipboard?: boolean | ((copy: OnCopyProps) => void)
        /** When set to true, objects and arrays are labeled with size. Default: true */
        displayObjectSize?: boolean
        /** When set to true, data type labels prefix values. Default: true */
        displayDataTypes?: boolean
        /** Set to false to remove quotes from keys. Default: true */
        quotesOnKeys?: boolean
        /** Edit callback; returning false prevents the change. Default: false */
        onEdit?: ((edit: InteractionProps) => false | any) | false
        /** Add callback; returning false prevents the change. Default: false */
        onAdd?: ((add: InteractionProps) => false | any) | false
        /** Delete callback; returning false prevents the change. Default: false */
        onDelete?: ((del: InteractionProps) => false | any) | false
        /** Clicking a value triggers the onSelect method. Default: false */
        onSelect?: ((select: OnSelectProps) => void) | false
        /** Mouse-up callback on entries (supported by Flowise's fork; ignored by upstream react-json-view). Default: false */
        onMouseUp?: ((event: any) => void) | false
        /** Custom message for validation failures. Default: "Validation Error" */
        validationMessage?: string
        /** Set to true to sort object keys. Default: false */
        sortKeys?: boolean
        /** Value to be used as defaultValue when adding new key to json. Default: null */
        defaultValue?: TypeDefaultValue | TypeDefaultValue[] | null
    }

    export interface OnCopyProps {
        /** The JSON tree source object */
        src: object
        /** List of keys. */
        namespace: Array<string | null>
        /** The last key in the namespace array. */
        name: string | null
    }

    export interface CollapsedFieldProps {
        /** The name of the entry. */
        name: string | null
        /** The corresponding JSON subtree. */
        src: object
        /** The type of src. Can only be "array" or "object". */
        type: 'array' | 'object'
        /** The scopes above the current entry. */
        namespace: Array<string | null>
    }

    export interface InteractionProps {
        /** The updated subtree of the JSON tree. */
        updated_src: Record<string, any>
        /** The existing subtree of the JSON tree. */
        existing_src: object
        /** The key of the entry that is interacted with. */
        name: string | null
        /** List of keys. */
        namespace: Array<string | null>
        /** The original value of the entry that is interacted with. */
        existing_value: object | string | number | boolean | null
        /** The updated value of the entry that is interacted with. */
        new_value?: object | string | number | boolean | null
    }

    export interface OnSelectProps {
        /** The name of the currently selected entry. */
        name: string | null
        /** The value of the currently selected entry. */
        value: object | string | number | boolean | null
        /** The type of the value. */
        type: string
        /** List of keys representing the scopes above the selected entry. */
        namespace: Array<string | null>
    }

    export type TypeDefaultValue = string | number | boolean | object

    export interface ThemeObject {
        base00: string
        base01: string
        base02: string
        base03: string
        base04: string
        base05: string
        base06: string
        base07: string
        base08: string
        base09: string
        base0A: string
        base0B: string
        base0C: string
        base0D: string
        base0E: string
        base0F: string
    }

    export type ThemeKeys =
        | 'apathy'
        | 'apathy:inverted'
        | 'ashes'
        | 'bespin'
        | 'brewer'
        | 'bright:inverted'
        | 'bright'
        | 'chalk'
        | 'codeschool'
        | 'colors'
        | 'eighties'
        | 'embers'
        | 'flat'
        | 'google'
        | 'grayscale'
        | 'grayscale:inverted'
        | 'greenscreen'
        | 'harmonic'
        | 'hopscotch'
        | 'isotope'
        | 'marrakesh'
        | 'mocha'
        | 'monokai'
        | 'ocean'
        | 'paraiso'
        | 'pop'
        | 'railscasts'
        | 'rjv-default'
        | 'shapeshifter'
        | 'shapeshifter:inverted'
        | 'solarized'
        | 'summerfruit'
        | 'summerfruit:inverted'
        | 'threezerotwofour'
        | 'tomorrow'
        | 'tube'
        | 'twilight'

    declare const ReactJson: React.ComponentType<ReactJsonViewProps>
    export default ReactJson
}

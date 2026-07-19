/**
 * Generic shape of an input parameter descriptor consumed by the form
 * components (Input, SensitiveInput, ExpandTextDialog, JsonEditorInput, ...).
 * Mirrors Flowise's node `inputParams` entries without depending on Flowise.
 */
export interface InputParamHint {
    label?: string
    [key: string]: unknown
}

export interface InputParam {
    name: string
    label?: string
    type?: string
    id?: string
    placeholder?: string
    rows?: number
    step?: number
    acceptVariable?: boolean
    enablePasswordToggle?: boolean
    hideCodeExecute?: boolean
    hint?: InputParamHint
    [key: string]: unknown
}

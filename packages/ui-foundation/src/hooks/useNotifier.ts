import { useSnackbar } from 'notistack'
import type { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack'

export interface UseNotifier {
    /** Enqueue a snackbar. Defaults mirror Flowise's `enqueueSnackbar` action (persist: false, autoHideDuration: 5000). */
    notify: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey
    success: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey
    error: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey
    warning: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey
    info: (message: SnackbarMessage, options?: OptionsObject) => SnackbarKey
    /** Dismiss a snackbar by key, or all snackbars when no key is given. */
    close: (key?: SnackbarKey) => void
}

/**
 * Decoupled port of Flowise `ui/src/utils/useNotifier.js`: instead of watching a Redux
 * notification queue, it calls notistack's `enqueueSnackbar` directly.
 */
export const useNotifier = (): UseNotifier => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const notify = (message: SnackbarMessage, options: OptionsObject = {}) =>
        enqueueSnackbar(message, {
            persist: false,
            autoHideDuration: 5000,
            ...options
        })

    const success = (message: SnackbarMessage, options: OptionsObject = {}) => notify(message, { ...options, variant: 'success' })

    const error = (message: SnackbarMessage, options: OptionsObject = {}) => notify(message, { ...options, variant: 'error' })

    const warning = (message: SnackbarMessage, options: OptionsObject = {}) => notify(message, { ...options, variant: 'warning' })

    const info = (message: SnackbarMessage, options: OptionsObject = {}) => notify(message, { ...options, variant: 'info' })

    return { notify, success, error, warning, info, close: closeSnackbar }
}

export {
    throttle,
    generateRandomGradient,
    isValidURL,
    formatBytes,
    kFormatter,
    truncateString,
    getOS,
    removeDuplicateURL,
    formatDataGridRows,
    convertDateStringToDateObject
} from './genericHelper'
export type { OperatingSystem, SourceDocumentLike } from './genericHelper'

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 */
export const debounce = <A extends unknown[]>(func: (...args: A) => void, wait: number): ((...args: A) => void) => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    return (...args: A) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

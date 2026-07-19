import moment from 'moment'

/**
 * Generic helpers ported from Flowise `ui/src/utils/genericHelper.js`
 * (only the framework-agnostic subset; behavior kept identical).
 */

export const throttle = <A extends unknown[]>(func: (...args: A) => void, limit: number): ((...args: A) => void) => {
    let lastFunc: ReturnType<typeof setTimeout> | undefined
    let lastRan: number | undefined

    return (...args: A) => {
        if (!lastRan) {
            func(...args)
            lastRan = Date.now()
        } else {
            clearTimeout(lastFunc)
            lastFunc = setTimeout(() => {
                if (Date.now() - (lastRan as number) >= limit) {
                    func(...args)
                    lastRan = Date.now()
                }
            }, limit - (Date.now() - lastRan))
        }
    }
}

export const generateRandomGradient = (): string => {
    const randomColor = (): string => {
        let color = 'rgb('
        for (let i = 0; i < 3; i++) {
            const random = Math.floor(Math.random() * 256)
            color += random
            if (i < 2) {
                color += ','
            }
        }
        color += ')'
        return color
    }

    return 'linear-gradient(' + randomColor() + ', ' + randomColor() + ')'
}

export const isValidURL = (url: string | undefined | null): URL | undefined => {
    try {
        return new URL(url as string)
    } catch {
        return undefined
    }
}

export const formatBytes = (bytes?: number | null): string => {
    if (bytes === null || bytes === undefined || bytes <= 0) {
        return '0 Bytes'
    }
    let number = bytes
    let scaleCounter = 0
    const scaleInitials = [' Bytes', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB']
    while (number >= 1024 && scaleCounter < scaleInitials.length - 1) {
        number /= 1024
        scaleCounter++
    }
    if (scaleCounter >= scaleInitials.length) scaleCounter = scaleInitials.length - 1
    let compactNumber = number
        .toFixed(2)
        .replace(/\.?0+$/, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    compactNumber += scaleInitials[scaleCounter]
    return compactNumber.trim()
}

// Formatter from: https://stackoverflow.com/a/9462382
export const kFormatter = (num: number): string => {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'G' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'P' },
        { value: 1e18, symbol: 'E' }
    ]
    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/
    const item = [...lookup].reverse().find((entry) => num >= entry.value)
    return item ? (num / item.value).toFixed(1).replace(regexp, '').concat(item.symbol) : '0'
}

export const truncateString = (str: string, maxLength: number): string => {
    return str.length > maxLength ? `${str.slice(0, maxLength - 3)}...` : str
}

export type OperatingSystem = 'macos' | 'ios' | 'windows' | 'android' | 'linux'

export const getOS = (): OperatingSystem | null => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i
    const windowsPlatforms = /(win32|win64|windows|wince)/i
    const iosPlatforms = /(iphone|ipad|ipod)/i
    let os: OperatingSystem | null = null

    if (macosPlatforms.test(userAgent)) {
        os = 'macos'
    } else if (iosPlatforms.test(userAgent)) {
        os = 'ios'
    } else if (windowsPlatforms.test(userAgent)) {
        os = 'windows'
    } else if (/android/.test(userAgent)) {
        os = 'android'
    } else if (!os && /linux/.test(userAgent)) {
        os = 'linux'
    }

    return os
}

export interface SourceDocumentLike {
    metadata?: {
        source?: string
        [key: string]: unknown
    }
    [key: string]: unknown
}

export const removeDuplicateURL = <T extends SourceDocumentLike>(message: { sourceDocuments?: T[] | null }): T[] => {
    const visitedURLs: string[] = []
    const newSourceDocuments: T[] = []

    if (!message.sourceDocuments) return newSourceDocuments

    message.sourceDocuments.forEach((source) => {
        if (source && source.metadata && source.metadata.source) {
            if (isValidURL(source.metadata.source) && !visitedURLs.includes(source.metadata.source)) {
                visitedURLs.push(source.metadata.source)
                newSourceDocuments.push(source)
            } else if (!isValidURL(source.metadata.source)) {
                newSourceDocuments.push(source)
            }
        } else if (source) {
            newSourceDocuments.push(source)
        }
    })
    return newSourceDocuments
}

export const formatDataGridRows = <T extends Record<string, unknown> = Record<string, unknown>>(
    rows: string | T[]
): Array<T & { id: number }> => {
    try {
        const parsedRows: T[] = typeof rows === 'string' ? JSON.parse(rows) : rows
        return parsedRows.map((sch, index) => {
            return {
                ...sch,
                id: index
            }
        })
    } catch {
        return []
    }
}

export const convertDateStringToDateObject = (dateString?: string): Date | undefined => {
    if (dateString === undefined || !dateString) return undefined

    const date = moment(dateString)
    if (!date.isValid()) return undefined

    // Sat Sep 24 2022 07:30:14
    return new Date(date.year(), date.month(), date.date(), date.hours(), date.minutes())
}

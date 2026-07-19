import {
    convertDateStringToDateObject,
    formatBytes,
    formatDataGridRows,
    generateRandomGradient,
    getOS,
    isValidURL,
    kFormatter,
    removeDuplicateURL,
    throttle,
    truncateString
} from './genericHelper'
import moment from 'moment'

// keep test output clean: moment warns when parsing non-RFC2822/ISO strings (e.g. the invalid-input case below)
moment.suppressDeprecationWarnings = true

describe('throttle', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('invokes the function immediately on the first call', () => {
        const fn = jest.fn()
        const throttled = throttle(fn, 1000)
        throttled('a')
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith('a')
    })

    it('delays a second call made within the limit', () => {
        const fn = jest.fn()
        const throttled = throttle(fn, 1000)
        throttled()
        throttled()
        expect(fn).toHaveBeenCalledTimes(1)
        jest.advanceTimersByTime(1000)
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it('only fires the last of several rapid trailing calls', () => {
        const fn = jest.fn()
        const throttled = throttle(fn, 1000)
        throttled('first')
        throttled('second')
        throttled('third')
        expect(fn).toHaveBeenCalledTimes(1)
        jest.advanceTimersByTime(1000)
        expect(fn).toHaveBeenCalledTimes(2)
        expect(fn).toHaveBeenLastCalledWith('third')
    })

    it('does not fire the trailing call before the remaining delay has elapsed', () => {
        const fn = jest.fn()
        const throttled = throttle(fn, 1000)
        throttled()
        jest.advanceTimersByTime(400)
        throttled()
        jest.advanceTimersByTime(300)
        expect(fn).toHaveBeenCalledTimes(1)
        jest.advanceTimersByTime(300)
        expect(fn).toHaveBeenCalledTimes(2)
    })
})

describe('generateRandomGradient', () => {
    it('returns a linear-gradient with two rgb colors', () => {
        const gradient = generateRandomGradient()
        expect(gradient).toMatch(/^linear-gradient\(rgb\(\d{1,3},\d{1,3},\d{1,3}\), rgb\(\d{1,3},\d{1,3},\d{1,3}\)\)$/)
    })

    it('generates channel values within 0-255', () => {
        for (let i = 0; i < 50; i++) {
            const gradient = generateRandomGradient()
            const channels = gradient.match(/\d+/g)?.map(Number) ?? []
            expect(channels).toHaveLength(6)
            channels.forEach((channel) => {
                expect(channel).toBeGreaterThanOrEqual(0)
                expect(channel).toBeLessThanOrEqual(255)
            })
        }
    })
})

describe('isValidURL', () => {
    it('returns a URL object for valid URLs', () => {
        const result = isValidURL('https://example.com/path?q=1')
        expect(result).toBeInstanceOf(URL)
        expect(result?.hostname).toBe('example.com')
    })

    it('returns undefined for invalid URLs', () => {
        expect(isValidURL('not a url')).toBeUndefined()
        expect(isValidURL('')).toBeUndefined()
        expect(isValidURL('example.com')).toBeUndefined()
    })

    it('returns undefined for undefined/null input', () => {
        expect(isValidURL(undefined)).toBeUndefined()
        expect(isValidURL(null)).toBeUndefined()
    })
})

describe('formatBytes', () => {
    it('returns "0 Bytes" for nullish or non-positive input', () => {
        expect(formatBytes()).toBe('0 Bytes')
        expect(formatBytes(null)).toBe('0 Bytes')
        expect(formatBytes(0)).toBe('0 Bytes')
        expect(formatBytes(-1024)).toBe('0 Bytes')
    })

    it('formats bytes without a scale suffix under 1024', () => {
        expect(formatBytes(1)).toBe('1 Bytes')
        expect(formatBytes(500)).toBe('500 Bytes')
        expect(formatBytes(1023)).toBe('1,023 Bytes')
    })

    it('scales to KB, MB and GB', () => {
        expect(formatBytes(1024)).toBe('1 KB')
        expect(formatBytes(1536)).toBe('1.5 KB')
        expect(formatBytes(1024 * 1024)).toBe('1 MB')
        expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
    })

    it('rounds to two decimals and strips trailing zeros', () => {
        expect(formatBytes(2500)).toBe('2.44 KB')
        expect(formatBytes(123456789)).toBe('117.74 MB')
    })

    it('adds thousand separators for large numbers', () => {
        expect(formatBytes(1234 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toBe('1,234 YB')
    })
})

describe('kFormatter', () => {
    it('returns "0" when below the first lookup value', () => {
        expect(kFormatter(0)).toBe('0')
        expect(kFormatter(-5)).toBe('0')
    })

    it('keeps numbers under 1000 as-is', () => {
        expect(kFormatter(1)).toBe('1')
        expect(kFormatter(999)).toBe('999')
    })

    it('formats thousands, millions and billions', () => {
        expect(kFormatter(1000)).toBe('1k')
        expect(kFormatter(1100)).toBe('1.1k')
        expect(kFormatter(1500)).toBe('1.5k')
        expect(kFormatter(1000000)).toBe('1M')
        expect(kFormatter(2500000)).toBe('2.5M')
        expect(kFormatter(1000000000)).toBe('1G')
    })
})

describe('truncateString', () => {
    it('returns the string unchanged when within maxLength', () => {
        expect(truncateString('short', 10)).toBe('short')
        expect(truncateString('exactly10c', 10)).toBe('exactly10c')
    })

    it('truncates and appends ellipsis when exceeding maxLength', () => {
        expect(truncateString('hello world', 8)).toBe('hello...')
        expect(truncateString('hello world', 11)).toBe('hello world')
    })
})

describe('getOS', () => {
    const setUserAgent = (userAgent: string) => {
        ;(globalThis as Record<string, unknown>).window = { navigator: { userAgent } }
    }

    afterEach(() => {
        delete (globalThis as Record<string, unknown>).window
    })

    it('detects macos', () => {
        setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
        expect(getOS()).toBe('macos')
    })

    it('detects ios', () => {
        setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15')
        expect(getOS()).toBe('ios')
    })

    it('detects windows', () => {
        setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        expect(getOS()).toBe('windows')
    })

    it('detects android', () => {
        setUserAgent('Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36')
        expect(getOS()).toBe('android')
    })

    it('detects linux', () => {
        setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36')
        expect(getOS()).toBe('linux')
    })

    it('returns null for an unknown user agent', () => {
        setUserAgent('curl/7.68.0')
        expect(getOS()).toBeNull()
    })
})

describe('removeDuplicateURL', () => {
    it('returns an empty array when there are no sourceDocuments', () => {
        expect(removeDuplicateURL({})).toEqual([])
        expect(removeDuplicateURL({ sourceDocuments: null })).toEqual([])
    })

    it('removes duplicate valid URL sources, keeping the first occurrence', () => {
        const message = {
            sourceDocuments: [
                { pageContent: 'a', metadata: { source: 'https://example.com' } },
                { pageContent: 'b', metadata: { source: 'https://example.com' } },
                { pageContent: 'c', metadata: { source: 'https://other.com' } }
            ]
        }
        const result = removeDuplicateURL(message)
        expect(result).toHaveLength(2)
        expect(result.map((doc) => doc.pageContent)).toEqual(['a', 'c'])
    })

    it('keeps non-URL sources even when duplicated', () => {
        const message = {
            sourceDocuments: [{ metadata: { source: 'local-file.pdf' } }, { metadata: { source: 'local-file.pdf' } }]
        }
        expect(removeDuplicateURL(message)).toHaveLength(2)
    })

    it('keeps sources without metadata or source', () => {
        const message = {
            sourceDocuments: [{ pageContent: 'no metadata' }, { metadata: {} }]
        }
        expect(removeDuplicateURL(message)).toHaveLength(2)
    })
})

describe('formatDataGridRows', () => {
    it('parses a JSON string and adds positional ids', () => {
        const result = formatDataGridRows('[{"name":"a"},{"name":"b"}]')
        expect(result).toEqual([
            { name: 'a', id: 0 },
            { name: 'b', id: 1 }
        ])
    })

    it('accepts an array directly and preserves extra fields', () => {
        const result = formatDataGridRows([{ name: 'a', value: 42 }])
        expect(result).toEqual([{ name: 'a', value: 42, id: 0 }])
    })

    it('returns an empty array for invalid JSON', () => {
        expect(formatDataGridRows('not json')).toEqual([])
    })

    it('returns an empty array for non-array JSON', () => {
        expect(formatDataGridRows('{"name":"a"}')).toEqual([])
    })
})

describe('convertDateStringToDateObject', () => {
    it('returns undefined for undefined or empty input', () => {
        expect(convertDateStringToDateObject(undefined)).toBeUndefined()
        expect(convertDateStringToDateObject('')).toBeUndefined()
    })

    it('returns undefined for an invalid date string', () => {
        expect(convertDateStringToDateObject('not-a-date')).toBeUndefined()
    })

    it('converts a valid date string to a Date (without seconds)', () => {
        const result = convertDateStringToDateObject('2022-09-24T07:30:14')
        expect(result).toBeInstanceOf(Date)
        expect(result?.getFullYear()).toBe(2022)
        expect(result?.getMonth()).toBe(8)
        expect(result?.getDate()).toBe(24)
        expect(result?.getHours()).toBe(7)
        expect(result?.getMinutes()).toBe(30)
        expect(result?.getSeconds()).toBe(0)
    })
})

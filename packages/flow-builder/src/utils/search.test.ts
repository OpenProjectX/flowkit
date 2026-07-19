import { fuzzyScore, scoreAndSortNodes } from './search'

describe('fuzzyScore', () => {
    test('empty search scores 0', () => {
        expect(fuzzyScore('', 'anything')).toBe(0)
    })

    test('exact substring match beats fuzzy match', () => {
        const exact = fuzzyScore('http', 'httpSource')
        const fuzzy = fuzzyScore('htpsrc', 'httpSource')
        expect(exact).toBeGreaterThan(fuzzy)
        expect(fuzzy).toBeGreaterThan(0)
    })

    test('match at start gets bonus', () => {
        expect(fuzzyScore('http', 'httpSource')).toBeGreaterThan(fuzzyScore('source', 'httpSource'))
    })

    test('returns 0 when not all characters match', () => {
        expect(fuzzyScore('httz', 'httpSource')).toBe(0)
    })
})

describe('scoreAndSortNodes', () => {
    const nodes = [
        { name: 'httpSource', label: 'HTTP Source', category: 'Sources' },
        { name: 's3Sink', label: 'S3 Sink', category: 'Sinks' },
        { name: 'mapper', label: 'Mapper', category: 'Transforms' }
    ]

    test('empty search returns input order', () => {
        expect(scoreAndSortNodes(nodes, '')).toEqual(nodes)
    })

    test('filters and sorts by relevance', () => {
        const result = scoreAndSortNodes(nodes, 'http')
        expect(result.map((n) => n.name)).toEqual(['httpSource'])
    })

    test('category matches at lower weight', () => {
        const byCategory = scoreAndSortNodes(nodes, 'sour')
        expect(byCategory[0].name).toBe('httpSource')
    })

    test('no match returns empty', () => {
        expect(scoreAndSortNodes(nodes, 'zzz')).toEqual([])
    })
})

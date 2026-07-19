import { showHideInputParams, showHideInputAnchors, applyVisibleInputDefaults } from './visibility'
import type { InputParam } from '../types'

const param = (overrides: Partial<InputParam>): InputParam => ({ label: 'P', name: 'p', type: 'string', ...overrides })

describe('showHideInputParams', () => {
    test('defaults to visible', () => {
        const [p] = showHideInputParams({ inputParams: [param({})], inputs: {} })
        expect(p.display).toBe(true)
    })

    test('show rule hides param when condition unmet', () => {
        const params = [param({ show: { mode: 'advanced' } })]
        const [p] = showHideInputParams({ inputParams: params, inputs: { mode: 'basic' } })
        expect(p.display).toBe(false)
    })

    test('show rule keeps param when condition met', () => {
        const params = [param({ show: { mode: 'advanced' } })]
        const [p] = showHideInputParams({ inputParams: params, inputs: { mode: 'advanced' } })
        expect(p.display).toBe(true)
    })

    test('hide rule hides param when condition met', () => {
        const params = [param({ hide: { mode: 'basic' } })]
        const [p] = showHideInputParams({ inputParams: params, inputs: { mode: 'basic' } })
        expect(p.display).toBe(false)
    })

    test('boolean comparison', () => {
        const params = [param({ show: { enableMemory: true } })]
        const [hidden] = showHideInputParams({ inputParams: [param({ show: { enableMemory: true } })], inputs: { enableMemory: false } })
        expect(hidden.display).toBe(false)
        const [shown] = showHideInputParams({ inputParams: params, inputs: { enableMemory: true } })
        expect(shown.display).toBe(true)
    })

    test('array ground value intersects array comparison', () => {
        const params = [param({ show: { tags: ['a', 'b'] } })]
        const [shown] = showHideInputParams({ inputParams: params, inputs: { tags: ['b', 'c'] } })
        expect(shown.display).toBe(true)
        const [hidden] = showHideInputParams({ inputParams: params, inputs: { tags: ['x'] } })
        expect(hidden.display).toBe(false)
    })

    test('JSON-string array ground value is parsed', () => {
        const params = [param({ show: { tags: 'a' } })]
        const [shown] = showHideInputParams({ inputParams: params, inputs: { tags: '["a","b"]' } })
        expect(shown.display).toBe(true)
    })

    test('regex string comparison', () => {
        const params = [param({ show: { name: '^gpt' } })]
        const [shown] = showHideInputParams({ inputParams: params, inputs: { name: 'gpt-4' } })
        expect(shown.display).toBe(true)
        const [hidden] = showHideInputParams({ inputParams: params, inputs: { name: 'claude' } })
        expect(hidden.display).toBe(false)
    })

    test('declared defaults participate in visibility', () => {
        const mode = param({ name: 'mode', type: 'options', default: 'advanced' })
        const dependent = param({ show: { mode: 'advanced' } })
        const [_, dep] = showHideInputParams({ inputParams: [mode, dependent], inputs: {} })
        expect(dep.display).toBe(true)
    })

    test('options within a dropdown are filtered by their own show/hide', () => {
        const params = [
            param({
                name: 'provider',
                type: 'options',
                options: [
                    { label: 'A', name: 'a' },
                    { label: 'B', name: 'b', show: { tier: 'pro' } }
                ] as any
            })
        ]
        const [p] = showHideInputParams({ inputParams: params, inputs: { tier: 'free' } })
        expect(p.options!.map((o) => o.name)).toEqual(['a'])
    })

    test('works for inputAnchors too', () => {
        const anchors = [param({ show: { mode: 'advanced' } })]
        const [a] = showHideInputAnchors({ inputAnchors: anchors, inputs: { mode: 'basic' } })
        expect(a.display).toBe(false)
    })
})

describe('applyVisibleInputDefaults', () => {
    test('applies defaults only for visible params, never overwrites existing', () => {
        const params = [
            param({ name: 'a', default: 'A' }),
            param({ name: 'b', default: 'B', show: { mode: 'advanced' } }),
            param({ name: 'c', default: 'C' })
        ]
        const result = applyVisibleInputDefaults(params, { c: 'custom', mode: 'basic' })
        expect(result).toEqual({ a: 'A', c: 'custom', mode: 'basic' })
    })
})

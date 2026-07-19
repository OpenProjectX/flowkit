import type { Connection, Edge } from 'reactflow'
import type { BuilderNode } from '../types'
import {
    buildInputHandleId,
    buildOutputHandleId,
    parseHandleTypes,
    typesIntersect,
    respectsListAnchors,
    wouldCreateCycle,
    noSelfNoCycles,
    defaultIsValidConnection,
    typedPortsIsValidConnection
} from './handles'

describe('handle id build/parse', () => {
    test('round-trips input handle ids', () => {
        const id = buildInputHandleId('llm_0', 'model', 'BaseLanguageModel|BaseChatModel')
        expect(id).toBe('llm_0-input-model-BaseLanguageModel|BaseChatModel')
        expect(parseHandleTypes(id)).toEqual(['BaseLanguageModel', 'BaseChatModel'])
    })

    test('round-trips output handle ids with array types', () => {
        const id = buildOutputHandleId('chain_0', 'llmChain', ['BaseChain', 'BaseRunnable'])
        expect(id).toBe('chain_0-output-llmChain-BaseChain|BaseRunnable')
        expect(parseHandleTypes(id)).toEqual(['BaseChain', 'BaseRunnable'])
    })

    test('parses single type', () => {
        expect(parseHandleTypes('x_0-output-0-string')).toEqual(['string'])
    })
})

describe('typesIntersect', () => {
    const conn = (sourceHandle: string, targetHandle: string): Connection =>
        ({ source: 'a_0', target: 'b_0', sourceHandle, targetHandle } as Connection)

    test('true when types overlap', () => {
        expect(typesIntersect(conn('a_0-output-x-A|B', 'b_0-input-y-B|C'))).toBe(true)
    })

    test('false when no overlap', () => {
        expect(typesIntersect(conn('a_0-output-x-A', 'b_0-input-y-B'))).toBe(false)
    })

    test('false when handles missing', () => {
        expect(typesIntersect({ source: 'a_0', target: 'b_0' } as Connection)).toBe(false)
    })
})

describe('respectsListAnchors', () => {
    const node = (anchorOverrides: Partial<BuilderNode['data']['inputAnchors'][0]>): BuilderNode =>
        ({
            id: 'b_0',
            data: {
                inputAnchors: [{ id: 'b_0-input-model-LLM', name: 'model', label: 'Model', type: 'LLM', ...anchorOverrides }],
                inputParams: []
            }
        } as unknown as BuilderNode)

    const existingEdge = { id: 'e1', source: 'a_0', target: 'b_0', targetHandle: 'b_0-input-model-LLM' } as Edge

    test('list anchors accept multiple edges', () => {
        expect(
            respectsListAnchors(
                { target: 'b_0', targetHandle: 'b_0-input-model-LLM' } as Connection,
                [node({ list: true })],
                [existingEdge]
            )
        ).toBe(true)
    })

    test('non-list anchor rejects second edge', () => {
        expect(respectsListAnchors({ target: 'b_0', targetHandle: 'b_0-input-model-LLM' } as Connection, [node({})], [existingEdge])).toBe(
            false
        )
    })

    test('non-list anchor accepts first edge', () => {
        expect(respectsListAnchors({ target: 'b_0', targetHandle: 'b_0-input-model-LLM' } as Connection, [node({})], [])).toBe(true)
    })
})

describe('wouldCreateCycle', () => {
    const edges = [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'c' }
    ] as Edge[]

    test('detects direct back-edge', () => {
        expect(wouldCreateCycle('b', 'a', edges)).toBe(true)
    })

    test('detects transitive cycle', () => {
        expect(wouldCreateCycle('c', 'a', edges)).toBe(true)
    })

    test('allows forward edge', () => {
        expect(wouldCreateCycle('a', 'c', edges)).toBe(false)
    })

    test('same node is a cycle', () => {
        expect(wouldCreateCycle('a', 'a', [])).toBe(true)
    })
})

describe('noSelfNoCycles / defaultIsValidConnection', () => {
    const edges = [{ id: 'e1', source: 'a', target: 'b' }] as Edge[]

    test('rejects self connection', () => {
        expect(noSelfNoCycles({ source: 'a', target: 'a' } as Connection, edges)).toBe(false)
    })

    test('rejects cycle', () => {
        expect(noSelfNoCycles({ source: 'b', target: 'a' } as Connection, edges)).toBe(false)
    })

    test('accepts fresh forward edge', () => {
        expect(defaultIsValidConnection({ source: 'a', target: 'c' } as Connection, [], edges)).toBe(true)
    })
})

describe('typedPortsIsValidConnection (Flowise v1-style)', () => {
    const target: BuilderNode = {
        id: 'b_0',
        data: {
            inputAnchors: [{ id: 'b_0-input-model-BaseLanguageModel', name: 'model', label: 'Model', type: 'BaseLanguageModel' }],
            inputParams: []
        }
    } as unknown as BuilderNode

    test('accepts matching types with free anchor', () => {
        const conn = {
            source: 'a_0',
            target: 'b_0',
            sourceHandle: 'a_0-output-chat-BaseLanguageModel',
            targetHandle: 'b_0-input-model-BaseLanguageModel'
        } as Connection
        expect(typedPortsIsValidConnection(conn, [target], [])).toBe(true)
    })

    test('rejects mismatched types', () => {
        const conn = {
            source: 'a_0',
            target: 'b_0',
            sourceHandle: 'a_0-output-retriever-BaseRetriever',
            targetHandle: 'b_0-input-model-BaseLanguageModel'
        } as Connection
        expect(typedPortsIsValidConnection(conn, [target], [])).toBe(false)
    })
})

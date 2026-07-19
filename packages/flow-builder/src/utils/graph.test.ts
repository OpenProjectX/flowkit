import type { BuilderNodeSchema } from '../types'
import { getUniqueNodeId, getUniqueNodeLabel, initNode, initializeDefaultNodeData, defaultIsConnectionParam } from './graph'

describe('getUniqueNodeId', () => {
    test('suffixes until unique', () => {
        expect(getUniqueNodeId({ name: 'llm' }, [])).toBe('llm_0')
        expect(getUniqueNodeId({ name: 'llm' }, [{ id: 'llm_0' }])).toBe('llm_1')
        expect(getUniqueNodeId({ name: 'llm' }, [{ id: 'llm_0' }, { id: 'llm_1' }])).toBe('llm_2')
    })
})

describe('getUniqueNodeLabel', () => {
    test('appends the suffix to the label', () => {
        expect(getUniqueNodeLabel({ name: 'llm', label: 'LLM' }, [])).toBe('LLM 0')
        expect(getUniqueNodeLabel({ name: 'llm', label: 'LLM' }, [{ id: 'llm_0' }])).toBe('LLM 1')
    })
})

describe('initializeDefaultNodeData', () => {
    test('seeds defaults, empty string when absent', () => {
        expect(initializeDefaultNodeData([{ name: 'a' }, { name: 'b', default: 42 }])).toEqual({ a: '', b: 42 })
    })
})

describe('defaultIsConnectionParam', () => {
    test('form types are params, class types are anchors', () => {
        expect(defaultIsConnectionParam({ type: 'string' } as any)).toBe(false)
        expect(defaultIsConnectionParam({ type: 'options' } as any)).toBe(false)
        expect(defaultIsConnectionParam({ type: 'BaseLanguageModel' } as any)).toBe(true)
    })
})

describe('initNode', () => {
    const schema: BuilderNodeSchema = {
        name: 'chatLLM',
        label: 'Chat LLM',
        category: 'LLMs',
        baseClasses: ['BaseLanguageModel'],
        inputs: [
            { label: 'Model Name', name: 'modelName', type: 'string', default: 'gpt-4' },
            { label: 'Temperature', name: 'temperature', type: 'number', optional: true },
            { label: 'Memory', name: 'memory', type: 'BaseMemory', optional: true }
        ]
    }

    test('splits inputs into params and anchors with typed handle ids', () => {
        const data = initNode(JSON.parse(JSON.stringify(schema)) as BuilderNodeSchema, 'chatLLM_0')
        expect(data.inputParams!.map((p) => p.name)).toEqual(['modelName', 'temperature'])
        expect(data.inputAnchors!.map((a) => a.name)).toEqual(['memory'])
        expect(data.inputAnchors![0].id).toBe('chatLLM_0-input-memory-BaseMemory')
        expect(data.inputParams![0].id).toBe('chatLLM_0-input-modelName-string')
    })

    test('seeds input defaults', () => {
        const data = initNode(JSON.parse(JSON.stringify(schema)) as BuilderNodeSchema, 'chatLLM_0')
        expect(data.inputs).toEqual({ modelName: 'gpt-4', temperature: '', memory: '' })
    })

    test('multi output strategy (default) creates one anchor when no outputs declared', () => {
        const data = initNode(JSON.parse(JSON.stringify(schema)) as BuilderNodeSchema, 'chatLLM_0')
        expect(data.outputAnchors).toEqual([{ id: 'chatLLM_0-output-chatLLM', label: 'Chat LLM', name: 'chatLLM' }])
    })

    test('multi strategy creates one anchor per declared output', () => {
        const withOutputs: BuilderNodeSchema = { ...JSON.parse(JSON.stringify(schema)), outputs: [{ name: 'yes' }, { name: 'no' }] }
        const data = initNode(withOutputs, 'chatLLM_0')
        expect(data.outputAnchors!.map((o) => o.id)).toEqual(['chatLLM_0-output-0', 'chatLLM_0-output-1'])
    })

    test('standard strategy wraps declared outputs in an options anchor', () => {
        const withOutputs = {
            ...(JSON.parse(JSON.stringify(schema)) as BuilderNodeSchema),
            outputs: [{ name: 'chain', label: 'Chain', baseClasses: ['BaseChain'] }]
        }
        const data = initNode(withOutputs, 'chatLLM_0', { outputStrategy: 'standard' })
        expect(data.outputAnchors![0].type).toBe('options')
        expect(data.outputAnchors![0].options![0].id).toBe('chatLLM_0-output-chain-BaseChain')
    })

    test('standard strategy falls back to baseClasses anchor', () => {
        const data = initNode(JSON.parse(JSON.stringify(schema)) as BuilderNodeSchema, 'chatLLM_0', { outputStrategy: 'standard' })
        expect(data.outputAnchors![0].id).toBe('chatLLM_0-output-chatLLM-BaseLanguageModel')
    })

    test('credential is unshifted into params', () => {
        const withCred: BuilderNodeSchema = {
            ...(JSON.parse(JSON.stringify(schema)) as BuilderNodeSchema),
            credential: { label: 'API Key', name: 'credential', type: 'credential', credentialNames: ['openAIApi'] }
        }
        const data = initNode(withCred, 'chatLLM_0')
        expect(data.inputParams![0].name).toBe('credential')
        expect(data.inputParams![0].id).toBe('chatLLM_0-input-credential-credential')
    })

    test('custom isConnectionParam is honored', () => {
        const data = initNode(JSON.parse(JSON.stringify(schema)) as BuilderNodeSchema, 'chatLLM_0', { isConnectionParam: () => false })
        expect(data.inputAnchors).toEqual([])
        expect(data.inputParams!.length).toBe(3)
    })

    test('hideOutput yields no output anchors', () => {
        const hidden: BuilderNodeSchema = { ...(JSON.parse(JSON.stringify(schema)) as BuilderNodeSchema), hideOutput: true }
        const data = initNode(hidden, 'chatLLM_0')
        expect(data.outputAnchors).toEqual([])
    })
})

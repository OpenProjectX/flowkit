import type { BuilderNodeSchema } from '@flowkit/flow-builder'

/**
 * Static in-memory operator registry for the data-pipeline demo.
 * Typed ports: every operator consumes/emits `Record[]`, enforced by the
 * kit's typedPortsIsValidConnection via handle type signatures.
 */

const RECORD_STREAM = 'Record[]'

export const pipelineOperators: BuilderNodeSchema[] = [
    /* ------------------------------- Sources ------------------------------- */
    {
        name: 'httpSource',
        label: 'HTTP Source',
        category: 'Sources',
        description: 'Fetch records from a REST endpoint on an interval',
        icon: '🌐',
        color: '#7C3AED',
        baseClasses: [RECORD_STREAM],
        inputs: [
            { label: 'URL', name: 'url', type: 'string', placeholder: 'https://api.example.com/data' },
            { label: 'Interval (s)', name: 'interval', type: 'number', default: 60, optional: true },
            {
                label: 'Auth',
                name: 'auth',
                type: 'options',
                options: [
                    { label: 'None', name: 'none' },
                    { label: 'Bearer Token', name: 'bearer' },
                    { label: 'API Key', name: 'apikey' }
                ],
                default: 'none',
                optional: true
            },
            {
                label: 'Token',
                name: 'token',
                type: 'password',
                optional: true,
                show: { auth: ['bearer', 'apikey'] }
            }
        ]
    },
    {
        name: 'csvSource',
        label: 'CSV Upload',
        category: 'Sources',
        description: 'Load records from a CSV file',
        icon: '📄',
        color: '#2563EB',
        baseClasses: [RECORD_STREAM],
        inputs: [
            { label: 'CSV File', name: 'file', type: 'file', fileType: '.csv' },
            { label: 'Has Header', name: 'hasHeader', type: 'boolean', default: true, optional: true }
        ]
    },

    /* ----------------------------- Transforms ------------------------------ */
    {
        name: 'filterRecords',
        label: 'Filter',
        category: 'Transforms',
        description: 'Keep records matching an expression',
        icon: '🔍',
        color: '#059669',
        baseClasses: [RECORD_STREAM],
        inputs: [
            { label: 'Input', name: 'input', type: RECORD_STREAM },
            { label: 'Expression', name: 'expression', type: 'code', placeholder: 'row.amount > 100' }
        ]
    },
    {
        name: 'mapRecords',
        label: 'Map',
        category: 'Transforms',
        description: 'Reshape each record with a JSON mapping',
        icon: '🗺️',
        color: '#0891B2',
        baseClasses: [RECORD_STREAM],
        inputs: [
            { label: 'Input', name: 'input', type: RECORD_STREAM },
            { label: 'Mapping', name: 'mapping', type: 'json', default: '{\n  "id": "$.id"\n}' }
        ]
    },
    {
        name: 'aggregateRecords',
        label: 'Aggregate',
        category: 'Transforms',
        description: 'Group and aggregate records',
        icon: 'Σ',
        color: '#D97706',
        baseClasses: [RECORD_STREAM],
        inputs: [
            { label: 'Input', name: 'input', type: RECORD_STREAM },
            { label: 'Group By', name: 'groupBy', type: 'string' },
            {
                label: 'Operation',
                name: 'operation',
                type: 'options',
                options: [
                    { label: 'Count', name: 'count' },
                    { label: 'Sum', name: 'sum' },
                    { label: 'Average', name: 'avg' }
                ],
                default: 'count'
            },
            { label: 'Field', name: 'field', type: 'string', optional: true, show: { operation: ['sum', 'avg'] } }
        ]
    },

    /* -------------------------------- Sinks -------------------------------- */
    {
        name: 'postgresSink',
        label: 'Postgres Sink',
        category: 'Sinks',
        description: 'Write records to a Postgres table',
        icon: '🐘',
        color: '#DC2626',
        hideOutput: true,
        inputs: [
            { label: 'Input', name: 'input', type: RECORD_STREAM },
            { label: 'Table', name: 'table', type: 'string' },
            {
                label: 'On Conflict',
                name: 'onConflict',
                type: 'options',
                options: [
                    { label: 'Ignore', name: 'ignore' },
                    { label: 'Update', name: 'update' },
                    { label: 'Fail', name: 'fail' }
                ],
                default: 'ignore',
                optional: true
            }
        ]
    },
    {
        name: 'webhookSink',
        label: 'Webhook Sink',
        category: 'Sinks',
        description: 'POST records to a webhook URL',
        icon: '🪝',
        color: '#DB2777',
        hideOutput: true,
        inputs: [
            { label: 'Input', name: 'input', type: RECORD_STREAM },
            { label: 'URL', name: 'url', type: 'string', placeholder: 'https://hooks.example.com/xyz' }
        ]
    }
]

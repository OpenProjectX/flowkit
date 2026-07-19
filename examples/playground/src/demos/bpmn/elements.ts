import type { BuilderNodeSchema } from '@openprojectx/flow-builder'

/**
 * Static BPMN element registry. `bpmn` maps to custom node renderers;
 * everything else rides the kit defaults (palette, dialog editor, dirty flag).
 */
export const bpmnElements: BuilderNodeSchema[] = [
    {
        name: 'startEvent',
        label: 'Start Event',
        category: 'Events',
        description: 'Process entry point',
        color: '#16A34A',
        bpmn: 'start',
        hideInput: true,
        outputs: [{ name: 'out', label: 'Out' }]
    },
    {
        name: 'endEvent',
        label: 'End Event',
        category: 'Events',
        description: 'Process termination',
        color: '#DC2626',
        bpmn: 'end',
        hideOutput: true
    },
    {
        name: 'userTask',
        label: 'User Task',
        category: 'Tasks',
        description: 'Human-performed work',
        color: '#2563EB',
        bpmn: 'task',
        inputs: [
            { label: 'Assignee', name: 'assignee', type: 'string', optional: true },
            { label: 'Due After (days)', name: 'dueDays', type: 'number', optional: true },
            { label: 'Documentation', name: 'documentation', type: 'string', rows: 3, optional: true }
        ],
        outputs: [{ name: 'out', label: 'Out' }]
    },
    {
        name: 'serviceTask',
        label: 'Service Task',
        category: 'Tasks',
        description: 'Automated work (API call, script)',
        color: '#0891B2',
        bpmn: 'task',
        inputs: [
            { label: 'Endpoint', name: 'endpoint', type: 'string' },
            {
                label: 'Method',
                name: 'method',
                type: 'options',
                options: [
                    { label: 'GET', name: 'GET' },
                    { label: 'POST', name: 'POST' }
                ],
                default: 'POST'
            }
        ],
        outputs: [{ name: 'out', label: 'Out' }]
    },
    {
        name: 'exclusiveGateway',
        label: 'Exclusive Gateway',
        category: 'Gateways',
        description: 'XOR split: exactly one outgoing path is taken',
        color: '#D97706',
        bpmn: 'gateway',
        inputs: [{ label: 'Condition', name: 'condition', type: 'string', optional: true }],
        outputs: [
            { name: 'yes', label: 'Yes' },
            { name: 'no', label: 'No' }
        ]
    }
]

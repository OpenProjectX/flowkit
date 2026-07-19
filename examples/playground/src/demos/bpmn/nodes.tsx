import { memo } from 'react'
import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { Typography } from '@mui/material'
import type { BuilderNodeData } from '@openprojectx/flow-builder'

/**
 * Custom BPMN node shapes. The kit renders these via `config.nodeRenderers`;
 * handle ids come from `data.outputAnchors` / the node id so connections and
 * serialization stay consistent with the kit's conventions.
 */

const handleStyle: React.CSSProperties = { width: 8, height: 8, background: '#555' }

export const BpmnStartNode = memo(({ data, selected }: NodeProps<BuilderNodeData>) => (
    <div
        style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#DCFCE7',
            border: `2px solid ${selected ? '#14532D' : '#16A34A'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        title={data.label}
    >
        <Handle type='source' position={Position.Right} id={data.outputAnchors?.[0]?.id ?? `${data.id}-output-0`} style={handleStyle} />
    </div>
))
BpmnStartNode.displayName = 'BpmnStartNode'

export const BpmnEndNode = memo(({ data, selected }: NodeProps<BuilderNodeData>) => (
    <div
        style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#FEE2E2',
            border: `4px solid ${selected ? '#7F1D1D' : '#DC2626'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        title={data.label}
    >
        <Handle type='target' position={Position.Left} id={data.id} style={handleStyle} />
    </div>
))
BpmnEndNode.displayName = 'BpmnEndNode'

export const BpmnTaskNode = memo(({ data, selected }: NodeProps<BuilderNodeData>) => (
    <div
        style={{
            minWidth: 120,
            padding: '10px 14px',
            borderRadius: 10,
            background: '#EFF6FF',
            border: `2px solid ${selected ? '#1E3A8A' : (data.color as string) ?? '#2563EB'}`,
            textAlign: 'center'
        }}
    >
        <Handle type='target' position={Position.Left} id={data.id} style={handleStyle} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E3A8A' }}>{data.label}</Typography>
        <Handle type='source' position={Position.Right} id={data.outputAnchors?.[0]?.id ?? `${data.id}-output-0`} style={handleStyle} />
    </div>
))
BpmnTaskNode.displayName = 'BpmnTaskNode'

export const BpmnGatewayNode = memo(({ data, selected }: NodeProps<BuilderNodeData>) => (
    <div style={{ position: 'relative', width: 56, height: 56 }}>
        <Handle type='target' position={Position.Left} id={data.id} style={{ ...handleStyle, left: -4, top: '50%' }} />
        <div
            style={{
                position: 'absolute',
                inset: 4,
                background: selected ? '#FDE68A' : '#FEF3C7',
                border: `2px solid ${selected ? '#92400E' : '#D97706'}`,
                transform: 'rotate(45deg)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <span style={{ transform: 'rotate(-45deg)', fontWeight: 700, color: '#92400E' }}>×</span>
        </div>
        <Handle
            type='source'
            position={Position.Right}
            id={data.outputAnchors?.[0]?.id ?? `${data.id}-output-0`}
            style={{ ...handleStyle, right: -4, top: '30%' }}
        />
        <Handle
            type='source'
            position={Position.Right}
            id={data.outputAnchors?.[1]?.id ?? `${data.id}-output-1`}
            style={{ ...handleStyle, right: -4, top: '70%' }}
        />
    </div>
))
BpmnGatewayNode.displayName = 'BpmnGatewayNode'

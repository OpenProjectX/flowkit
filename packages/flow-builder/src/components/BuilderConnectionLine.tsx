import { memo } from 'react'
import type { ConnectionLineComponentProps } from 'reactflow'
import { EdgeLabelRenderer, getBezierPath, useStore } from 'reactflow'
import { useTheme } from '@mui/material/styles'
import { useFlowBuilder } from '../FlowBuilderProvider'

interface EdgeLabelProps {
    transform: string
    label: string
    color?: string
}

const EdgeLabel = ({ transform, label, color }: EdgeLabelProps) => (
    <div
        style={{
            position: 'absolute',
            background: 'transparent',
            left: 10,
            paddingTop: 1,
            color,
            fontSize: '0.5rem',
            fontWeight: 700,
            transform,
            zIndex: 1000
        }}
        className='nodrag nopan'
    >
        {label}
    </div>
)

/**
 * The animated dashed line shown while dragging a connection. Color and
 * optional label are resolved via `config.connectionLineColor/Label`.
 */
const BuilderConnectionLine = ({ fromX, fromY, toX, toY, fromPosition, toPosition }: ConnectionLineComponentProps) => {
    const [edgePath] = getBezierPath({
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition
    })

    const { connectionHandleId } = useStore((state) => ({ connectionHandleId: state.connectionHandleId }))
    const theme = useTheme()
    const { config } = useFlowBuilder()

    const color = config.connectionLineColor?.(connectionHandleId) ?? theme.palette.primary.main
    const label = config.connectionLineLabel?.(connectionHandleId)

    return (
        <g>
            <path fill='none' stroke={color} strokeWidth={1.5} className='animated' d={edgePath} />
            <g transform={`translate(${toX - 10}, ${toY - 10}) scale(0.8)`}>
                <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                <path
                    d='M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1 -20 0c0 -5.523 4.477 -10 10 -10m-.293 6.293a1 1 0 0 0 -1.414 0l-.083 .094a1 1 0 0 0 .083 1.32l2.292 2.293l-2.292 2.293a1 1 0 0 0 1.414 1.414l3 -3a1 1 0 0 0 0 -1.414z'
                    fill={color}
                />
            </g>
            {label && (
                <EdgeLabelRenderer>
                    <EdgeLabel color={color} label={label} transform={`translate(-50%, 0%) translate(${fromX}px,${fromY}px)`} />
                </EdgeLabelRenderer>
            )}
        </g>
    )
}

export default memo(BuilderConnectionLine)

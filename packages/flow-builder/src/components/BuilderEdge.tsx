import { memo, useState } from 'react'
import type { EdgeProps } from 'reactflow'
import { EdgeLabelRenderer, getBezierPath } from 'reactflow'
import { IconX } from '@tabler/icons-react'
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
            left: 0,
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

const foreignObjectSize = 40

export interface BuilderEdgeData {
    sourceColor?: string
    targetColor?: string
    edgeLabel?: string
    [key: string]: unknown
}

/**
 * Default edge: gradient stroke (source → target node colors, resolved by the
 * canvas via `config.resolveNodeColor`), wide invisible hover selector, and a
 * mid-line delete button revealed on hover. Optional `data.edgeLabel`.
 */
const BuilderEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
    selected
}: EdgeProps<BuilderEdgeData>) => {
    const [isHovered, setIsHovered] = useState(false)
    const { deleteEdge } = useFlowBuilder()

    const onEdgeClick = (evt: React.MouseEvent, edgeId: string) => {
        evt.stopPropagation()
        deleteEdge(edgeId)
    }

    const xEqual = sourceX === targetX
    const yEqual = sourceY === targetY

    const [edgePath, edgeCenterX, edgeCenterY] = getBezierPath({
        // we need this little hack in order to display the gradient for a straight line
        sourceX: xEqual ? sourceX + 0.0001 : sourceX,
        sourceY: yEqual ? sourceY + 0.0001 : sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
    })

    const gradientId = `edge-gradient-${id}`
    return (
        <>
            <defs>
                <linearGradient id={gradientId}>
                    <stop offset='0%' stopColor={data?.sourceColor || '#ae53ba'} />
                    <stop offset='100%' stopColor={data?.targetColor || '#2a8af6'} />
                </linearGradient>
            </defs>
            <path
                id={`${id}-selector`}
                className='flowkit-edge-selector'
                style={{
                    stroke: 'transparent',
                    strokeWidth: 15,
                    fill: 'none',
                    cursor: 'pointer'
                }}
                d={edgePath}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
            <path
                id={id}
                className='flowkit-edge'
                style={{
                    strokeWidth: selected ? 3 : 2,
                    stroke: `url(#${gradientId})`,
                    filter: selected ? 'drop-shadow(0 0 3px rgba(0,0,0,0.3))' : 'none',
                    cursor: 'pointer',
                    opacity: selected ? 1 : 0.75,
                    fill: 'none'
                }}
                d={edgePath}
                markerEnd={markerEnd}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
            {data?.edgeLabel && (
                <EdgeLabelRenderer>
                    <EdgeLabel
                        color={data?.sourceColor || '#ae53ba'}
                        label={data.edgeLabel}
                        transform={`translate(-50%, 0%) translate(${sourceX}px,${sourceY}px)`}
                    />
                </EdgeLabelRenderer>
            )}
            {isHovered && (
                <foreignObject
                    width={foreignObjectSize}
                    height={foreignObjectSize}
                    x={edgeCenterX - foreignObjectSize / 2}
                    y={edgeCenterY - foreignObjectSize / 2}
                    className='flowkit-edgebutton-foreignobject'
                    requiredExtensions='http://www.w3.org/1999/xhtml'
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            pointerEvents: 'all'
                        }}
                    >
                        <button
                            className='flowkit-edgebutton'
                            onClick={(event) => onEdgeClick(event, id)}
                            style={{
                                width: '12px',
                                height: '12px',
                                background: `linear-gradient(to right, ${data?.sourceColor || '#ae53ba'}, ${
                                    data?.targetColor || '#2a8af6'
                                })`,
                                border: 'none',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                                transition: 'all 0.2s ease-in-out',
                                padding: '2px'
                            }}
                        >
                            <IconX stroke={2} size='12' color='white' />
                        </button>
                    </div>
                </foreignObject>
            )}
        </>
    )
}

export default memo(BuilderEdge)

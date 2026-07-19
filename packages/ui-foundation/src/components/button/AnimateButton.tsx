import { forwardRef, ReactNode } from 'react'
// third-party
import { motion, useCycle } from 'framer-motion'

export interface AnimateButtonProps {
    children?: ReactNode
    offset?: number
    type?: 'slide' | 'scale' | 'rotate'
    direction?: 'up' | 'down' | 'left' | 'right'
    scale?: number | { hover?: number; tap?: number }
}

// ==============================|| ANIMATION BUTTON ||============================== //

const AnimateButton = forwardRef<HTMLDivElement, AnimateButtonProps>(function AnimateButton(
    { children, type = 'scale', offset = 10, direction = 'right', scale = { hover: 1, tap: 0.9 } },
    ref
) {
    let offset1: number
    let offset2: number
    switch (direction) {
        case 'up':
        case 'left':
            offset1 = offset
            offset2 = 0
            break
        case 'right':
        case 'down':
        default:
            offset1 = 0
            offset2 = offset
            break
    }

    const [x, cycleX] = useCycle(offset1, offset2)
    const [y, cycleY] = useCycle(offset1, offset2)

    switch (type) {
        case 'rotate':
            return (
                <motion.div
                    ref={ref}
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: 2,
                        repeatDelay: 0
                    }}
                >
                    {children}
                </motion.div>
            )
        case 'slide':
            if (direction === 'up' || direction === 'down') {
                return (
                    <motion.div
                        ref={ref}
                        animate={{ y: y !== undefined ? y : '' }}
                        onHoverEnd={() => cycleY()}
                        onHoverStart={() => cycleY()}
                    >
                        {children}
                    </motion.div>
                )
            }
            return (
                <motion.div ref={ref} animate={{ x: x !== undefined ? x : '' }} onHoverEnd={() => cycleX()} onHoverStart={() => cycleX()}>
                    {children}
                </motion.div>
            )

        case 'scale':
        default: {
            const scaleValue = typeof scale === 'number' ? { hover: scale, tap: scale } : scale
            return (
                <motion.div ref={ref} whileHover={{ scale: scaleValue?.hover }} whileTap={{ scale: scaleValue?.tap }}>
                    {children}
                </motion.div>
            )
        }
    }
})

export default AnimateButton

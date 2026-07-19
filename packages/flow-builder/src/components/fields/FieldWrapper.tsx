import { memo } from 'react'
import type { ReactNode } from 'react'
import { Box, Tooltip, Typography } from '@mui/material'
import { IconInfoCircle } from '@tabler/icons-react'
import type { InputParam } from '../../types'

/** Common label row + description tooltip around every default field renderer. */
const FieldWrapper = ({ inputParam, children }: { inputParam: InputParam; children: ReactNode }) => (
    <Box sx={{ p: 2, width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                {inputParam.label}
                {!inputParam.optional && <span style={{ color: 'red' }}>&nbsp;*</span>}
            </Typography>
            {inputParam.description && (
                <Tooltip title={inputParam.description} placement='top'>
                    <IconInfoCircle size='1rem' style={{ marginLeft: 6, opacity: 0.6 }} />
                </Tooltip>
            )}
        </Box>
        {children}
    </Box>
)

export default memo(FieldWrapper)

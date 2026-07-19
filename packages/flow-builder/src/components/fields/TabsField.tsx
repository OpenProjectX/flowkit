import { memo } from 'react'
import { Box, Tab, Tabs } from '@mui/material'
import type { FieldRendererProps, InputParam } from '../../types'
import SchemaFields from '../SchemaFields'

/**
 * `tabs` — a tab strip where each tab holds nested params.
 * Selected tab name is persisted at `data.inputs[`${tabIdentifier}_${data.id}`]`
 * (Flowise convention, keeps tab choice stable across reloads).
 */
const TabsField = memo(({ inputParam, data, onChange, disabled }: FieldRendererProps) => {
    const tabs = (inputParam.tabs as InputParam[] | undefined) ?? []
    const tabIdentifier = (inputParam.tabIdentifier as string | undefined) ?? inputParam.name
    const storedName = data.inputs[`${tabIdentifier}_${data.id}`] as string | undefined
    const tabValue = Math.max(
        0,
        tabs.findIndex((tab) => tab.name === storedName)
    )

    return (
        <Box sx={{ p: 2, width: '100%' }}>
            <Tabs
                value={tabValue}
                onChange={(_event, val: number) => {
                    data.inputs[`${tabIdentifier}_${data.id}`] = tabs[val].name
                    onChange(tabs[val].name)
                }}
                aria-label={`${inputParam.label} tabs`}
                variant='fullWidth'
            >
                {tabs.map((inputChildParam, index) => (
                    <Tab key={index} label={inputChildParam.label} />
                ))}
            </Tabs>
            {tabs
                .filter((tab) => tab.display !== false)
                .map((inputChildParam, index) => (
                    <Box key={index} role='tabpanel' hidden={tabValue !== index} sx={{ pt: 1 }}>
                        {tabValue === index && (
                            <SchemaFields
                                data={data}
                                inputParams={[inputChildParam]}
                                disabled={disabled || Boolean(inputChildParam.disabled)}
                            />
                        )}
                    </Box>
                ))}
        </Box>
    )
})

TabsField.displayName = 'TabsField'

export default TabsField

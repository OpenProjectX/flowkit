import { useState } from 'react'
import { AppBar, Box, IconButton, Tab, Tabs, Toolbar, Tooltip, Typography } from '@mui/material'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { useThemeMode } from '@flowkit/ui-foundation'
import PipelineStudio from './demos/pipeline/PipelineStudio'
import BpmnBuilder from './demos/bpmn/BpmnBuilder'

/**
 * flowkit playground — two builders sharing ONE canvas kit:
 *  - Data Pipeline Studio: typed ports, default everything
 *  - BPMN Builder: custom node shapes + custom connection rules
 */
const App = () => {
    const [tab, setTab] = useState(0)
    const { isDarkMode, toggleMode } = useThemeMode()

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar position='static' color='inherit' elevation={1}>
                <Toolbar variant='dense' sx={{ gap: 2 }}>
                    <Typography variant='h6' sx={{ mr: 2 }}>
                        flowkit playground
                    </Typography>
                    <Tabs value={tab} onChange={(_e, v) => setTab(v)} textColor='primary' indicatorColor='primary'>
                        <Tab label='Data Pipeline Studio' />
                        <Tab label='BPMN Builder' />
                    </Tabs>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title='Toggle dark mode'>
                        <IconButton onClick={toggleMode} color='inherit'>
                            {isDarkMode ? <IconSun /> : <IconMoon />}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {tab === 0 && <PipelineStudio />}
                {tab === 1 && <BpmnBuilder />}
            </Box>
        </Box>
    )
}

export default App

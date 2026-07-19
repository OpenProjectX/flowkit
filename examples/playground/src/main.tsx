import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SnackbarProvider } from 'notistack'
import { FlowkitThemeProvider } from '@openprojectx/ui-foundation'
import App from './App'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <FlowkitThemeProvider>
            <SnackbarProvider maxSnack={3}>
                <App />
            </SnackbarProvider>
        </FlowkitThemeProvider>
    </StrictMode>
)

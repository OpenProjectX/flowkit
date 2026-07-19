# @flowkit/ui-foundation

The design-system layer of flowkit: the Flowise look & feel as a standalone,
dependency-injected TypeScript package.

## What's inside

- **Theme** — `createFlowkitTheme({ mode, fontFamily?, borderRadius? })` (full
  Flowise palette incl. `card`, `orange`, `teal`, `canvasHeader`, `codeEditor`,
  `nodeToolTip`, custom typography variants) and `FlowkitThemeProvider`
  (controlled via `mode` + `onModeChange`, or uncontrolled with
  `localStorage['isDarkMode']` persistence) + `useThemeMode()`.
- **Components** — MainCard, StyledButton, StyledFab, AnimateButton,
  CopyToClipboardButton, Loader, Loadable, BackdropLoader, ConfirmDialog,
  ExpandTextDialog, Dropdown, MultiDropdown, AsyncDropdown (injected `fetcher`),
  Input, SensitiveInput, SwitchInput, Checkbox, InputSlider, pickers
  (Date/Time/WeekDays/MonthDays), File, TooltipWithParser, Transitions, Avatar,
  CodeEditor (CodeMirror), JsonEditorInput, DataGrid, SafeHTML.
- **Hooks** — `useConfirm` (+ `ConfirmProvider`), `useNotifier` (notistack),
  `useScriptRef`, `useSearchShortcut`.
- **Utils** — throttle, debounce, formatBytes, kFormatter, truncateString,
  isValidURL, generateRandomGradient, getOS, removeDuplicateURL,
  formatDataGridRows, convertDateStringToDateObject.

## Usage

```tsx
import { FlowkitThemeProvider, MainCard, StyledButton } from '@flowkit/ui-foundation'

<FlowkitThemeProvider>
    <MainCard title='Hello'>
        <StyledButton variant='contained'>Go</StyledButton>
    </MainCard>
</FlowkitThemeProvider>
```

Peer deps: react 18, @mui/material 5, @emotion/*, notistack.

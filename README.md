# flowkit

A **common, abstract, portable, configurable visual-builder UI kit** for React —
the canvas UX extracted from [Flowise](https://github.com/FlowiseAI/Flowise)'s
Agentflow builder and generalized so other products (BPMN builders, data-pipeline
studios, automation designers, …) can stand up the same polished node-editor
experience with a single config object.

## Layers

```
┌──────────────────────────────────────────────────────────────┐
│ Your app — supplies ONE config object:                        │
│ registry, rules, renderers, persistence, slots                │
├──────────────────────────────────────────────────────────────┤
│ @openprojectx/flow-builder — the canvas kit                        │
│ FlowBuilderCanvas · NodePalette · SchemaFields                │
│ PropertyInspectorDialog · BuilderNode/Edge · GroupNode        │
│ FlowBuilderProvider (graph CRUD, dirty state, selection)      │
├──────────────────────────────────────────────────────────────┤
│ @openprojectx/ui-foundation — the design system                    │
│ theme factory (light/dark) · MainCard · buttons · inputs      │
│ Dropdown/AsyncDropdown · CodeEditor · JsonEditor · DataGrid   │
│ ConfirmDialog · Loader · hooks · utils                        │
└──────────────────────────────────────────────────────────────┘
```

The kit never imports an API client, a store, or a domain constant — everything
domain-specific is injected through `FlowBuilderConfig`.

## Quick start

```tsx
import { FlowBuilderProvider, FlowBuilderCanvas, typedPortsIsValidConnection } from '@openprojectx/flow-builder'
import { FlowkitThemeProvider } from '@openprojectx/ui-foundation'
import '@openprojectx/flow-builder/styles.css'

const operators = [
    {
        name: 'httpSource',
        label: 'HTTP Source',
        category: 'Sources',
        color: '#7C3AED',
        baseClasses: ['Record[]'],
        inputs: [{ label: 'URL', name: 'url', type: 'string' }]
    }
    // …transforms and sinks
]

const config = {
    registry: { list: async () => operators },
    isValidConnection: typedPortsIsValidConnection, // typed ports
    outputStrategy: 'standard',
    onSave: (doc) => localStorage.setItem('my-flow', JSON.stringify(doc))
}

export const Studio = () => (
    <FlowkitThemeProvider>
        <FlowBuilderProvider config={config}>
            <FlowBuilderCanvas />
        </FlowBuilderProvider>
    </FlowkitThemeProvider>
)
```

A complete data-pipeline studio (typed ports, schema-driven property forms,
palette search, minimap, dark mode, save/load) is ~100 lines of config.

## What's configurable

| Area | Config hook | Default |
| --- | --- | --- |
| Node source | `registry: NodeRegistryAdapter` | — (required) |
| Form fields | `fieldRenderers` (by type or `node:param`) | 17 built-in renderers |
| Node/edge look | `nodeRenderers`, `edgeRenderers` | v2-Agentflow-style cards & gradient edges |
| Connection rules | `isValidConnection` | no self-loops, no cycles |
| Typed ports | — | compose `typedPortsIsValidConnection` |
| Drop rules | `validateDrop` (singletons, group rules) | allow all |
| On-connect side effects | `onConnectInput` (e.g. Flowise `{{ref}}`) | none |
| Serialization | `serialize` / `deserialize` | React Flow `toObject()` |
| Persistence | `onSave`, `initialFlow` | — |
| Colors | `resolveNodeColor`, `connectionLineColor` | `data.color`, theme primary |
| Node extras | `renderNodeSummary`, `onNodeInfo`, `resolveNodeWarning`, `canDuplicateNode` | off |
| Features | `features.{minimap,stickyNote,groupNodes,snapping,backgroundDots,palette,readOnly}` | on |
| Slots | `slots.{header,floatingActions}` | — |

## Documentation

Full technical docs in [`docs/`](docs) (AsciiDoc):

- [Architecture & mental model](docs/architecture.adoc) — layers, data flow, state ownership, the three core conventions
- [Graph node model spec](docs/node-model.adoc) — schemas, params, anchors, handle-id grammar, visibility engine, edges, FlowDocument
- [Backend API spec](docs/backend-api-spec.adoc) — node registry, icons, async options, persistence, concurrency
- [Configuration reference](docs/configuration.adoc) — `FlowBuilderConfig`, features, slots, theming, context API
- [Extending flowkit](docs/extending.adoc) — registries, field/node/edge renderers, connection rules, serializers, walkthroughs

## Repo layout

```
packages/
  ui-foundation/   @openprojectx/ui-foundation — theme, generic components, hooks, utils
  flow-builder/    @openprojectx/flow-builder  — the visual builder kit
examples/
  playground/      two demos on one kit: data-pipeline studio + BPMN builder
```

## Develop

```bash
pnpm install
pnpm -r build          # build packages (topological order)
pnpm -r test           # unit tests (utils, search, visibility, graph, handles)
pnpm --filter flowkit-playground dev   # run the demos on :5174
```

## Status & roadmap

- [x] ui-foundation: theme factory + controlled/uncontrolled dark mode
- [x] flow-builder: canvas, palette, schema-driven forms, group nodes, sticky notes
- [x] playground demos (data-pipeline, BPMN)
- [ ] Flowise v2 Agentflow canvas running on the kit (adapter in the Flowise repo)
- [ ] v1 chatflow-style inline params on node bodies (`nodeEditMode: 'inline'`)
- [ ] Undo/redo, multi-select sub-graph copy/paste, alignment guides

License: Apache-2.0. Extracted with care from Flowise (Apache-2.0).

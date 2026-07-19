# @openprojectx/flow-builder

The visual node-builder canvas of flowkit — palette, typed connections,
schema-driven property forms, group nodes, sticky notes, MiniMap, dirty
tracking and serialization, driven by a single `FlowBuilderConfig`.

## Minimal example

```tsx
import { FlowBuilderProvider, FlowBuilderCanvas } from '@openprojectx/flow-builder'
import '@openprojectx/flow-builder/styles.css'

const config = {
    registry: { list: async () => myNodeSchemas },
    onSave: (doc) => saveSomewhere(JSON.stringify(doc))
}

<FlowBuilderProvider config={config}>
    <FlowBuilderCanvas />
</FlowBuilderProvider>
```

Requires `reactflow` v11 and the MUI theme (best with
`@openprojectx/ui-foundation`'s `FlowkitThemeProvider`).

## Key concepts

- **NodeRegistryAdapter** — where palette nodes come from. Implement `list()`,
  optionally `renderIcon()` and `categories()`.
- **Handle-id type signatures** — handles are named
  `nodeId-input|output-name-TypeA|TypeB`, so connection rules work without a
  registry lookup. Compose `typesIntersect` / `respectsListAnchors` /
  `noSelfNoCycles`, or just use `typedPortsIsValidConnection`.
- **Schema-driven forms** — `SchemaFields` maps `inputParam.type` to a field
  renderer. 20 types built in; override per type or per `"node:param"` via
  `config.fieldRenderers`.
- **Conditional visibility** — params declare `show`/`hide` maps over sibling
  values (with regex, array, `$index` support) — same engine as Flowise.
- **The `{{ref}}` convention** — if your `onConnectInput` writes reference
  strings like `{{nodeId.data.instance}}` into inputs, the provider's default
  disconnect logic scrubs them on delete; override with `refScrubber`.

See the repo root README for the full config reference, and
`examples/playground` for two complete builders (data-pipeline + BPMN) built
on this package.

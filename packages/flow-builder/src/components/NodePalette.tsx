import { memo, useEffect, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useStore } from 'reactflow'
import { useTheme } from '@mui/material/styles'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    ClickAwayListener,
    Divider,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    OutlinedInput,
    Paper,
    Popper,
    Stack,
    Typography
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { IconMinus, IconPlus, IconSearch, IconX } from '@tabler/icons-react'
import { MainCard, StyledFab, Transitions } from '@openprojectx/ui-foundation'
import type { BuilderNodeSchema, CategoryGroup } from '../types'
import { useFlowBuilder } from '../FlowBuilderProvider'
import { scoreAndSortNodes } from '../utils/search'

export interface NodePaletteProps {
    /** Available node schemas (loaded by the canvas from `config.registry`). */
    nodesData: BuilderNodeSchema[]
    /** Extra palette filter (e.g. consumer category blacklists). */
    filter?: (node: BuilderNodeSchema) => boolean
    /** Optional extra FABs rendered next to the add button. */
    extraActions?: React.ReactNode
}

const groupByCategory = (nodes: BuilderNodeSchema[]): Record<string, BuilderNodeSchema[]> => {
    const result: Record<string, BuilderNodeSchema[]> = {}
    for (const node of nodes) {
        if (!result[node.category]) result[node.category] = []
        result[node.category].push(node)
    }
    return result
}

/**
 * The "add node" FAB + popover: debounced fuzzy search, category accordions,
 * drag-out-to-canvas. Icons via `config.registry.renderIcon` with an
 * `icon`-URL / colored-dot fallback.
 */
const NodePalette = ({ nodesData, filter, extraActions }: NodePaletteProps) => {
    const theme = useTheme()
    const { config } = useFlowBuilder()

    const [searchValue, setSearchValue] = useState('')
    const [nodes, setNodes] = useState<Record<string, BuilderNodeSchema[]>>({})
    const [open, setOpen] = useState(false)
    const [categoryExpanded, setCategoryExpanded] = useState<Record<string, boolean>>({})

    const anchorRef = useRef<HTMLButtonElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Close the popper once a drop adds a node to the canvas
    const nodeCount = useStore((s) => s.nodeInternals.size)
    const prevNodeCount = useRef(nodeCount)
    useEffect(() => {
        if (nodeCount > prevNodeCount.current) setOpen(false)
        prevNodeCount.current = nodeCount
    }, [nodeCount])

    const scrollTop = () => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0
    }

    const applyFilterAndGroup = (all: BuilderNodeSchema[], search: string) => {
        const visible = filter ? all.filter(filter) : all
        const searched = scoreAndSortNodes(visible, search)
        if (config.registry.categories) {
            const groups = config.registry.categories(searched)
            const mapped: Record<string, BuilderNodeSchema[]> = {}
            for (const group of groups as CategoryGroup[]) mapped[group.label] = group.nodes
            setNodes(mapped)
        } else {
            setNodes(groupByCategory(searched))
        }
        const expanded: Record<string, boolean> = {}
        const grouped = config.registry.categories ? config.registry.categories(searched) : null
        const keys = grouped ? grouped.map((g) => g.label) : Object.keys(groupByCategory(searched))
        for (const key of keys) expanded[key] = search !== ''
        setCategoryExpanded(expanded)
    }

    const filterSearch = (value: string) => {
        setSearchValue(value)
        setTimeout(() => {
            applyFilterAndGroup(nodesData, value)
            scrollTop()
        }, 500)
    }

    useEffect(() => {
        if (nodesData) applyFilterAndGroup(nodesData, '')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodesData])

    const handleAccordionChange = (category: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setCategoryExpanded((prev) => ({ ...prev, [category]: isExpanded }))
    }

    const handleClose = (event: MouseEvent | TouchEvent) => {
        if (anchorRef.current && event.target instanceof Node && anchorRef.current.contains(event.target)) {
            return
        }
        setOpen(false)
    }

    const handleToggle = () => setOpen((prevOpen) => !prevOpen)

    const onDragStart = (event: DragEvent, node: BuilderNodeSchema) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify(node))
        event.dataTransfer.effectAllowed = 'move'
    }

    const renderIcon = (node: BuilderNodeSchema) => {
        const custom = config.registry.renderIcon?.(node)
        if (custom) return custom
        if (node.icon) {
            return (
                <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'white' }}>
                    <img style={{ width: '100%', height: '100%', padding: 10, objectFit: 'contain' }} alt={node.name} src={node.icon} />
                </div>
            )
        }
        return <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: node.color ?? theme.palette.primary.main }} />
    }

    const renderCategoryLabel = (category: string) => {
        // Flowise convention: a category may embed a badge as `Label;BADGE`
        if (category.split(';').length > 1) {
            const [label, badge] = category.split(';')
            return (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant='h5'>{label}</Typography>
                    &nbsp;
                    <Chip
                        sx={{
                            width: 'max-content',
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            background: badge === 'DEPRECATING' ? theme.palette.warning.main : theme.palette.teal.main,
                            color: badge !== 'DEPRECATING' ? 'white' : 'inherit'
                        }}
                        size='small'
                        label={badge}
                    />
                </div>
            )
        }
        return <Typography variant='h5'>{category}</Typography>
    }

    return (
        <>
            <StyledFab
                sx={{ left: 20, top: 20 }}
                ref={anchorRef}
                size='small'
                color='primary'
                aria-label='add'
                title='Add Node'
                onClick={handleToggle}
            >
                {open ? <IconMinus /> : <IconPlus />}
            </StyledFab>
            {extraActions}

            <Popper
                placement='bottom-end'
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [{ name: 'offset', options: { offset: [-40, 14] } }]
                }}
                sx={{ zIndex: 1000 }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                    <Box sx={{ p: 2 }}>
                                        <Stack>
                                            <Typography variant='h4'>Add Nodes</Typography>
                                        </Stack>
                                        <OutlinedInput
                                            autoFocus
                                            sx={{ width: '100%', pr: 2, pl: 2, my: 2 }}
                                            id='input-search-node'
                                            value={searchValue}
                                            onChange={(e) => filterSearch(e.target.value)}
                                            placeholder='Search nodes'
                                            startAdornment={
                                                <InputAdornment position='start'>
                                                    <IconSearch stroke={1.5} size='1rem' color={theme.palette.grey[500]} />
                                                </InputAdornment>
                                            }
                                            endAdornment={
                                                <InputAdornment position='end' title='Clear Search'>
                                                    <IconX
                                                        stroke={1.5}
                                                        size='1rem'
                                                        onClick={() => filterSearch('')}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </InputAdornment>
                                            }
                                            inputProps={{ 'aria-label': 'search nodes' }}
                                        />
                                        <Divider />
                                    </Box>
                                    <Box
                                        ref={scrollRef}
                                        sx={{
                                            height: '100%',
                                            maxHeight: 'calc(100vh - 300px)',
                                            overflowY: 'auto',
                                            overflowX: 'hidden'
                                        }}
                                    >
                                        <Box sx={{ p: 2, pt: 0 }}>
                                            <List
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 370,
                                                    py: 0,
                                                    borderRadius: '10px',
                                                    '& .MuiDivider-root': { my: 0 }
                                                }}
                                            >
                                                {Object.keys(nodes)
                                                    .sort()
                                                    .map((category) => (
                                                        <Accordion
                                                            expanded={categoryExpanded[category] || false}
                                                            onChange={handleAccordionChange(category)}
                                                            key={category}
                                                            disableGutters
                                                        >
                                                            <AccordionSummary
                                                                expandIcon={<ExpandMoreIcon />}
                                                                aria-controls={`nodes-accordion-${category}`}
                                                                id={`nodes-accordion-header-${category}`}
                                                            >
                                                                {renderCategoryLabel(category)}
                                                            </AccordionSummary>
                                                            <AccordionDetails>
                                                                {nodes[category].map((node, index) => (
                                                                    <div
                                                                        key={node.name}
                                                                        onDragStart={(event) => onDragStart(event, node)}
                                                                        draggable
                                                                    >
                                                                        <ListItemButton
                                                                            sx={{
                                                                                p: 0,
                                                                                borderRadius: `${theme.shape.borderRadius}px`,
                                                                                cursor: 'move'
                                                                            }}
                                                                        >
                                                                            <ListItem alignItems='center'>
                                                                                <ListItemAvatar>
                                                                                    <div
                                                                                        style={{
                                                                                            width: 50,
                                                                                            height: 'auto',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center'
                                                                                        }}
                                                                                    >
                                                                                        {renderIcon(node)}
                                                                                    </div>
                                                                                </ListItemAvatar>
                                                                                <ListItemText
                                                                                    sx={{ ml: 1 }}
                                                                                    primary={
                                                                                        <div
                                                                                            style={{
                                                                                                display: 'flex',
                                                                                                flexDirection: 'row',
                                                                                                alignItems: 'center'
                                                                                            }}
                                                                                        >
                                                                                            <span>{node.label}</span>
                                                                                            &nbsp;
                                                                                            {node.badge && (
                                                                                                <Chip
                                                                                                    sx={{
                                                                                                        width: 'max-content',
                                                                                                        fontWeight: 700,
                                                                                                        fontSize: '0.65rem',
                                                                                                        background:
                                                                                                            node.badge === 'DEPRECATING'
                                                                                                                ? theme.palette.warning.main
                                                                                                                : theme.palette.teal.main,
                                                                                                        color:
                                                                                                            node.badge !== 'DEPRECATING'
                                                                                                                ? 'white'
                                                                                                                : 'inherit'
                                                                                                    }}
                                                                                                    size='small'
                                                                                                    label={node.badge}
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                    }
                                                                                    secondary={node.description}
                                                                                />
                                                                            </ListItem>
                                                                        </ListItemButton>
                                                                        {index === nodes[category].length - 1 ? null : <Divider />}
                                                                    </div>
                                                                ))}
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    ))}
                                            </List>
                                        </Box>
                                    </Box>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </>
    )
}

export default memo(NodePalette)

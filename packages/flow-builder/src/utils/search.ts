import type { BuilderNodeSchema } from '../types'

/**
 * Fuzzy search scoring, ported 1:1 from Flowise's AddNodes.
 * Returns 0 when not all search characters matched; higher is better.
 */
export const fuzzyScore = (searchTerm: string, text: string): number => {
    const search = ((searchTerm ?? '') + '').trim().toLowerCase()
    if (!search) return 0
    const target = ((text ?? '') + '').toLowerCase()

    let score = 0
    let searchIndex = 0
    let firstMatchIndex = -1
    let lastMatchIndex = -1
    let consecutiveMatches = 0

    // Exact substring match
    const exactMatchIndex = target.indexOf(search)
    if (exactMatchIndex !== -1) {
        score = 1000
        if (exactMatchIndex === 0) {
            score += 200
        } else if (target[exactMatchIndex - 1] === ' ' || target[exactMatchIndex - 1] === '-' || target[exactMatchIndex - 1] === '_') {
            score += 100
        }
        score -= exactMatchIndex * 2
        score -= (target.length - search.length) * 3
        return score
    }

    // Fuzzy matching with character-by-character scoring
    for (let i = 0; i < target.length && searchIndex < search.length; i++) {
        if (target[i] === search[searchIndex]) {
            score += 10

            if (lastMatchIndex === i - 1) {
                consecutiveMatches++
                score += 5 + consecutiveMatches * 2
            } else {
                consecutiveMatches = 0
            }

            if (i === 0) {
                score += 20
            }

            if (i > 0 && (target[i - 1] === ' ' || target[i - 1] === '-' || target[i - 1] === '_')) {
                score += 15
            }

            if (firstMatchIndex === -1) firstMatchIndex = i
            lastMatchIndex = i
            searchIndex++
        }
    }

    if (searchIndex < search.length) {
        return 0
    }

    score -= Math.max(0, target.length - search.length) * 2
    const span = lastMatchIndex - firstMatchIndex + 1
    const gaps = Math.max(0, span - search.length)
    score -= gaps * 3

    return score
}

/**
 * Scores name/label/category (category at half weight), filters score > 0,
 * sorts by score descending. Returns the input untouched for empty search.
 */
export const scoreAndSortNodes = <T extends Pick<BuilderNodeSchema, 'name' | 'label' | 'category'>>(
    nodes: T[],
    searchValue: string
): T[] => {
    if (!searchValue || searchValue.trim() === '') {
        return nodes
    }

    const nodesWithScores = nodes.map((nd) => {
        const nameScore = fuzzyScore(searchValue, nd.name)
        const labelScore = fuzzyScore(searchValue, nd.label)
        const categoryScore = fuzzyScore(searchValue, nd.category) * 0.5
        const maxScore = Math.max(nameScore, labelScore, categoryScore)
        return { node: nd, score: maxScore }
    })

    return nodesWithScores
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.node)
}

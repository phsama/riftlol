export function exportGeneric(cards, sideboard = []) {
    let text = cards
        .map((c) => `${c.quantity}x ${c.cardName}`)
        .join('\n')
    if (sideboard.length) {
        text += '\nSideboard:\n'
        text += sideboard.map((c) => `${c.quantity}x ${c.cardName}`).join('\n')
    }
    return text
}

function formatFullCard(c) {
    const energy = c.energy != null ? `[Cost: ${c.energy}]` : ''
    const typeStr = [c.supertype, c.type].filter(Boolean).join(' ')
    const type = typeStr ? `[Type: ${typeStr}]` : ''
    const color = c.domains && c.domains.length ? `[Color: ${c.domains.join(', ')}]` : ''
    const might = c.might != null ? `[Might: ${c.might}]` : ''

    // Extra details the user requested:
    const rarity = c.rarity ? `[Rarity: ${c.rarity}]` : ''
    const setInfo = c.setLabel ? `[Set: ${c.setLabel}]` : (c.setId ? `[Set: ${c.setId.toUpperCase()}]` : '')
    const cn = c.collectorNumber ? `[#${c.collectorNumber}]` : ''
    const artist = c.artist ? `[Artist: ${c.artist}]` : ''

    let text = `${c.quantity}x ${c.cardName}`

    // Line 1: Gameplay Attributes
    const attrs = [energy, type, color, might].filter(Boolean).join(' ')
    if (attrs) text += `\n  ${attrs}`

    // Line 2: Card text / rules
    if (c.description) {
        // Clear newlines from description to keep it compact, or just indent it
        const cleanDesc = c.description.replace(/\n/g, ' ')
        text += `\n  Text: ${cleanDesc}`
    }

    // Line 3: Meta details
    const meta = [setInfo, cn, rarity, artist].filter(Boolean).join(' ')
    if (meta) text += `\n  ${meta}`

    return text
}

export function exportFull(cards, sideboard = []) {
    let text = cards.map(formatFullCard).join('\n\n')

    if (sideboard.length) {
        text += '\n\n--- Sideboard ---\n\n'
        text += sideboard.map(formatFullCard).join('\n\n')
    }
    return text
}

export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textarea)
        return success
    }
}

export const EXPORT_FORMATS = [
    { id: 'generic', label: 'Clean', description: '2x Carta Nome', fn: exportGeneric },
    { id: 'full', label: 'Full', description: 'Inclui regras e atributos', fn: exportFull },
]

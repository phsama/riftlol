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

export function exportTCGPlayer(cards, sideboard = []) {
    let text = cards
        .map((c) => {
            const setInfo = c.setLabel ? ` [${c.setLabel}]` : ''
            return `${c.quantity} ${c.cardName}${setInfo}`
        })
        .join('\n')
    if (sideboard.length) {
        text += '\nSideboard:\n'
        text += sideboard.map((c) => {
            const setInfo = c.setLabel ? ` [${c.setLabel}]` : ''
            return `${c.quantity} ${c.cardName}${setInfo}`
        }).join('\n')
    }
    return text
}

export function exportCardmarket(cards, sideboard = []) {
    let text = cards
        .map((c) => {
            const setInfo = c.setId ? ` (${c.setId})` : ''
            const collector = c.collectorNumber ? ` #${c.collectorNumber}` : ''
            return `${c.quantity} ${c.cardName}${setInfo}${collector}`
        })
        .join('\n')
    if (sideboard.length) {
        text += '\nSideboard:\n'
        text += sideboard.map((c) => {
            const setInfo = c.setId ? ` (${c.setId})` : ''
            const collector = c.collectorNumber ? ` #${c.collectorNumber}` : ''
            return `${c.quantity} ${c.cardName}${setInfo}${collector}`
        }).join('\n')
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
    { id: 'generic', label: 'Lista simples', description: '2x Carta Nome', fn: exportGeneric },
    { id: 'tcgplayer', label: 'TCGPlayer', description: '2 Carta Nome [Set]', fn: exportTCGPlayer },
    { id: 'cardmarket', label: 'Cardmarket', description: '2 Carta Nome (SET) #123', fn: exportCardmarket },
]

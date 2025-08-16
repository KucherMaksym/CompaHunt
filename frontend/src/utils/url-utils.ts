export function formatMeetingLink(link: string | undefined): string {
    if (!link) return ''

    if (link.startsWith('http://') || link.startsWith('https://')) {
        return link
    }

    return `https://${link}`
}
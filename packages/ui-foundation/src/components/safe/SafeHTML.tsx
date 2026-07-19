import { HTMLAttributes } from 'react'
import DOMPurify, { Config } from 'dompurify'

export interface SafeHTMLProps extends HTMLAttributes<HTMLDivElement> {
    html: string
    allowedTags?: string[]
    allowedAttributes?: string[]
}

/**
 * SafeHTML component that sanitizes HTML content before rendering
 */
export const SafeHTML = ({ html, allowedTags, allowedAttributes, ...props }: SafeHTMLProps) => {
    // Configure DOMPurify options (FORBID_* keys kept verbatim from the Flowise original;
    // DOMPurify ignores unknown config keys at runtime)
    const config = {
        ALLOWED_TAGS: allowedTags || [
            'p',
            'br',
            'strong',
            'em',
            'u',
            'i',
            'b',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'ul',
            'ol',
            'li',
            'blockquote',
            'pre',
            'code',
            'a',
            'img',
            'table',
            'thead',
            'tbody',
            'tr',
            'th',
            'td',
            'div',
            'span'
        ],
        ALLOWED_ATTR: allowedAttributes || ['href', 'title', 'alt', 'src', 'class', 'id', 'style'],
        ALLOW_DATA_ATTR: false,
        FORBID_SCRIPT: true,
        FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
    } as Config

    // Sanitize the HTML content
    const sanitizedHTML = DOMPurify.sanitize(html || '', config)

    return <div {...props} dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
}

export default SafeHTML

/**
 * HTML utility functions for cleaning and processing LinkedIn job descriptions
 */

export class HtmlProcessor {
    /**
     * Extracts and cleans HTML content from LinkedIn job description element
     */
    static extractLinkedInJobHtml(element: Element | null): string {
        if (!element) return ""

        // Clone the element to avoid modifying the original
        const cloned = element.cloneNode(true) as Element

        // Remove script tags and other potentially harmful elements
        const dangerousTags = cloned.querySelectorAll('script, style, meta, link')
        dangerousTags.forEach(tag => tag.remove())

        // Clean up LinkedIn-specific classes and attributes while preserving structure
        const cleanedHtml = this.cleanLinkedInHtml(cloned.innerHTML)
        
        // Apply final sanitization to ensure only safe HTML elements remain
        const sanitizedHtml = this.sanitizeHtml(cleanedHtml)
        
        return sanitizedHtml
    }

    /**
     * Cleans LinkedIn-specific HTML while preserving formatting elements
     */
    private static cleanLinkedInHtml(html: string): string {
        // Create a DOM element to work with
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        
        // Process the HTML using DOM manipulation instead of regex
        return this.cleanLinkedInHtmlElement(tempDiv).innerHTML.trim()
    }

    /**
     * Processes HTML element to clean LinkedIn-specific attributes while preserving structure
     */
    private static cleanLinkedInHtmlElement(element: Element): Element {
        // Remove LinkedIn-specific classes and IDs
        this.removeLinkedInAttributes(element)
        
        // Process nested spans that are likely formatting artifacts
        this.consolidateSpans(element)
        
        // Fix malformed lists and nested structures
        this.fixListStructures(element)
        
        // Remove empty elements except for br, hr and meaningful structural elements
        this.removeEmptyElements(element)
        
        return element
    }

    /**
     * Removes LinkedIn-specific attributes
     */
    private static removeLinkedInAttributes(element: Element): void {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        )

        const elementsToProcess = []
        let node = walker.nextNode()
        while (node) {
            elementsToProcess.push(node as Element)
            node = walker.nextNode()
        }

        elementsToProcess.forEach(el => {
            // Remove LinkedIn-specific attributes
            const attributesToRemove = []
            for (let i = 0; i < el.attributes.length; i++) {
                const attr = el.attributes[i]
                if (attr.name.match(/^(class|id|data-|tabindex|dir|aria-|role)$/)) {
                    attributesToRemove.push(attr.name)
                }
            }
            attributesToRemove.forEach(attrName => el.removeAttribute(attrName))
        })
    }

    /**
     * Consolidates nested spans that are just formatting artifacts
     */
    private static consolidateSpans(element: Element): void {
        const spans = element.querySelectorAll('span')
        spans.forEach(span => {
            // If span has no meaningful attributes and only contains text or other spans, unwrap it
            if (!span.hasAttributes() || this.isEmptyOrLinkedInArtifact(span)) {
                this.unwrapElement(span)
            }
        })
    }

    /**
     * Fixes malformed list structures and nested elements
     */
    private static fixListStructures(element: Element): void {
        // Handle improperly nested lists
        const lists = element.querySelectorAll('ul, ol')
        lists.forEach(list => {
            // Ensure all direct children are li elements
            Array.from(list.children).forEach(child => {
                if (child.tagName.toLowerCase() !== 'li') {
                    // Wrap non-li children in li elements
                    const li = document.createElement('li')
                    child.parentNode?.insertBefore(li, child)
                    li.appendChild(child)
                }
            })
        })

        // Handle paragraph elements inside list items that should be consolidated
        const listItems = element.querySelectorAll('li')
        listItems.forEach(li => {
            const paragraphs = li.querySelectorAll('p')
            if (paragraphs.length === 1 && paragraphs[0].parentElement === li) {
                // If li contains only one paragraph, unwrap the paragraph
                this.unwrapElement(paragraphs[0])
            }
        })
    }

    /**
     * Removes empty elements except for meaningful ones like br, hr
     */
    private static removeEmptyElements(element: Element): void {
        const meaningfulEmptyElements = ['br', 'hr', 'img']
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        )

        const elementsToCheck = []
        let node = walker.nextNode()
        while (node) {
            elementsToCheck.push(node as Element)
            node = walker.nextNode()
        }

        // Process from deepest to shallowest to avoid issues with nested empty elements
        elementsToCheck.reverse().forEach(el => {
            const tagName = el.tagName.toLowerCase()
            if (!meaningfulEmptyElements.includes(tagName) && 
                !el.textContent?.trim() && 
                el.children.length === 0) {
                el.remove()
            }
        })
    }

    /**
     * Checks if element is an empty LinkedIn artifact
     */
    private static isEmptyOrLinkedInArtifact(element: Element): boolean {
        const textContent = element.textContent?.trim() || ''
        return textContent === '' || textContent.match(/^\s*$/)
    }

    /**
     * Unwraps an element, moving its children to its parent
     */
    private static unwrapElement(element: Element): void {
        const parent = element.parentNode
        if (parent) {
            while (element.firstChild) {
                parent.insertBefore(element.firstChild, element)
            }
            parent.removeChild(element)
        }
    }

    /**
     * Sanitizes HTML to allow only safe formatting elements
     */
    static sanitizeHtml(html: string): string {
        // Allow only specific safe HTML elements for job descriptions
        const allowedTags = [
            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 
            'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
        ]

        // Create a temporary element to parse HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html

        // Remove any elements not in the allowed list
        const allElements = tempDiv.querySelectorAll('*')
        allElements.forEach(element => {
            if (!allowedTags.includes(element.tagName.toLowerCase())) {
                // Replace with its content
                const parent = element.parentNode
                if (parent) {
                    while (element.firstChild) {
                        parent.insertBefore(element.firstChild, element)
                    }
                    parent.removeChild(element)
                }
            }
        })

        // Remove all attributes except for basic ones
        tempDiv.querySelectorAll('*').forEach(element => {
            const allowedAttributes = []
            Array.from(element.attributes).forEach(attr => {
                if (!allowedAttributes.includes(attr.name)) {
                    element.removeAttribute(attr.name)
                }
            })
        })

        return tempDiv.innerHTML
    }

    /**
     * Converts HTML to plain text for fallback/description field
     */
    static htmlToPlainText(html: string): string {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        return tempDiv.textContent?.trim() || ''
    }

    /**
     * Validates if the HTML contains meaningful content
     */
    static hasValidContent(html: string): boolean {
        const plainText = this.htmlToPlainText(html)
        return plainText.length > 10 // At least 10 characters of actual content
    }

    /**
     * Converts basic formatting to simple HTML
     * Useful for manual job entries
     */
    static textToHtml(text: string): string {
        return text
            // Convert double line breaks to paragraphs
            .split('\n\n')
            .map(paragraph => paragraph.trim())
            .filter(paragraph => paragraph.length > 0)
            .map(paragraph => {
                // Convert single line breaks to br tags within paragraphs
                const withBreaks = paragraph.replace(/\n/g, '<br>')
                return `<p>${withBreaks}</p>`
            })
            .join('')
    }
}
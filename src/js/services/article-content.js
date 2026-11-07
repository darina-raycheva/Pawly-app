function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

const allowedTags = new Set(['P', 'DIV', 'H2', 'H3', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'BR'])

export function sanitizeArticleHtml(value = '') {
  const document = new DOMParser().parseFromString(String(value), 'text/html')
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT)
  const elements = []

  while (walker.nextNode()) elements.push(walker.currentNode)

  elements.forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes))
      return
    }

    Array.from(element.attributes).forEach((attribute) => {
      if (attribute.name === 'style' && ['P', 'DIV', 'H2', 'H3'].includes(element.tagName)) {
        const alignment = attribute.value.match(/(?:^|;)\s*text-align\s*:\s*(left|center|right|justify)\s*(?:;|$)/i)
        if (alignment) {
          element.setAttribute('style', `text-align: ${alignment[1].toLowerCase()}`)
        } else {
          element.removeAttribute('style')
        }
      } else if (element.tagName !== 'A' || attribute.name !== 'href') {
        element.removeAttribute(attribute.name)
      }
    })

    if (element.tagName === 'A') {
      const href = element.getAttribute('href') || ''
      if (!/^(https?:|mailto:)/i.test(href)) {
        element.removeAttribute('href')
      } else {
        element.setAttribute('target', '_blank')
        element.setAttribute('rel', 'noopener noreferrer')
      }
    }
  })

  return document.body.innerHTML
}

function renderMarkdown(content = '') {
  const lines = String(content).replaceAll('\r\n', '\n').split('\n')
  const blocks = []
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(`<p>${paragraph.map(escapeHtml).join('<br />')}</p>`)
      paragraph = []
    }
  }

  const flushList = () => {
    if (list) {
      blocks.push(`<${list.type}>${list.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${list.type}>`)
      list = null
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const heading = trimmed.match(/^(#{1,2})\s+(.+)$/)
    const unorderedItem = trimmed.match(/^[-*]\s+(.+)$/)
    const orderedItem = trimmed.match(/^\d+\.\s+(.+)$/)

    if (!trimmed) {
      flushParagraph()
      flushList()
    } else if (heading) {
      flushParagraph()
      flushList()
      blocks.push(`<h${heading[1].length + 2}>${escapeHtml(heading[2])}</h${heading[1].length + 2}>`)
    } else if (unorderedItem || orderedItem) {
      flushParagraph()
      const type = unorderedItem ? 'ul' : 'ol'
      if (!list || list.type !== type) {
        flushList()
        list = { type, items: [] }
      }
      list.items.push((unorderedItem || orderedItem)[1])
    } else {
      flushList()
      paragraph.push(trimmed)
    }
  }

  flushParagraph()
  flushList()
  return blocks.join('')
}

export function renderArticleContent(content = '') {
  const value = String(content)
  return /<[a-z][\s\S]*>/i.test(value)
    ? sanitizeArticleHtml(value)
    : renderMarkdown(value)
}

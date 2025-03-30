import 'https://cdn.jsdelivr.net/npm/js-md5@0.8.3/src/md5.min.js'
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/card/card.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/dropdown/dropdown.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/tab/tab.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/tab-group/tab-group.js';
import 'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.18.0/cdn/components/tab-panel/tab-panel.js';

const classes = new Set('small medium large left right center shadow'.split(' '))
const parseCodeEl = (el) => {
  let tokens = []
  el.textContent.replace(/”/g,'"').replace(/”/g,'"').replace(/’/g,"'").match(/[^\s"]+|"([^"]*)"/gmi)?.filter(t => t).forEach(token => {
    if (tokens.length > 0 && tokens[tokens.length-1].indexOf('=') === tokens[tokens.length-1].length-1) tokens[tokens.length-1] = `${tokens[tokens.length-1]}${token}`
    else tokens.push(token)
  })
  let parsed = {el, tag:null, id:null, kwargs:{}, classes:[], booleans:[], data:[]}
  let tokenIdx = 0
  while (tokenIdx < tokens.length) {
    let token = tokens[tokenIdx].replace(/<em>/g, '_').replace(/<\/em>/g, '_')
    if (tokenIdx == 0) {
      if (token !== '-') parsed.tag = token
    }
    else if (/#\w+/.test(token)) parsed['id'] = token.slice(1)
    else if (token.indexOf('=') > 0 && /^[\w-:]+=/.test(token)) {
      let idx = token.indexOf('=')
      let key = token.slice(0, idx)
      let value = token.slice(idx+1)
      value = value[0] === '"' && value[value.length-1] === '"' ? value.slice(1, -1) : value
      if (parsed.kwargs[key]) parsed.kwargs[key] += `|${value}`
      else parsed.kwargs[key] = value
    }
    else if (classes.has(token)) parsed.classes.push(token)
    else parsed.booleans.push(token)
    tokenIdx++
  }

  let parent = el.parentElement
  let nonCodeChildren = Array.from(parent.childNodes).filter(c => c.textContent.trim()).filter(c => c.tagName !== 'CODE')
  parsed.inline = nonCodeChildren.length > 0

  // if (parent?.nextElementSibling?.tagName === 'UL' && parent?.nextElementSibling?.getAttribute('data') === '')
  //   parsed.kwargs.data = encodeURIComponent(parent.nextElementSibling.outerHTML.trim().replace(/\n/g, '').replace(/ data=\"\" style=\"display:none;\"/, ''))

  return parsed
}

// const ifcPrefix = location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://ifc.juncture-digital.org'
const ifcPrefix = 'https://ifc.juncture-digital.org'
const makeIframe = (code) => {
  let iframe = document.createElement('iframe')
  iframe.setAttribute('allowfullscreen', '')
  iframe.setAttribute('allow', 'clipboard-write')
  if (code.tag === 'audio') iframe.setAttribute('allow', 'autoplay')
  if (code.id) iframe.id = code.id
  if (code.classes.length > 0) iframe.className = code.classes.join(' ')
  let args = [...Object.entries(code.kwargs).map(([key, value]) => `${key}=${encodeURIComponent(value)}`), ...(code.booleans || [])].join('&')
  iframe.src = `${ifcPrefix}/${code.tag}?${args}`

  let isOnlyChild = code.el.parentElement?.children.length === 1 && code.el.parentElement?.children[0] === code.el
  console.log(isOnlyChild, code.el.parentElement)
  if (isOnlyChild) code.el.parentElement.replaceWith(iframe)
  else {
console.log('here')
    let nonCodeElements = Array.from(code.el.parentElement?.children).filter(c => c.tagName !== 'CODE').length
    if (!nonCodeElements) code.el.parentElement.classList.add('iframe-container')
      code.el.replaceWith(iframe)
  }
}

/**
 * Restructure an HTML element (generated from Markdown) so that each heading
 * and its following content are wrapped in nested <section> elements according to heading level.
 * Additionally, any id, class, or style attributes applied to a heading (using Kramdown IAL syntax)
 * are transferred to the corresponding section.
 *
 * @param {element} contentEl - The HTML element from your Markdown.
 * @returns {element} - The new HTML element with nested sections.
 */
const restructureMarkdownToSections = (contentEl) => {
  // Create a container element to hold the content.
  const container = document.createElement(contentEl.tagName);

  if (contentEl.id) container.id = contentEl.id
  if (contentEl.className) container.className = contentEl.className
  if (contentEl.getAttribute('style')) container.setAttribute('style', contentEl.getAttribute('style'))
  container.innerHTML = contentEl.innerHTML;
  
  // Use a stack to keep track of the current section levels.
  // The stack starts with the container (level 0).
  const stack = [{ level: 0, element: container }];
  
  // Get a static list of the container’s children.
  const nodes = Array.from(container.childNodes);
  
  nodes.forEach(node => {
    // Check if the node is an element and is a heading (H1 - H6)
    if (node.nodeType === Node.ELEMENT_NODE && /^H[1-6]$/.test(node.tagName)) {
      node.textContent = node.textContent.replace(/^\s+$/, '')
      // Determine the heading level (e.g., "H2" -> 2)
      const headingLevel = parseInt(node.tagName[1], 10);
      
      // Pop sections from the stack until we find one with a lower level.
      while (stack.length > 0 && stack[stack.length - 1].level >= headingLevel) {
        stack.pop();
      }
      
      // Create a new section and move the heading into it.
      const section = document.createElement('section');
      
      // Transfer any id, class, and style attributes from the heading to the section.
      ['id', 'class', 'style'].forEach(attr => {
        if (node.hasAttribute(attr)) {
          section.setAttribute(attr, node.getAttribute(attr));
          node.removeAttribute(attr);
        }
      });
      
      // Move the heading into the new section.
      section.appendChild(node);
      
      // Append the new section to the element at the top of the stack.
      stack[stack.length - 1].element.appendChild(section);
      
      // Push the new section onto the stack with its heading level.
      stack.push({ level: headingLevel, element: section });
    } else {
      // For non-heading nodes, append them to the current (top of the stack) section.
      stack[stack.length - 1].element.appendChild(node);
    }
  });
  
  // return container.innerHTML;
  return container
}

/**
 * Convert sub-sections inside a '.cards' section into a responsive grid of Shoelace cards.
 * Each card uses:
 * - The sub-section heading as the card header.
 * - The first image as the card image.
 * - All paragraphs and lists as the card content.
 */
const makeCards = (rootEl) => {
  rootEl.querySelectorAll('section.cards').forEach(cardsSection => {

  // Create a container for the card grid.
  const cardGrid = document.createElement('div');
  cardGrid.className = 'card-grid';

  // Get all direct sub-sections within the cards section (skip the main heading).
  const subsections = Array.from(cardsSection.querySelectorAll('section'));

  subsections.forEach(sub => {
    // Create a new sl-card element.
    const card = document.createElement('sl-card');

    // --- Card Header ---
    const subHeading = sub.querySelector('h1, h2, h3, h4, h5, h6');
    if (subHeading) {
      const header = document.createElement('div');
      header.setAttribute('slot', 'header');
      
      // Look for the first link within the sub-section.
      const firstLink = sub.querySelector('a[href]');
      if (firstLink) {
        const link = document.createElement('a');
        link.href = firstLink.getAttribute('href');
        link.textContent = subHeading.textContent;
        header.appendChild(link);
        firstLink.parentElement.remove()
      } else {
        header.textContent = subHeading.textContent;
      }
      card.appendChild(header);
    }

    // --- Card Image ---
    const image = sub.querySelector('img');
    if (image) {
      let imgParent = image.parentElement
      image.setAttribute('slot', 'image');
      card.appendChild(image);
      imgParent.remove()
    }

    // --- Card Content ---
    // Create a container for any paragraphs or lists.
    const contentWrapper = document.createElement('div');
    // Gather any paragraphs or lists (skip headings and images)
    const contentElements = Array.from(sub.children).filter(el => {
      return !/^H[1-6]$/.test(el.tagName) && el.tagName.toLowerCase() !== 'img';
    });
    contentElements.forEach(el => {
      contentWrapper.appendChild(el.cloneNode(true));
    });
    card.appendChild(contentWrapper);

    // Add the card to the grid.
    cardGrid.appendChild(card);
  });

  // Optionally, remove the original sub-sections.
  subsections.forEach(sub => sub.remove());

  // Append the card grid to the cards section.
  cardsSection.appendChild(cardGrid);
})
}

const makeTabs = (rootEl) => {
  console.log('makeTabs')
  console.log(rootEl)
  rootEl.querySelectorAll('section.tabs').forEach(section => {
    let heading = section.firstChild
    let tabGroup = document.createElement('sl-tab-group');
    Array.from(section.classList).forEach(cls => tabGroup.classList.add(cls))
    Array.from(section.attributes).forEach(attr => tabGroup.setAttribute(attr.name, attr.value))
    
    Array.from(section.querySelectorAll(':scope > section'))
    .forEach((tabSection, idx) => {
      let tab = document.createElement('sl-tab')
      tab.setAttribute('slot', 'nav')
      tab.setAttribute('panel', `tab${idx+1}`)
      if (idx === 0) tab.setAttribute('active', '')
      tab.innerHTML = tabSection.querySelector('h1, h2, h3, h4, h5, h6')?.innerHTML || ''
      tabGroup.appendChild(tab)      
    })

    Array.from(section.querySelectorAll(':scope > section'))
    .forEach((tabSection, idx) => {
      let tabPanel = document.createElement('sl-tab-panel')
      tabPanel.setAttribute('name', `tab${idx+1}`)
      if (idx === 0) tabPanel.setAttribute('active', '')
      let tabContent = Array.from(tabSection.children).slice(1).map(el => el.outerHTML).join(' ')
      tabPanel.innerHTML = tabContent
      tabGroup.appendChild(tabPanel)
      tabSection.remove()
    })

    // section.replaceWith(tabGroup)
    section.appendChild(tabGroup)
  })
}

const addMessageHandler = () => {
  window.addEventListener('message', (event) => {
    if (event.data.type === 'setAspect') {
      const sendingIframe = Array.from(document.querySelectorAll('iframe')).find((iframe) => iframe.contentWindow === event.source)
      if (sendingIframe) sendingIframe.style.aspectRatio = event.data.aspect
    } else if (event.data.type === 'openLink') {
      window.open(event.data.url, '_blank')
    }
  })
}

// setup action links to iframes (e.g., zoomto, flyto, play)
const addActionLinks = () => {
  document.querySelectorAll('iframe').forEach(iframe => {
    if (!iframe.id) return
    document.querySelectorAll('a').forEach(a => {
      let href = a.href || a.getAttribute('data-href')
      let path = href?.split('/').slice(3).filter(p => p !== '#' && p !== '')
      const targetIdx = path?.findIndex(p => p == iframe.id)
      if (targetIdx >= 0) {
        path = path.slice(targetIdx)
        let action = path[1]
        let args = path.slice(2)
        if (a.href) {
          a.setAttribute('data-href', href)
          a.classList.add('trigger')
          a.removeAttribute('href')
          a.style.cursor = 'pointer'
          a.addEventListener('click', () => {
            let msg = { event: 'action', action, args }
            document.getElementById(iframe.id)?.contentWindow.postMessage(JSON.stringify(msg), '*')
          })
        }
      }
    })
  })
}

////////// Start Wikidata Entity functions //////////

async function getEntityData(qids, language) {
  if (!window.entityData) window.entityData = {}
  if (!window.pendingEntityData) window.pendingEntityData = new Set()
  if (!window.customEntityAliases) window.customEntityAliases = {}
  language = language || 'en'
  let cached = new Set(qids.filter(qid => window.entityData[qid]))
  let pending = new Set(qids.filter(qid => window.pendingEntityData.has(qid)))
  let toGet = qids .filter(qid => !cached.has(qid) && !pending.has(qid))
  if (toGet.length > 0) {
    Array.from(toGet).forEach(qid => window.pendingEntityData.add(qid))
    let toGetUrls = toGet.map(qid => `(<http://www.wikidata.org/entity/${qid}>)`)
    let query = `
      SELECT ?item ?label ?description ?alias ?image ?logoImage ?coords ?pageBanner ?whosOnFirst ?wikipedia WHERE {
        VALUES (?item) { ${toGetUrls.join(' ')} }
        ?item rdfs:label ?label . 
        FILTER (LANG(?label) = "${language}" || LANG(?label) = "en")
        OPTIONAL { ?item schema:description ?description . FILTER (LANG(?description) = "${language}" || LANG(?description) = "en")}
        OPTIONAL { ?item skos:altLabel ?alias . FILTER (LANG(?alias) = "${language}" || LANG(?alias) = "en")}
        OPTIONAL { ?item wdt:P625 ?coords . }
        OPTIONAL { ?item wdt:P18 ?image . }
        OPTIONAL { ?item wdt:P154 ?logoImage . }
        OPTIONAL { ?item wdt:P948 ?pageBanner . }
        OPTIONAL { ?item wdt:P6766 ?whosOnFirst . }
        OPTIONAL { ?wikipedia schema:about ?item; schema:isPartOf <https://${language}.wikipedia.org/> . }
    }`
    let resp = await fetch('https://query.wikidata.org/sparql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/sparql-results+json'
      },
      body: `query=${encodeURIComponent(query)}`
    })
    if (resp.ok) {
      let sparqlResp = await resp.json()
      sparqlResp.results.bindings.forEach( async rec => {
        let qid = rec.item.value.split('/').pop()
        let _entityData = window.entityData[qid]
        if (!_entityData) {
          _entityData = {id: qid, label: rec.label.value}
          if (rec.description) _entityData.description = rec.description.value
          if (rec.alias) {
            _entityData.aliases = [rec.alias.value]
            if (window.customEntityAliases[qid]) _entityData.aliases = [...window.customEntityAliases[qid], ..._entityData.aliases]
          }
          if (rec.coords) _entityData.coords = rec.coords.value.slice(6,-1).split(' ').reverse().join(',')
          if (rec.wikipedia) _entityData.wikipedia = rec.wikipedia.value
          if (rec.pageBanner) _entityData.pageBanner = rec.pageBanner.value
          if (rec.image) {
            _entityData.image = rec.image.value
            _entityData.thumbnail = mwImage(rec.image.value, 300)
          }
          if (rec.logoImage) {
            _entityData.logoImage = rec.logoImage.value
            if (!_entityData.thumbnail) _entityData.thumbnail = mwImage(rec.logoImage.value, 300)
          }
          // if (rec.whosOnFirst) _entityData.whosOnFirst = whosOnFirstUrl(rec.whosOnFirst.value)
          if (rec.whosOnFirst) _entityData.geojson = whosOnFirstUrl(rec.whosOnFirst.value)
              window.entityData[qid] = _entityData

        } else {
          if (rec.alias) _entityData.aliases.push(rec.alias.value)
        }
      })
      // return entityData
      Array.from(toGet).forEach(qid => window.pendingEntityData.delete(qid))
      return Object.fromEntries(qids.filter(qid => window.entityData[qid]).map(qid => [qid,window.entityData[qid]]))
    }
  }
  // return entityData
  return Object.fromEntries(qids.filter(qid => window.entityData[qid]).map(qid => [qid,window.entityData[qid]]))
}

const getSummaryText = async (wikipediaLink, language) => {
  language = language || 'en'
  let page = wikipediaLink.replace(/\/w\//, '/wiki').split('/wiki/').pop()
  let resp = await fetch(`https://${language}.wikipedia.org/api/rest_v1/page/summary/${page}`)
  if (resp.ok) {
    let data = await resp.json()
    return data['extract_html'] || data['extract']
  }
}

function mwImage(mwImg, width) {
  width = width || 0
  // Converts Wikimedia commons image URL to a thumbnail link
  mwImg = (Array.isArray(mwImg) ? mwImg[0] : mwImg).replace(/Special:FilePath\//, 'File:').split('File:').pop()
  mwImg = decodeURIComponent(mwImg).replace(/ /g,'_')
  const _md5 = md5(mwImg)
  const extension = mwImg.split('.').pop()
  let url = `https://upload.wikimedia.org/wikipedia/commons${width ? '/thumb' : ''}`
  url += `/${_md5.slice(0,1)}/${_md5.slice(0,2)}/${mwImg}`
  if (width > 0) {
    url += `/${width}px-${mwImg}`
    if (extension === 'svg') {
      url += '.png'
    } else if (extension === 'tif' || extension === 'tiff') {
      url += '.jpg'
    }
  }
  return url
}

// Creates a GeoJSON file URL from a Who's on First ID 
function whosOnFirstUrl(wof) {
  let wofParts = []
  for (let i = 0; i < wof.length; i += 3) {
    wofParts.push(wof.slice(i,i+3))
  }
  return `https://data.whosonfirst.org/${wofParts.join('/')}/${wof}.geojson`
}

// For cropping regular images
export async function imageDataUrl(url, region, dest) {
  return new Promise((resolve) => {
    let {x, y, w, h} = region
    let {width, height} = dest

    let image = new Image()
    image.crossOrigin = 'anonymous'
    x = x ? x/100 : 0
    y = y ? y/100 : 0
    w = w ? w/100 : 0
    h = h ? h/100 : 0

    image.onload = () => {
      let sw = image.width
      let sh = image.height
      let swScaled = w > 0 ? sw * w : sw - (sw * x)
      let shScaled =  h > 0 ? sh * h : sh - (sh * y)
      let ratio = swScaled/shScaled
      if (ratio > 1) height = width/ratio
      else width = height * ratio
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = width
      canvas.height = height
      x = x*sw
      y = y*sh
      ctx?.drawImage(image, x, y, swScaled, shScaled, 0, 0, width, height)
      let dataUrl = canvas.toDataURL()
      resolve(dataUrl)
    }
    image.src = url

  })
}

async function getEntity(qid, language) {
  language = language || 'en'
  let entities = await getEntityData([qid], language)
  let entity = entities[qid]
  if (entity && !entity.summaryText && entity.wikipedia) {
    entity.summaryText = await getSummaryText(entity.wikipedia, language)
  }
  return entities[qid]
}

const makeEntityPopups = () => {
  Array.from(document.body.querySelectorAll('a')).forEach(async a => {
    let path = a.href?.split('/').slice(3).filter(p => p !== '#' && p !== '')
    let qid = path?.find(p => /^Q\d+$/.test(p))
    if (qid) {
      let entity = await getEntity(qid)
      let dd = document.createElement('sl-dropdown')
      dd.className = 'entity-popup'
      dd.setAttribute('placement', 'top')
      dd.setAttribute('distance', '12')
      
      let trigger = document.createElement('div')
      trigger.setAttribute('slot', 'trigger')
      trigger.innerHTML = a.textContent
      dd.appendChild(trigger)

      let card = document.createElement('sl-card')
      card.setAttribute('hoist', '')
      let img = document.createElement('img')
      img.setAttribute('slot', 'image')
      img.src = entity.thumbnail
      img.setAttribute('alt', entity.label)
      card.appendChild(img)
      let content = document.createElement('div')
      content.className = 'content'
      if (entity.label) {
        let heading = document.createElement('h2')
        heading.textContent = entity.label
        content.appendChild(heading)
      }
      if (entity.description) {
        let description = document.createElement('p')
        description.className = 'description'
        description.innerHTML = entity.description
        content.appendChild(description)
      }
      if (entity.summaryText) {
        let summaryText = document.createElement('div')
        summaryText.className = 'description'
        summaryText.innerHTML = entity.summaryText
        content.appendChild(summaryText)
      }
      card.appendChild(content)
      let footer = document.createElement('div')
      footer.setAttribute('slot', 'footer')
      if (entity.wikipedia)
        footer.innerHTML = `<a href="${entity.wikipedia}" target="_blank">View on Wikipedia</a>`
      card.appendChild(footer)
      dd.appendChild(card)
      
      a.replaceWith(dd)
    }
  })
}

////////// End Wikidata Entity functions //////////


document.addEventListener('DOMContentLoaded', () => {
  let content = document.querySelector('div.main-content main')
  content.innerHTML = restructureMarkdownToSections(content).innerHTML

  addMessageHandler()
  makeEntityPopups()

  Array.from(content.querySelectorAll('p > code'))
    .map(codeEl => parseCodeEl(codeEl))
    .reduce((acc, parsed) => {
      if (parsed.tag) acc.push(parsed)
      else {
        acc[acc.length-1].data.push([...Object.entries(parsed.kwargs).map(([key, value]) => `${key}=${encodeURIComponent(value)}`), ...(parsed.booleans || [])].join('&'))
        parsed.el.remove()
      }
      return acc
    }, [])
    .forEach(codeEl => {
      if (codeEl.data.length > 0) codeEl.kwargs.data = codeEl.data.join('|')
      if (!codeEl.inline) makeIframe(codeEl)
    })

  makeCards(content)
  makeTabs(content)
  addActionLinks()

})
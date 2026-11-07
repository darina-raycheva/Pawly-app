import { generateCaptionSuggestions } from '../services/caption-assistant.js'

const MAX_PHOTOS = 3
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DISPLAY_FONT = '"Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif'
const BODY_FONT = '"Nunito", "Segoe UI", sans-serif'
const templates = [
  { id: 'polaroid', label: 'Полароид спомени', description: '3 снимки · припокриващи се кадри', photos: 3, icon: 'bi-images' },
  { id: 'birthday', label: 'Честит рожден ден!', description: '1 снимка · празнична картичка', photos: 1, field: 'age', icon: 'bi-balloon-heart' },
  { id: 'passport', label: 'Моят Pawly паспорт', description: '1 снимка · име и детайли', photos: 1, field: 'details', icon: 'bi-person-vcard' },
  { id: 'then-now', label: 'Тогава и сега', description: '2 снимки · сравнение през времето', photos: 2, icon: 'bi-arrow-left-right' },
  { id: 'cover', label: 'Звездата на корицата', description: '1 снимка · редакционна корица', photos: 1, field: 'headlines', icon: 'bi-stars' },
  { id: 'adventure', label: 'Малък приключенец', description: 'до 3 снимки · пътешественически албум', photos: 3, icon: 'bi-compass' },
]

function drawCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  context.drawImage(image, (image.width - sourceWidth) / 2, (image.height - sourceHeight) / 2, sourceWidth, sourceHeight, x, y, width, height)
}

function rounded(context, x, y, width, height, radius) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.closePath()
}

function photo(context, image, x, y, width, height, radius = 20) {
  rounded(context, x, y, width, height, radius)
  context.save()
  context.clip()
  drawCover(context, image, x, y, width, height)
  context.restore()
}

function text(context, value, x, y, maxWidth, lineHeight = 32, maxLines = 2) {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  })
  if (line) lines.push(line)
  const visible = lines.slice(0, maxLines)
  if (lines.length > maxLines && visible.length) visible[visible.length - 1] = `${visible[visible.length - 1].slice(0, -2)}…`
  visible.forEach((lineValue, index) => context.fillText(lineValue, x, y + index * lineHeight))
}

function fitFont(context, value, weight, maxSize, minSize, maxWidth, family = BODY_FONT) {
  for (let size = maxSize; size >= minSize; size -= 2) {
    context.font = `${weight} ${size}px ${family}`
    if (context.measureText(String(value || '')).width <= maxWidth) return size
  }
  context.font = `${weight} ${minSize}px ${family}`
  return minSize
}

function cleanCaption(caption, petName) {
  const value = String(caption || '').trim()
  const name = String(petName || '').trim()
  if (!value || !name) return value
  const withoutName = value.replace(new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s:,-]*`, 'i'), '').trim()
  return withoutName || value
}

function shadow(context, blur = 24, color = 'rgba(36, 59, 53, 0.18)') {
  context.shadowColor = color
  context.shadowBlur = blur
  context.shadowOffsetY = 12
}

function resetShadow(context) {
  context.shadowColor = 'transparent'
  context.shadowBlur = 0
  context.shadowOffsetY = 0
}

function footer(context, petName, caption, color = '#243b35') {
  context.fillStyle = color
  context.textAlign = 'center'
  const headline = petName.trim() || 'Нашият любимец'
  fitFont(context, headline, 700, 42, 28, 1060, DISPLAY_FONT)
  text(context, headline, 600, 755, 1060, 44, 1)
  const message = cleanCaption(caption, petName) || 'Спомени, създадени с любов'
  fitFont(context, message, 400, 26, 18, 1060, BODY_FONT)
  text(context, message, 600, 797, 1060, 28, 1)
}

function renderCanvas(canvas, photos, template, petName, caption, options) {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas не се поддържа от браузъра.')
  const images = photos.map(({ image }) => image)
  const width = 1200
  const height = 840
  canvas.width = width
  canvas.height = height
  context.textBaseline = 'alphabetic'
  context.font = `400 24px ${BODY_FONT}`
  context.fillStyle = '#fffaf4'
  context.fillRect(0, 0, width, height)

  if (template === 'polaroid') {
    context.fillStyle = '#f6ecde'
    context.fillRect(0, 0, width, height)
    context.fillStyle = 'rgba(255,255,255,0.28)'
    for (let index = 0; index < 18; index += 1) context.fillRect((index * 149) % width, (index * 83) % height, 2, 2)
    const positions = [[125, 120, -0.08], [410, 78, 0.02], [705, 125, 0.08]]
    images.forEach((image, index) => {
      const [x, y, rotation] = positions[index]
      context.save()
      context.translate(x + 185, y + 245)
      context.rotate(rotation)
      shadow(context, 20)
      context.fillStyle = '#fff'
      context.fillRect(-185, -245, 370, 490)
      resetShadow(context)
      drawCover(context, image, -157, -214, 314, 330)
      context.restore()
    })
    context.fillStyle = '#243b35'
    context.textAlign = 'center'
    const headline = petName.trim() || 'Нашият любимец'
    fitFont(context, headline, 700, 48, 30, 1060, DISPLAY_FONT)
    text(context, headline, 600, 660, 1060, 50, 1)
    const message = cleanCaption(caption, petName) || 'Спомени, създадени с любов'
    fitFont(context, message, 400, 27, 18, 1060, BODY_FONT)
    text(context, message, 600, 705, 1060, 30, 1)
    context.fillStyle = '#6a7973'
    context.font = `400 16px ${BODY_FONT}`
    context.fillText('Pawly Moments', 600, 780)
  } else if (template === 'birthday') {
    context.fillStyle = '#f8ded2'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#2e5548'
    context.fillRect(0, 0, width, 16)
    context.fillStyle = '#dc8268'
    context.beginPath()
    context.arc(95, 92, 48, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#286c5d'
    context.beginPath()
    context.arc(1105, 92, 48, 0, Math.PI * 2)
    context.fill()
    context.strokeStyle = '#6a7973'
    context.beginPath()
    context.moveTo(95, 140)
    context.lineTo(120, 690)
    context.moveTo(1105, 140)
    context.lineTo(1080, 690)
    context.stroke()
    context.fillStyle = '#2e5548'
    context.textAlign = 'center'
    context.font = `700 42px ${DISPLAY_FONT}`
    context.fillText('Честит рожден ден!', 600, 78)
    shadow(context, 18)
    photo(context, images[0], 275, 125, 650, 435, 28)
    resetShadow(context)
    context.fillStyle = '#2e5548'
    context.font = `700 40px ${DISPLAY_FONT}`
    context.fillText(`${options.age || '...'} години`, 600, 635)
    footer(context, petName, caption)
  } else if (template === 'passport') {
    context.fillStyle = '#dce9df'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#2e5548'
    context.fillRect(0, 0, width, 135)
    context.fillStyle = '#fffaf4'
    context.textAlign = 'left'
    context.font = `700 42px ${DISPLAY_FONT}`
    context.fillText('PAWLY ПАСПОРТ', 76, 82)
    context.font = `400 20px ${BODY_FONT}`
    context.fillText('официално неофициален документ за обич', 78, 112)
    shadow(context, 18)
    photo(context, images[0], 78, 190, 430, 430, 24)
    resetShadow(context)
    context.fillStyle = '#243b35'
    context.textAlign = 'left'
    fitFont(context, petName.trim() || 'Любимец', 700, 48, 28, 500, DISPLAY_FONT)
    text(context, petName.trim() || 'Любимец', 580, 280, 500, 54, 2)
    context.font = `400 27px ${BODY_FONT}`
    text(context, options.details || 'Най-добрият приятел на света', 580, 390, 490, 38, 4)
    context.fillStyle = '#dc8268'
    context.font = `700 23px ${DISPLAY_FONT}`
    context.fillText('STATUS: ОБИЧАН', 580, 590)
    context.fillStyle = '#6a7973'
    context.textAlign = 'center'
    context.font = `400 22px ${BODY_FONT}`
    text(context, cleanCaption(caption, petName) || 'Най-добрият ти приятел.', 600, 760, 1040, 28, 1)
    context.font = `400 16px ${BODY_FONT}`
    context.fillText('Pawly Moments', 600, 800)
  } else if (template === 'then-now') {
    context.fillStyle = '#fffaf4'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#243b35'
    context.textAlign = 'center'
    context.font = `700 48px ${DISPLAY_FONT}`
    context.fillText('Тогава и сега', 600, 78)
    context.fillStyle = '#6a7973'
    context.font = `400 22px ${BODY_FONT}`
    context.fillText('една обич, два красиви момента', 600, 112)
    shadow(context, 18)
    photo(context, images[0], 72, 165, 500, 470, 24)
    photo(context, images[1] || images[0], 628, 165, 500, 470, 24)
    resetShadow(context)
    context.fillStyle = '#dc8268'
    context.font = `700 28px ${DISPLAY_FONT}`
    context.fillText('ТОГАВА', 322, 690)
    context.fillText('СЕГА', 878, 690)
    footer(context, petName, caption)
  } else if (template === 'cover') {
    context.fillStyle = '#f6ecde'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#2e5548'
    context.fillRect(0, 0, 1200, 92)
    context.fillStyle = '#fffaf4'
    context.textAlign = 'left'
    context.font = `700 24px ${DISPLAY_FONT}`
    context.fillText('PAWLY', 55, 58)
    context.textAlign = 'right'
    context.font = `400 20px ${BODY_FONT}`
    context.fillText('БРОЙ 01  ·  СПЕЦИАЛНО ИЗДАНИЕ', 1145, 58)
    shadow(context, 22)
    photo(context, images[0], 90, 145, 1020, 490, 8)
    resetShadow(context)
    context.fillStyle = '#dc8268'
    context.textAlign = 'left'
    fitFont(context, options.headline || 'Звездата на корицата', 700, 72, 36, 1020, DISPLAY_FONT)
    text(context, options.headline || 'Звездата на корицата', 90, 700, 1020, 78, 2)
    context.fillStyle = '#243b35'
    context.font = `400 26px ${BODY_FONT}`
    text(context, options.subheadline || caption || 'История с лапички и много любов.', 90, 790, 1020, 32, 1)
  } else if (template === 'adventure') {
    context.fillStyle = '#dce9df'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#286c5d'
    context.beginPath()
    context.moveTo(0, 570)
    context.quadraticCurveTo(300, 455, 590, 575)
    context.quadraticCurveTo(900, 705, 1200, 500)
    context.lineTo(1200, 840)
    context.lineTo(0, 840)
    context.fill()
    context.fillStyle = '#243b35'
    context.textAlign = 'left'
    context.font = `700 44px ${DISPLAY_FONT}`
    context.fillText('Малък приключенец', 72, 75)
    context.font = `400 20px ${BODY_FONT}`
    context.fillText('пътепис от Pawly Moments', 76, 108)
    shadow(context, 18)
    photo(context, images[0], 72, 145, 530, 350, 16)
    if (images[1]) photo(context, images[1], 675, 125, 440, 285, 16)
    if (images[2]) photo(context, images[2], 410, 455, 380, 235, 16)
    resetShadow(context)
    context.fillStyle = '#fffaf4'
    context.textAlign = 'center'
    context.font = `700 30px ${DISPLAY_FONT}`
    text(context, petName.trim() || 'Нов маршрут', 600, 760, 1000, 36, 1)
    context.font = `400 22px ${BODY_FONT}`
    text(context, cleanCaption(caption, petName) || 'Всеки път е по-хубав заедно.', 600, 805, 1000, 28, 1)
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Невалидно изображение')) }
    image.src = url
  })
}

function setStatus(element, message, type = 'warning') {
  element.className = `alert alert-${type} mt-3`
  element.textContent = message
}

function thumbnail(item) {
  const cards = item.photos === 1 ? '<i></i>' : item.photos === 2 ? '<i></i><i></i>' : '<i></i><i></i><i></i>'
  return `<span class="pawly-template-thumb pawly-template-thumb-${item.id}" aria-hidden="true">${cards}<b>${item.photos === 3 ? '3' : item.photos}</b></span>`
}

export function renderMomentsPage() {
  const container = document.querySelector('[data-moments]')
  if (!container) return
  container.innerHTML = `
    <div class="pawly-moments-heading mb-4">
      <p class="pawly-eyebrow mb-2"><i class="bi bi-stars me-1" aria-hidden="true"></i>Твоето творческо студио</p>
      <h1 class="pawly-title display-5 mb-2">Pawly Moments</h1>
      <p class="pawly-subtitle mb-0">Създай красив спомен, който заслужава да бъде споделен.</p>
    </div>
    <div class="row g-4 align-items-start">
      <div class="col-lg-5">
        <section class="card pawly-card p-3 p-md-4" aria-labelledby="template-gallery-title">
          <div class="d-flex justify-content-between align-items-end mb-3">
            <div><h2 id="template-gallery-title" class="h4 pawly-title mb-1">Избери дизайн</h2><p class="text-muted small mb-0">Всеки шаблон показва нужния брой снимки.</p></div>
            <span class="badge rounded-pill text-bg-light">6 дизайна</span>
          </div>
          <div class="row g-3" data-template-list>${templates.map((item, index) => `<div class="col-6"><button class="pawly-template-card ${index === 0 ? 'is-selected' : ''}" type="button" data-template="${item.id}" aria-pressed="${index === 0}">${thumbnail(item)}<span class="pawly-template-card-name">${item.label}</span><small>${item.description}</small></button></div>`).join('')}</div>
        </section>
        <section class="card pawly-card p-3 p-md-4 mt-4" aria-labelledby="personalization-title">
          <h2 id="personalization-title" class="h4 pawly-title mb-3">Персонализирай</h2>
          <label class="form-label" for="moment-photos">Снимки <span class="text-muted fw-normal">(JPG, PNG или WebP · до 5 MB)</span></label>
          <input class="form-control" id="moment-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple>
          <div class="small text-muted mt-2" data-photo-count>Избери до 3 снимки от устройството си.</div>
          <div class="row g-2 mt-2 d-none" data-template-fields>
            <div class="col-6 d-none" data-field="age"><label class="form-label" for="moment-age">Възраст</label><input class="form-control" id="moment-age" maxlength="3" inputmode="numeric" placeholder="Например: 2"></div>
            <div class="col-12 d-none" data-field="details"><label class="form-label" for="moment-details">Лични детайли</label><input class="form-control" id="moment-details" maxlength="80" placeholder="Обича топки и дълги разходки"></div>
            <div class="col-12 d-none" data-field="headlines"><label class="form-label" for="moment-headline">Основно заглавие</label><input class="form-control" id="moment-headline" maxlength="48" placeholder="Звездата на корицата"><label class="form-label mt-2" for="moment-subheadline">Подзаглавие</label><input class="form-control" id="moment-subheadline" maxlength="90" placeholder="История с лапички и много любов."></div>
          </div>
          <label class="form-label mt-3" for="moment-pet-name">Име на любимеца</label>
          <input class="form-control" id="moment-pet-name" maxlength="40" placeholder="Например: Луна">
          <label class="form-label mt-3" for="moment-caption">Лично послание</label>
          <textarea class="form-control" id="moment-caption" maxlength="160" rows="3" placeholder="Напиши кратък спомен или послание"></textarea>
          <div class="alert d-none" data-moment-status role="status"></div>
          <button class="btn btn-primary w-100 mt-3" type="button" data-download-moment disabled><i class="bi bi-download me-2" aria-hidden="true"></i>Изтегли като PNG</button>
        </section>
        <section class="card pawly-card p-3 p-md-4 mt-4" aria-labelledby="inspiration-title">
          <h2 id="inspiration-title" class="h5 pawly-title">AI вдъхновение</h2>
          <p class="text-muted small">Опиши момента и избери настроение за идеи за надпис.</p>
          <textarea class="form-control" id="inspiration-description" rows="2" placeholder="Например: Луна тича по плажа за първи път"></textarea>
          <select class="form-select mt-2" id="inspiration-tone"><option value="funny">Забавно</option><option value="sweet">Нежно</option><option value="emotional">Емоционално</option></select>
          <button class="btn btn-outline-primary mt-3" type="button" data-inspiration><i class="bi bi-stars me-2" aria-hidden="true"></i>Покажи идеи</button>
          <div class="small text-muted mt-3">Локални идеи за надпис — не са генерирани от AI.</div><div class="list-group mt-2 d-none" data-suggestions></div>
        </section>
      </div>
      <div class="col-lg-7">
        <section class="card pawly-card p-3 p-md-4 pawly-moment-preview" aria-labelledby="preview-title">
          <div class="d-flex justify-content-between align-items-center mb-3"><h2 id="preview-title" class="h4 pawly-title mb-0">Преглед</h2><span class="badge rounded-pill text-bg-light">Само на твоето устройство</span></div>
          <div class="pawly-canvas-wrap"><canvas data-moment-canvas aria-label="Преглед на създадения дизайн"></canvas><div class="pawly-canvas-empty" data-canvas-empty><i class="bi bi-images" aria-hidden="true"></i><span>Избери снимки, за да видиш дизайна си.</span></div></div>
        </section>
      </div>
    </div>`

  const fileInput = container.querySelector('#moment-photos')
  const canvas = container.querySelector('[data-moment-canvas]')
  const emptyState = container.querySelector('[data-canvas-empty]')
  const status = container.querySelector('[data-moment-status]')
  const downloadButton = container.querySelector('[data-download-moment]')
  const photos = []
  let selectedTemplate = 'polaroid'
  const currentTemplate = () => templates.find((item) => item.id === selectedTemplate)
  const options = () => ({
    age: container.querySelector('#moment-age')?.value || '',
    details: container.querySelector('#moment-details')?.value || '',
    headline: container.querySelector('#moment-headline')?.value || '',
    subheadline: container.querySelector('#moment-subheadline')?.value || '',
  })
  const redraw = () => {
    if (!photos.length) {
      emptyState.classList.remove('d-none')
      downloadButton.disabled = true
      return
    }
    try {
      renderCanvas(canvas, photos, selectedTemplate, container.querySelector('#moment-pet-name').value, container.querySelector('#moment-caption').value, options())
      emptyState.classList.add('d-none')
      downloadButton.disabled = false
    } catch (error) {
      setStatus(status, 'Прегледът не можа да бъде създаден. Моля, опитай с друга снимка.')
    }
  }
  fileInput.addEventListener('change', async () => {
    const selected = Array.from(fileInput.files || [])
    photos.length = 0
    if (selected.length > MAX_PHOTOS) {
      setStatus(status, 'Можеш да избереш най-много 3 снимки.')
      fileInput.value = ''
      redraw()
      return
    }
    try {
      for (const file of selected) {
        if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) throw new Error('Невалиден файл')
        photos.push({ file, image: await loadImage(file) })
      }
      container.querySelector('[data-photo-count]').textContent = `${photos.length} от ${currentTemplate().photos} препоръчителни снимки са избрани.`
      status.className = 'alert d-none'
      redraw()
    } catch (error) {
      photos.length = 0
      fileInput.value = ''
      setStatus(status, 'Избери валидни JPG, PNG или WebP изображения до 5 MB.')
      redraw()
    }
  })
  container.querySelectorAll('[data-template]').forEach((button) => button.addEventListener('click', () => {
    selectedTemplate = button.dataset.template
    const selected = currentTemplate()
    container.querySelectorAll('[data-template]').forEach((item) => {
      const active = item === button
      item.classList.toggle('is-selected', active)
      item.setAttribute('aria-pressed', String(active))
    })
    container.querySelector('[data-template-fields]').classList.toggle('d-none', !selected.field)
    container.querySelectorAll('[data-field]').forEach((field) => field.classList.toggle('d-none', field.dataset.field !== selected.field))
    container.querySelector('[data-photo-count]').textContent = photos.length ? `${photos.length} от ${selected.photos} препоръчителни снимки са избрани.` : `Избери до ${selected.photos} снимк${selected.photos === 1 ? 'а' : 'и'}.`
    redraw()
  }))
  container.querySelectorAll('#moment-pet-name, #moment-caption, [data-template-fields] input').forEach((field) => field.addEventListener('input', redraw))
  container.querySelector('[data-inspiration]').addEventListener('click', async () => {
    const suggestions = await generateCaptionSuggestions({ description: container.querySelector('#inspiration-description').value, tone: container.querySelector('#inspiration-tone').value, petName: container.querySelector('#moment-pet-name').value })
    const list = container.querySelector('[data-suggestions]')
    list.innerHTML = suggestions.map((suggestion) => `<button type="button" class="list-group-item list-group-item-action" data-suggestion>${suggestion}</button>`).join('')
    list.classList.remove('d-none')
    list.querySelectorAll('[data-suggestion]').forEach((button) => button.addEventListener('click', () => {
      container.querySelector('#moment-caption').value = button.textContent
      redraw()
    }))
  })
  downloadButton.addEventListener('click', () => {
    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus(status, 'Изтеглянето не можа да бъде подготвено. Моля, опитай отново.')
        return
      }
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'pawly-moment.png'
      try {
        link.click()
        setTimeout(() => URL.revokeObjectURL(link.href), 1000)
      } catch (error) {
        URL.revokeObjectURL(link.href)
        setStatus(status, 'Изтеглянето не можа да бъде стартирано. Моля, опитай отново.')
      }
    }, 'image/png')
  })
}

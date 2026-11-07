import { requireUser } from '../services/auth.js'
import { createPet, deletePet, getPetPhotoUrl, listPets, updatePet, uploadPetPhoto } from '../services/pets.js'
import { fillPetForm, readPetForm } from '../utils/pet-validation.js'

const sexLabels = { male: 'Мъжки', female: 'Женски', unknown: 'Не е посочен' }

function petForm(pet) {
  return `
    <form class="card pawly-card p-4 d-none" id="pet-form" novalidate>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h4 pawly-title mb-0" id="pet-form-title">${pet ? 'Редактиране на любимец' : 'Нов любимец'}</h2>
        <button class="btn-close" type="button" aria-label="Затвори формата" data-cancel-form></button>
      </div>
      <div class="alert d-none" data-form-status role="status"></div>
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label" for="pet-photo">Снимка на любимеца</label>
          <input class="form-control" id="pet-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
          <div class="form-text">JPG, PNG или WebP до 5 MB.</div>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="pet-name">Име *</label>
          <input class="form-control" id="pet-name" name="name" required maxlength="100" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="pet-species">Вид *</label>
          <input class="form-control" id="pet-species" name="species" required maxlength="50" placeholder="Например: куче" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="pet-breed">Порода</label>
          <input class="form-control" id="pet-breed" name="breed" maxlength="100" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="pet-sex">Пол</label>
          <select class="form-select" id="pet-sex" name="sex">
            <option value="">Не е посочен</option>
            <option value="male">Мъжки</option>
            <option value="female">Женски</option>
            <option value="unknown">Неизвестен</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="pet-birth-date">Дата на раждане</label>
          <input class="form-control" id="pet-birth-date" name="birthDate" type="date" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="pet-weight">Тегло (кг)</label>
          <input class="form-control" id="pet-weight" name="weight" type="number" min="0.01" step="0.01" />
        </div>
        <div class="col-12">
          <label class="form-label" for="pet-notes">Бележки</label>
          <textarea class="form-control" id="pet-notes" name="notes" rows="3" maxlength="2000"></textarea>
        </div>
      </div>
      <div class="d-flex flex-wrap gap-2 mt-4">
        <button class="btn btn-primary" type="submit"><span data-submit-label>${pet ? 'Запази промените' : 'Добави любимец'}</span></button>
        <button class="btn btn-outline-secondary" type="button" data-cancel-form>Отказ</button>
      </div>
    </form>
  `
}

function formatPetDetails(pet) {
  return [
    pet.species,
    pet.breed,
    pet.sex && sexLabels[pet.sex],
    pet.birth_date && `Роден на ${new Date(`${pet.birth_date}T00:00:00`).toLocaleDateString('bg-BG')}`,
  ].filter(Boolean).join(' · ')
}

function renderPets(container, pets) {
  if (!pets.length) {
    container.innerHTML = `<div class="card pawly-card pawly-placeholder"><div><div class="pawly-placeholder-icon mb-3"><i class="bi bi-paw-fill" aria-hidden="true"></i></div><h2 class="h4 pawly-title">Все още нямаш добавени любимци</h2><p class="text-muted mb-0">Добави първия си любимец, за да започнеш.</p></div></div>`
    return
  }
  container.innerHTML = `<div class="row g-4">${pets.map((pet) => `
    <div class="col-12 col-md-6">
      <article class="card pawly-card h-100 p-4">
        <div class="d-flex justify-content-between gap-3">
          <div>${pet.photoUrl ? `<img class="pawly-pet-photo mb-3" src="${pet.photoUrl}" alt="Снимка на ${pet.name}" />` : '<div class="pawly-placeholder-icon mb-3"><i class="bi bi-paw-fill" aria-hidden="true"></i></div>'}<h2 class="h4 pawly-title mb-1">${pet.name}</h2><p class="text-muted mb-0">${formatPetDetails(pet)}</p></div>
          <div class="dropdown"><button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-label="Действия за ${pet.name}"><i class="bi bi-three-dots-vertical" aria-hidden="true"></i></button><ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="/pet-details.html?id=${encodeURIComponent(pet.id)}">Преглед</a></li><li><button class="dropdown-item" type="button" data-edit-pet="${pet.id}">Редактиране</button></li><li><button class="dropdown-item text-danger" type="button" data-delete-pet="${pet.id}">Изтриване</button></li></ul></div>
        </div>
        ${pet.weight ? `<p class="small text-muted mt-3 mb-0"><i class="bi bi-speedometer2 me-1" aria-hidden="true"></i>${pet.weight} кг</p>` : ''}
      </article>
    </div>`).join('')}</div>`
}

function setStatus(element, type, message) {
  element.className = `alert alert-${type}`
  element.textContent = message
}

export async function renderPetsPage() {
  const formContainer = document.querySelector('[data-pet-form-container]')
  const listContainer = document.querySelector('[data-pets-list]')
  const addButton = document.querySelector('[data-add-pet]')
  const pageStatus = document.querySelector('[data-page-status]')
  let user = null
  let pets = []
  let editingId = new URLSearchParams(window.location.search).get('edit')
  const userPromise = requireUser()

  const load = async () => {
    listContainer.innerHTML = '<div class="text-center text-muted py-5">Зареждане на любимците...</div>'
    pets = await listPets()
    pets = await Promise.all(
      pets.map(async (pet) => ({
        ...pet,
        photoUrl: await getPetPhotoUrl(user.id, pet.id),
      })),
    )
    renderPets(listContainer, pets)
  }
  const openForm = (pet) => {
    formContainer.innerHTML = petForm(pet)
    const form = formContainer.querySelector('form')
    if (pet) fillPetForm(form, pet)
    form.classList.remove('d-none')
    form.elements.name.focus()
    form.addEventListener('submit', async (event) => {
      event.preventDefault()
      const { errors, pet: values } = readPetForm(form)
      const status = form.querySelector('[data-form-status]')
      const photo = form.elements.photo.files[0]
      if (photo && (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > 5 * 1024 * 1024)) {
        return setStatus(status, 'danger', 'Снимката трябва да бъде JPG, PNG или WebP файл до 5 MB.')
      }
      if (errors.length) return setStatus(status, 'danger', errors.join(' '))
      const button = form.querySelector('button[type="submit"]')
      button.disabled = true
      button.setAttribute('aria-busy', 'true')
      try {
        const savedPet = pet ? await updatePet(pet.id, values) : await createPet(user.id, values)
        if (photo) await uploadPetPhoto(user.id, savedPet.id, photo)
        formContainer.innerHTML = ''
        await load()
        setStatus(document.querySelector('[data-page-status]'), 'success', pet ? 'Промените са запазени.' : 'Любимецът е добавен успешно.')
      } catch (error) {
        setStatus(status, 'danger', 'Любимецът не можа да бъде запазен. Моля, опитай отново.')
      } finally {
        button.disabled = false
        button.removeAttribute('aria-busy')
      }
    })
    form.querySelectorAll('[data-cancel-form]').forEach((button) => button.addEventListener('click', () => { formContainer.innerHTML = '' }))
  }

  addButton.addEventListener('click', async () => {
    try {
      user = user || await userPromise
      if (user) openForm()
    } catch (error) {
      setStatus(pageStatus, 'danger', 'Сесията не можа да бъде проверена. Моля, влезте отново.')
    }
  })
  listContainer.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-pet]')
    const deleteButton = event.target.closest('[data-delete-pet]')
    if (editButton) openForm(pets.find((pet) => pet.id === editButton.dataset.editPet))
    if (deleteButton && window.confirm('Искаш ли да изтриеш този любимец?')) {
      deletePet(deleteButton.dataset.deletePet).then(load).then(() => setStatus(document.querySelector('[data-page-status]'), 'success', 'Любимецът е изтрит.')).catch(() => setStatus(document.querySelector('[data-page-status]'), 'danger', 'Любимецът не можа да бъде изтрит.'))
    }
  })
  try {
    user = await userPromise
    if (!user) return
    await load()
    if (editingId) {
      const pet = pets.find((item) => item.id === editingId)
      if (pet) openForm(pet)
    }
  } catch (error) {
    setStatus(pageStatus, 'danger', 'Любимците не можаха да бъдат заредени.')
  }
}

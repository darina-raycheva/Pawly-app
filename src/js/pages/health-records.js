import { requireUser } from '../services/auth.js'
import { createHealthRecord, deleteHealthRecord, listHealthRecords, updateHealthRecord } from '../services/health-records.js'
import { listPets } from '../services/pets.js'
import { Dropdown } from 'bootstrap'

const recordTypeLabels = {
  vaccination: 'Ваксинация',
  checkup: 'Преглед',
  treatment: 'Лечение',
  test: 'Изследване',
  deworming: 'Обезпаразитяване',
  other: 'Друго',
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('bg-BG')
}

function recordForm(record, pets) {
  return `
    <form class="card pawly-card p-4 mb-4" data-health-record-form novalidate>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h4 pawly-title mb-0">${record ? 'Редактиране на здравен запис' : 'Нов здравен запис'}</h2>
        <button class="btn-close" type="button" aria-label="Затвори формата" data-cancel-record></button>
      </div>
      <div class="alert d-none" data-form-status role="status"></div>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label" for="health-record-pet">Любимец *</label>
          <select class="form-select" id="health-record-pet" name="petId" required>
            <option value="">Избери любимец</option>
            ${pets.map((pet) => `<option value="${escapeHtml(pet.id)}">${escapeHtml(pet.name)}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label" for="health-record-type">Вид запис *</label>
          <select class="form-select" id="health-record-type" name="recordType" required>
            <option value="">Избери вид</option>
            ${Object.entries(recordTypeLabels).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
          </select>
        </div>
        <div class="col-md-8">
          <label class="form-label" for="health-record-title">Заглавие *</label>
          <input class="form-control" id="health-record-title" name="title" maxlength="200" required />
        </div>
        <div class="col-md-4">
          <label class="form-label" for="health-record-date">Дата *</label>
          <input class="form-control" id="health-record-date" name="recordDate" type="date" required />
        </div>
        <div class="col-12">
          <label class="form-label" for="health-record-veterinarian">Ветеринар или клиника</label>
          <input class="form-control" id="health-record-veterinarian" name="veterinarianClinic" maxlength="200" />
        </div>
        <div class="col-12">
          <label class="form-label" for="health-record-notes">Бележки</label>
          <textarea class="form-control" id="health-record-notes" name="notes" rows="4" maxlength="5000"></textarea>
        </div>
      </div>
      <div class="d-flex flex-wrap gap-2 mt-4">
        <button class="btn btn-primary" type="submit">${record ? 'Запази промените' : 'Добави запис'}</button>
        <button class="btn btn-outline-secondary" type="button" data-cancel-record>Отказ</button>
      </div>
    </form>
  `
}

function renderRecords(container, records) {
  if (!records.length) {
    container.innerHTML = `
      <div class="card pawly-card pawly-placeholder">
        <div>
          <div class="pawly-placeholder-icon mb-3"><i class="bi bi-heart-pulse" aria-hidden="true"></i></div>
          <h2 class="h4 pawly-title">Все още нямате здравни записи</h2>
          <p class="text-muted mb-0">Добавете първия запис, за да следите грижите за любимеца си.</p>
        </div>
      </div>`
    return
  }

  container.innerHTML = `<div class="row g-4">${records.map((record) => `
    <div class="col-12 col-md-6">
      <article class="card pawly-card h-100 p-4">
        <div class="d-flex justify-content-between gap-3">
          <div>
            <p class="pawly-eyebrow mb-2">${escapeHtml(recordTypeLabels[record.record_type])}</p>
            <h2 class="h4 pawly-title mb-1">${escapeHtml(record.title)}</h2>
            <p class="text-muted mb-0"><i class="bi bi-paw-fill me-1" aria-hidden="true"></i>${escapeHtml(record.pets.name)}</p>
          </div>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary" type="button" data-health-record-dropdown aria-label="Действия за ${escapeHtml(record.title)}"><i class="bi bi-three-dots-vertical" aria-hidden="true"></i></button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><button class="dropdown-item" type="button" data-edit-record="${record.id}">Редактиране</button></li>
              <li><button class="dropdown-item text-danger" type="button" data-delete-record="${record.id}">Изтриване</button></li>
            </ul>
          </div>
        </div>
        <dl class="row small mt-4 mb-0">
          <dt class="col-5 mb-2">Дата</dt><dd class="col-7 mb-2">${formatDate(record.record_date)}</dd>
          ${record.veterinarian_clinic ? `<dt class="col-5 mb-2">Ветеринар/клиника</dt><dd class="col-7 mb-2">${escapeHtml(record.veterinarian_clinic)}</dd>` : ''}
          <dt class="col-5">Бележки</dt><dd class="col-7">${record.notes ? escapeHtml(record.notes) : 'Няма добавени бележки.'}</dd>
        </dl>
      </article>
    </div>`).join('')}</div>`
  container.querySelectorAll('[data-health-record-dropdown]').forEach((toggle) => {
    const dropdown = Dropdown.getOrCreateInstance(toggle)
    toggle.addEventListener('click', (event) => {
      event.stopPropagation()
      dropdown.toggle()
    })
  })
}

function setStatus(element, type, message) {
  element.className = `alert alert-${type}`
  element.textContent = message
}

export async function renderHealthRecordsPage() {
  const formContainer = document.querySelector('[data-health-record-form-container]')
  const listContainer = document.querySelector('[data-health-records-list]')
  const addButton = document.querySelector('[data-add-health-record]')
  const pageStatus = document.querySelector('[data-page-status]')
  let user
  let pets = []
  let records = []
  let editingRecord = null

  try {
    user = await requireUser()
    if (!user) return
    pets = await listPets()
    records = await listHealthRecords()
    renderRecords(listContainer, records)
    addButton.disabled = !pets.length
    if (!pets.length) {
      setStatus(pageStatus, 'warning', 'Добавете любимец, преди да създадете здравен запис.')
    }
  } catch (error) {
    setStatus(pageStatus, 'danger', 'Здравните записи не можаха да бъдат заредени. Моля, опитай отново.')
    return
  }

  const loadRecords = async () => {
    records = await listHealthRecords()
    renderRecords(listContainer, records)
  }

  const closeRecordDropdowns = () => {
    listContainer.querySelectorAll('[data-health-record-dropdown]').forEach((toggle) => {
      Dropdown.getInstance(toggle)?.hide()
    })
  }

  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.dropdown')) closeRecordDropdowns()
  }, { passive: true })

  const closeForm = () => {
    formContainer.innerHTML = ''
    editingRecord = null
  }

  const openForm = (record = null) => {
    editingRecord = record
    formContainer.innerHTML = recordForm(record, pets)
    const form = formContainer.querySelector('form')
    if (record) {
      form.elements.petId.value = record.pet_id
      form.elements.recordType.value = record.record_type
      form.elements.title.value = record.title
      form.elements.recordDate.value = record.record_date
      form.elements.veterinarianClinic.value = record.veterinarian_clinic || ''
      form.elements.notes.value = record.notes || ''
    }
    form.elements.petId.focus()
    form.querySelectorAll('[data-cancel-record]').forEach((button) => button.addEventListener('click', closeForm))
    form.addEventListener('submit', async (event) => {
      event.preventDefault()
      const status = form.querySelector('[data-form-status]')
      if (!form.reportValidity()) return
      const values = {
        pet_id: form.elements.petId.value,
        record_type: form.elements.recordType.value,
        title: form.elements.title.value.trim(),
        record_date: form.elements.recordDate.value,
        veterinarian_clinic: form.elements.veterinarianClinic.value.trim() || null,
        notes: form.elements.notes.value.trim() || null,
      }
      const button = form.querySelector('button[type="submit"]')
      const isEditing = Boolean(editingRecord)
      button.disabled = true
      button.setAttribute('aria-busy', 'true')
      try {
        if (editingRecord) {
          await updateHealthRecord(editingRecord.id, values)
        } else {
          await createHealthRecord(user.id, values)
        }
        closeForm()
        await loadRecords()
        setStatus(pageStatus, 'success', isEditing ? 'Промените са запазени.' : 'Здравният запис е добавен успешно.')
      } catch (error) {
        setStatus(status, 'danger', 'Здравният запис не можа да бъде запазен. Моля, опитай отново.')
      } finally {
        button.disabled = false
        button.removeAttribute('aria-busy')
      }
    })
  }

  addButton.addEventListener('click', () => openForm())
  listContainer.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-record]')
    const deleteButton = event.target.closest('[data-delete-record]')
    if (editButton) {
      closeRecordDropdowns()
      openForm(records.find((record) => record.id === editButton.dataset.editRecord))
      return
    }
    if (deleteButton && window.confirm('Искаш ли да изтриеш този здравен запис?')) {
      closeRecordDropdowns()
      deleteButton.disabled = true
      try {
        await deleteHealthRecord(deleteButton.dataset.deleteRecord)
        await loadRecords()
        setStatus(pageStatus, 'success', 'Здравният запис е изтрит.')
      } catch (error) {
        deleteButton.disabled = false
        setStatus(pageStatus, 'danger', 'Здравният запис не можа да бъде изтрит. Моля, опитай отново.')
      }
    }
  })
}

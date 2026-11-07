import { requireUser } from '../services/auth.js'
import { getPet, getPetPhotoUrl } from '../services/pets.js'

export async function renderPetDetailsPage() {
  const user = await requireUser()
  if (!user) return
  const container = document.querySelector('[data-pet-details]')
  const id = new URLSearchParams(window.location.search).get('id')
  if (!id) {
    container.innerHTML = '<div class="alert alert-warning">Не е посочен любимец.</div>'
    return
  }
  try {
    const pet = await getPet(id)
    if (!pet) {
      container.innerHTML = '<div class="alert alert-warning">Любимецът не е намерен или нямате достъп до него.</div>'
      return
    }
    const photoUrl = await getPetPhotoUrl(user.id, pet.id)
    container.innerHTML = `
      <article class="card pawly-card p-4 p-md-5">
        <a class="pawly-text-link d-inline-block mb-4" href="/pets.html"><i class="bi bi-arrow-left me-1" aria-hidden="true"></i>Назад към любимците</a>
        ${photoUrl ? `<img class="pawly-pet-photo mb-3" src="${photoUrl}" alt="Снимка на ${pet.name}" />` : '<div class="pawly-placeholder-icon mb-3"><i class="bi bi-paw-fill" aria-hidden="true"></i></div>'}
        <h2 class="pawly-title">${pet.name}</h2>
        <dl class="row mt-4 mb-0">
          <dt class="col-sm-4 mb-2">Вид</dt><dd class="col-sm-8 mb-2">${pet.species}</dd>
          <dt class="col-sm-4 mb-2">Порода</dt><dd class="col-sm-8 mb-2">${pet.breed || 'Не е посочена'}</dd>
          <dt class="col-sm-4 mb-2">Пол</dt><dd class="col-sm-8 mb-2">${pet.sex === 'male' ? 'Мъжки' : pet.sex === 'female' ? 'Женски' : 'Не е посочен'}</dd>
          <dt class="col-sm-4 mb-2">Дата на раждане</dt><dd class="col-sm-8 mb-2">${pet.birth_date ? new Date(`${pet.birth_date}T00:00:00`).toLocaleDateString('bg-BG') : 'Не е посочена'}</dd>
          <dt class="col-sm-4 mb-2">Тегло</dt><dd class="col-sm-8 mb-2">${pet.weight ? `${pet.weight} кг` : 'Не е посочено'}</dd>
          <dt class="col-sm-4">Бележки</dt><dd class="col-sm-8">${pet.notes || 'Няма добавени бележки.'}</dd>
        </dl>
        <a class="btn btn-primary mt-4" href="/pets.html?edit=${encodeURIComponent(pet.id)}">Редактиране</a>
      </article>`
  } catch (error) {
    container.innerHTML = '<div class="alert alert-danger">Подробностите не можаха да бъдат заредени. Моля, опитай отново.</div>'
  }
}

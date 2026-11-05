export function readPetForm(form) {
  const formData = new FormData(form)
  const name = String(formData.get('name') || '').trim()
  const species = String(formData.get('species') || '').trim()
  const birthDate = String(formData.get('birthDate') || '')
  const weightValue = String(formData.get('weight') || '').trim()
  const errors = []

  if (!name) errors.push('Моля, въведете име на любимеца.')
  if (!species) errors.push('Моля, въведете вид на любимеца.')
  if (birthDate) {
    const date = new Date(`${birthDate}T00:00:00`)
    if (Number.isNaN(date.getTime()) || birthDate > new Date().toISOString().slice(0, 10)) {
      errors.push('Моля, въведете валидна дата на раждане.')
    }
  }
  if (weightValue && (!Number.isFinite(Number(weightValue)) || Number(weightValue) <= 0)) {
    errors.push('Теглото трябва да бъде положително число.')
  }

  return {
    errors,
    pet: {
      name,
      species,
      breed: String(formData.get('breed') || '').trim() || null,
      sex: String(formData.get('sex') || '') || null,
      birth_date: birthDate || null,
      weight: weightValue ? Number(weightValue) : null,
      notes: String(formData.get('notes') || '').trim() || null,
    },
  }
}

export function fillPetForm(form, pet) {
  form.elements.name.value = pet.name || ''
  form.elements.species.value = pet.species || ''
  form.elements.breed.value = pet.breed || ''
  form.elements.sex.value = pet.sex || ''
  form.elements.birthDate.value = pet.birth_date || ''
  form.elements.weight.value = pet.weight || ''
  form.elements.notes.value = pet.notes || ''
}

import { getSupabaseClient } from './supabase.js'

const petFields = 'id, user_id, name, species, breed, sex, birth_date, weight, notes, created_at, updated_at'
const petPhotosBucket = 'pet-photos'

function getPhotoExtension(file) {
  return file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
}

export async function listPets() {
  const { data, error } = await getSupabaseClient()
    .from('pets')
    .select(petFields)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getPet(id) {
  const { data, error } = await getSupabaseClient()
    .from('pets')
    .select(petFields)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function createPet(userId, pet) {
  const { data, error } = await getSupabaseClient()
    .from('pets')
    .insert({ ...pet, user_id: userId })
    .select(petFields)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updatePet(id, pet) {
  const { data, error } = await getSupabaseClient()
    .from('pets')
    .update(pet)
    .eq('id', id)
    .select(petFields)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deletePet(id) {
  const { error } = await getSupabaseClient()
    .from('pets')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function uploadPetPhoto(userId, petId, file) {
  const supabase = getSupabaseClient()
  const path = `${userId}/${petId}/${crypto.randomUUID()}.${getPhotoExtension(file)}`
  const { error } = await supabase.storage
    .from(petPhotosBucket)
    .upload(path, file, {
      contentType: file.type,
      metadata: { pet_id: petId },
    })

  if (error) {
    throw error
  }

  const { data: existingFiles, error: listError } = await supabase.storage
    .from(petPhotosBucket)
    .list(`${userId}/${petId}`)

  if (listError) {
    throw listError
  }

  const oldPaths = existingFiles
    .map((item) => `${userId}/${petId}/${item.name}`)
    .filter((item) => item !== path)

  if (oldPaths.length) {
    const { error: removeError } = await supabase.storage.from(petPhotosBucket).remove(oldPaths)
    if (removeError) {
      throw removeError
    }
  }

  return path
}

export async function getPetPhotoUrl(userId, petId) {
  const supabase = getSupabaseClient()
  const { data: files, error } = await supabase.storage
    .from(petPhotosBucket)
    .list(`${userId}/${petId}`, { sortBy: { column: 'created_at', order: 'desc' }, limit: 1 })

  if (error) {
    throw error
  }

  if (!files.length) {
    return null
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from(petPhotosBucket)
    .createSignedUrl(`${userId}/${petId}/${files[0].name}`, 3600)

  if (signedUrlError) {
    throw signedUrlError
  }

  return data.signedUrl
}

import { getSupabaseClient } from './supabase.js'

const petFields = 'id, user_id, name, species, breed, sex, birth_date, weight, notes, created_at, updated_at'

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

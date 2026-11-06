import { getSupabaseClient } from './supabase.js'

const healthRecordFields = 'id, user_id, pet_id, record_type, title, record_date, veterinarian_clinic, notes, created_at, updated_at'

export async function listHealthRecords() {
  const { data, error } = await getSupabaseClient()
    .from('health_records')
    .select(`${healthRecordFields}, pets!inner(id, name)`)
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function createHealthRecord(userId, record) {
  const { data, error } = await getSupabaseClient()
    .from('health_records')
    .insert({ ...record, user_id: userId })
    .select(`${healthRecordFields}, pets!inner(id, name)`)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updateHealthRecord(id, record) {
  const { data, error } = await getSupabaseClient()
    .from('health_records')
    .update(record)
    .eq('id', id)
    .select(`${healthRecordFields}, pets!inner(id, name)`)
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function deleteHealthRecord(id) {
  const { error } = await getSupabaseClient()
    .from('health_records')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

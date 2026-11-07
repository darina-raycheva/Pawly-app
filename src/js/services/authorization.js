import { getSupabaseClient } from './supabase.js'

export async function getCurrentUser() {
  const { data, error } = await getSupabaseClient().auth.getUser()

  if (error) {
    throw error
  }

  return data.user
}

export async function isCurrentUserAdmin(userId) {
  if (!userId) return false

  const { data, error } = await getSupabaseClient()
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data?.role === 'admin'
}

export async function requireAdmin() {
  const supabase = getSupabaseClient()
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) throw sessionError

  if (!sessionData.session) {
    window.location.assign('/login.html')
    return null
  }

  const user = await getCurrentUser()
  if (!user) {
    window.location.assign('/login.html')
    return null
  }

  if (!(await isCurrentUserAdmin(user.id))) {
    window.location.assign('/index.html')
    return null
  }

  return user
}

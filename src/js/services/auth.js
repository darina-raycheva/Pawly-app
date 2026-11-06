import { getSupabaseClient } from './supabase.js'

export async function requireUser() {
  const supabase = getSupabaseClient()
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (!sessionData.session) {
    window.location.assign('/login.html')
    return null
  }

  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data.user) {
    window.location.assign('/login.html')
    return null
  }

  return data.user
}

export async function updateUserProfile({ firstName, lastName }) {
  const { data, error } = await getSupabaseClient().auth.updateUser({
    data: {
      first_name: firstName,
      last_name: lastName,
    },
  })

  if (error) {
    throw error
  }

  return data.user
}

export async function signOut() {
  const { error } = await getSupabaseClient().auth.signOut()

  if (error) {
    throw error
  }
}

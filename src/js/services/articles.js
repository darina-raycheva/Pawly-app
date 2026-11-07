import { getSupabaseClient } from './supabase.js'

function throwIfError(error) {
  if (error) throw error
}

export async function listPublishedArticles() {
  const { data, error } = await getSupabaseClient()
    .from('articles')
    .select('id, title, slug, excerpt, content, published, created_at, updated_at, cover_image_path')
    .eq('published', true)
    .order('created_at', { ascending: false })

  throwIfError(error)
  return data || []
}

export async function getPublishedArticleBySlug(slug) {
  const { data, error } = await getSupabaseClient()
    .from('articles')
    .select('id, title, slug, excerpt, content, published, created_at, updated_at, cover_image_path')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  throwIfError(error)
  return data
}

export async function listArticles() {
  const { data, error } = await getSupabaseClient()
    .from('articles')
    .select('id, title, slug, excerpt, content, published, created_at, updated_at, author_id, cover_image_path')
    .order('created_at', { ascending: false })

  throwIfError(error)
  return data || []
}

export async function createArticle(article) {
  const { data, error } = await getSupabaseClient()
    .from('articles')
    .insert(article)
    .select()
    .single()

  throwIfError(error)
  return data
}

export async function updateArticle(id, article) {
  const { data, error } = await getSupabaseClient()
    .from('articles')
    .update(article)
    .eq('id', id)
    .select()
    .single()

  throwIfError(error)
  return data
}

export async function deleteArticle(id) {
  const { error } = await getSupabaseClient().from('articles').delete().eq('id', id)
  throwIfError(error)
}

export async function uploadArticleCover(path, file) {
  const { data, error } = await getSupabaseClient()
    .storage
    .from('article-covers')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  throwIfError(error)
  return data.path
}

export async function removeArticleCover(path) {
  if (!path) return
  const { error } = await getSupabaseClient().storage.from('article-covers').remove([path])
  throwIfError(error)
}

export async function getArticleCoverUrl(path) {
  if (!path) return null
  const { data, error } = await getSupabaseClient()
    .storage
    .from('article-covers')
    .createSignedUrl(path, 3600)

  throwIfError(error)
  return data.signedUrl
}

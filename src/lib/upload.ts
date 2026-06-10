import { supabase } from './supabase'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const MAX_STORY_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function validateImage(file: File, maxBytes: number) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Solo imágenes JPG, PNG, WebP o GIF')
  }
  if (file.size > maxBytes) {
    throw new Error(`Máximo ${Math.round(maxBytes / 1024 / 1024)}MB`)
  }
}

export async function uploadPhoto(userId: string, file: File) {
  validateImage(file, MAX_PHOTO_BYTES)
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('photos')
    .upload(path, file, { upsert: false })
  if (uploadErr) throw uploadErr

  const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path)

  const { data, error } = await supabase
    .from('photos')
    .insert({ user_id: userId, storage_path: path, url: publicUrl })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadStory(userId: string, file: File) {
  validateImage(file, MAX_STORY_BYTES)
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('stories')
    .upload(path, file, { upsert: false })
  if (uploadErr) throw uploadErr

  const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(path)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      storage_path: path,
      url: publicUrl,
      expires_at: expiresAt,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

import { supabase } from './supabase'
import type { VoteType, Post, Profile } from './database.types'

export const MAX_POSTS = 5

/**
 * Upload a new post image. If user has MAX_POSTS, delete oldest first.
 */
export async function createPost(
  userId: string,
  file: File,
  caption: string | null
): Promise<{ data: Post | null; error: string | null }> {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('posts')
      .select('id, image_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (fetchErr) throw fetchErr

    if (existing && existing.length >= MAX_POSTS) {
      const oldest = existing[0]
      const storagePath = oldest.image_url.split('/storage/v1/object/public/posts/')[1]
      if (storagePath) {
        await supabase.storage.from('posts').remove([storagePath])
      }
      const { error: delErr } = await supabase.from('posts').delete().eq('id', oldest.id)
      if (delErr) throw delErr
    }

    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('posts')
      .upload(path, file, { upsert: false })
    if (uploadErr) throw uploadErr

    const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(path)

    const { data: post, error: insertErr } = await supabase
      .from('posts')
      .insert({ user_id: userId, image_url: publicUrl, caption })
      .select()
      .single()
    if (insertErr) throw insertErr

    return { data: post, error: null }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return { data: null, error: msg }
  }
}

/**
 * Upload a story (auto-expires 24h via DB trigger or scheduled cleanup).
 */
export async function createStory(
  userId: string,
  file: File
): Promise<{ error: string | null }> {
  try {
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('stories')
      .upload(path, file, { upsert: false })
    if (uploadErr) throw uploadErr

    const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(path)
    const { error: insertErr } = await supabase
      .from('stories')
      .insert({ user_id: userId, media_url: publicUrl })
    if (insertErr) throw insertErr

    return { error: null }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

/** Fetch all active stories (< 24h old) */
export async function fetchActiveStories() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  return supabase
    .from('stories')
    .select('*, profile:profiles(id, username, avatar_url, display_name)')
    .gt('created_at', cutoff)
    .order('created_at', { ascending: false })
}

/** Feed: paginated posts from all users */
export async function fetchFeedPosts(page = 0, pageSize = 12) {
  return supabase
    .from('posts')
    .select('*, profile:profiles(id, username, avatar_url, display_name, karma_score)')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)
}

/** All posts for a single user */
export async function fetchUserPosts(userId: string) {
  return supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

/** Fetch profile by username */
export async function fetchProfileByUsername(username: string) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
}

/** Fetch profile by id */
export async function fetchProfileById(id: string) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
}

/** Search profiles by username prefix */
export async function searchProfiles(query: string) {
  return supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, karma_score')
    .ilike('username', `%${query}%`)
    .order('karma_score', { ascending: false })
    .limit(20)
}

/** Ranking: top N users by karma */
export async function fetchRanking(limit = 50) {
  return supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, karma_score, country, created_at')
    .order('karma_score', { ascending: false })
    .limit(limit)
}

/** Cast or flip a vote (anonymous to target) */
export async function castVote(
  voterId: string,
  targetId: string,
  voteType: VoteType
): Promise<{ error: string | null }> {
  if (voterId === targetId) return { error: 'Cannot vote for yourself' }
  try {
    const { error } = await supabase
      .from('votes')
      .upsert(
        { voter_id: voterId, target_id: targetId, vote_type: voteType },
        { onConflict: 'voter_id,target_id' }
      )
    if (error) throw error
    return { error: null }
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

/** Get current user's vote on a target (returns vote_type or null) */
export async function getMyVoteOnTarget(
  voterId: string,
  targetId: string
): Promise<VoteType | null> {
  const { data } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('voter_id', voterId)
    .eq('target_id', targetId)
    .single()
  return (data?.vote_type as VoteType) ?? null
}

/** Fetch vote totals (positive and negative) for a profile */
export async function fetchVoteSummary(targetId: string) {
  const { data } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('target_id', targetId)

  if (!data) return { positive: 0, negative: 0 }
  const positive = data.filter((v) => v.vote_type === 1).length
  const negative = data.filter((v) => v.vote_type === -1).length
  return { positive, negative }
}

/** Track behavioral event (fire-and-forget) */
export async function trackEvent(
  sessionHashId: string,
  eventType: string,
  opts: { country?: string; targetPostId?: string; metadata?: Record<string, unknown> } = {}
) {
  await supabase.from('behavioral_analytics').insert({
    session_hash_id: sessionHashId,
    event_type: eventType,
    country: opts.country ?? null,
    target_post_id: opts.targetPostId ?? null,
    metadata: opts.metadata ?? null,
  })
}

/** Update user profile fields */
export async function updateProfile(
  userId: string,
  fields: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'preferred_language' | 'country'>>
) {
  return supabase.from('profiles').update(fields).eq('id', userId)
}

/** Upload and set user avatar */
export async function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (upErr) return { error: upErr.message, url: null }
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)
  if (updateErr) return { error: updateErr.message, url: null }
  return { url: publicUrl, error: null }
}

/** Delete a post and its storage object */
export async function deletePost(postId: string, imageUrl: string, userId: string) {
  const storagePath = imageUrl.split('/storage/v1/object/public/posts/')[1]
  if (storagePath) await supabase.storage.from('posts').remove([storagePath])
  return supabase.from('posts').delete().eq('id', postId).eq('user_id', userId)
}
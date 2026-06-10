import { supabase } from './supabase'
import { captureEvent } from './analytics'

export async function castVote(
  voterId: string,
  targetId: string,
  isPositive: boolean
) {
  if (voterId === targetId) {
    return { success: false, error: 'No puedes votarte a ti mismo' }
  }

  const { data: existing } = await supabase
    .from('votes')
    .select('id, is_positive')
    .eq('voter_id', voterId)
    .eq('target_id', targetId)
    .maybeSingle()

  if (existing) {
    if (existing.is_positive === isPositive) {
      const { error } = await supabase.from('votes').delete().eq('id', existing.id)
      if (error) return { success: false, error: error.message }
      captureEvent('vote_removed', { target_id: targetId })
      return { success: true }
    }
    const { error } = await supabase
      .from('votes')
      .update({ is_positive: isPositive })
      .eq('id', existing.id)
    if (error) return { success: false, error: error.message }
    captureEvent('vote_changed', { target_id: targetId, is_positive: isPositive })
    return { success: true }
  }

  const { error } = await supabase.from('votes').insert({
    voter_id: voterId,
    target_id: targetId,
    is_positive: isPositive,
  })
  if (error) return { success: false, error: error.message }
  captureEvent('vote_cast', { target_id: targetId, is_positive: isPositive })
  return { success: true }
}

export async function getMyVote(voterId: string, targetId: string) {
  const { data } = await supabase
    .from('votes')
    .select('is_positive')
    .eq('voter_id', voterId)
    .eq('target_id', targetId)
    .maybeSingle()
  return data?.is_positive ?? null
}

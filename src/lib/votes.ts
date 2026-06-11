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

  // Convertimos el booleano a 1 o -1 para que coincida con tu BD
  const voteType = isPositive ? 1 : -1

  // 1. Buscamos si ya existe el voto
  const { data: existing } = await supabase
    .from('votes')
    .select('id, vote_type')
    .eq('voter_id', voterId)
    .eq('target_id', targetId)
    .maybeSingle()

  // 2. Si ya existe, decidimos si borrar o actualizar
  if (existing) {
    if (existing.vote_type === voteType) {
      // Es el mismo tipo de voto: el usuario quiere quitarlo
      const { error } = await supabase.from('votes').delete().eq('id', existing.id)
      if (error) return { success: false, error: error.message }
      captureEvent('vote_removed', { target_id: targetId })
      return { success: true }
    } else {
      // El usuario cambió de opinión: actualizamos el tipo
      const { error } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existing.id)
      if (error) return { success: false, error: error.message }
      captureEvent('vote_changed', { target_id: targetId, vote_type: voteType })
      return { success: true }
    }
  }

  // 3. Si no existe, creamos el voto nuevo
  const { error } = await supabase.from('votes').insert({
    voter_id: voterId,
    target_id: targetId,
    vote_type: voteType,
  })
  
  if (error) return { success: false, error: error.message }
  captureEvent('vote_cast', { target_id: targetId, vote_type: voteType })
  return { success: true }
}

export async function getMyVote(voterId: string, targetId: string) {
  const { data } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('voter_id', voterId)
    .eq('target_id', targetId)
    .maybeSingle()
    
  // Devolvemos null si no hay voto, true si es 1, false si es -1
  if (!data) return null
  return data.vote_type === 1
}
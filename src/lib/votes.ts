import { supabase } from './supabase'
import { captureEvent } from './posthog'

interface CastVoteParams {
  voterId: string;
  receiverId: string; // El usuario que se lleva el karma (creador del pulse/foto o dueño del perfil)
  isPositive: boolean;
  pulseId?: string | null;
  photoId?: string | null; // Mantenemos photoId en TS para el frontend
}

export async function castVote({
  voterId,
  receiverId,
  isPositive,
  pulseId = null,
  photoId = null
}: CastVoteParams) {
  if (voterId === receiverId) {
    return { success: false, error: 'No puedes votarte a ti mismo' }
  }

  const voteType = isPositive ? 1 : -1

  // 1. Construimos la query dinámica apuntando a 'posts_id' en la DB
  let query = supabase
    .from('votes')
    .select('id, vote_type')
    .eq('voter_id', voterId)
    .eq('receiver_id', receiverId)

  if (pulseId) {
    query = query.eq('pulse_id', pulseId)
  } else if (photoId) {
    query = query.eq('posts_id', photoId)
  } else {
    // Si no hay pulse ni foto, es un voto directo al perfil
    query = query.is('pulse_id', null).is('posts_id', null)
  }

  const { data: existing, error: fetchError } = await query.maybeSingle()
  if (fetchError) return { success: false, error: fetchError.message }

  // 2. CASO A: El voto ya existe
  if (existing) {
    if (existing.vote_type === voteType) {
      // El usuario pulsó el mismo botón => Quiere ELIMINAR su voto
      const { error } = await supabase.from('votes').delete().eq('id', existing.id)
      if (error) return { success: false, error: error.message }
      
      captureEvent('vote_removed', { target_type: pulseId ? 'pulse' : photoId ? 'post' : 'profile' })
      return { success: true, action: 'removed' }
    } else {
      // El usuario pulsó el botón contrario => Quiere CAMBIAR su voto
      const { error } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existing.id)
      if (error) return { success: false, error: error.message }
      
      captureEvent('vote_changed', { vote_type: voteType, target_type: pulseId ? 'pulse' : photoId ? 'post' : 'profile' })
      return { success: true, action: 'changed' }
    }
  }

  // 3. CASO B: Es un voto completamente NUEVO
  const { error } = await supabase.from('votes').insert({
    voter_id: voterId,
    receiver_id: receiverId,
    vote_type: voteType,
    pulse_id: pulseId,
    posts_id: photoId // Guardamos correctamente en la columna de la DB
  })

  if (error) return { success: false, error: error.message }
  
  captureEvent('vote_cast', { vote_type: voteType, target_type: pulseId ? 'pulse' : photoId ? 'post' : 'profile' })
  return { success: true, action: 'cast' }
}

/**
 * Obtiene el estado del voto del usuario para un elemento específico para pintarlo en la UI
 */
export async function getMyVote(
  voterId: string, 
  receiverId: string, 
  pulseId: string | null = null, 
  photoId: string | null = null
) {
  let query = supabase
    .from('votes')
    .select('vote_type')
    .eq('voter_id', voterId)
    .eq('receiver_id', receiverId)

  if (pulseId) {
    query = query.eq('pulse_id', pulseId)
  } else if (photoId) {
    query = query.eq('posts_id', photoId)
  } else {
    query = query.is('pulse_id', null).is('posts_id', null)
  }

  const { data } = await query.maybeSingle()
  if (!data) return null
  return data.vote_type === 1 // true si es positivo, false si es negativo
}

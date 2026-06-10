export interface PublicProfile {
  id: string
  username: string
  display_name: string
  karma_score: number
  votes_received_positive: number
  votes_received_negative: number
  created_at: string
}

export interface Photo {
  id: string
  user_id: string
  storage_path: string
  url: string
  created_at: string
}

export interface Story {
  id: string
  user_id: string
  storage_path: string
  url: string
  created_at: string
  expires_at: string
  profile?: PublicProfile
}

export interface VoteResult {
  success: boolean
  error?: string
}

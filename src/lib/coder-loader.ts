import 'server-only'
import { coderRepositories } from '@/data/coder-repositories'
import { createGithubRepositoryLoader } from './github-repositories'

// Nunca usar NEXT_PUBLIC_: el token y las peticiones quedan en el servidor.
const load = createGithubRepositoryLoader({ token: process.env.CODER_GITHUB_TOKEN })

export function loadCoderRepositories() {
  return load(coderRepositories)
}

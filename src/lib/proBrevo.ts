import { isValidEmailAddress } from './emailValidation'
import { ProError } from './proConfig'

export function proBrevoListId() {
  const value = process.env.BREVO_LIST_ID_WMLPRO?.trim()
  if (!value || !/^[1-9]\d*$/.test(value)) throw new ProError('pro_brevo_list_not_configured')
  const listId = Number(value)
  if (!Number.isSafeInteger(listId)) throw new ProError('pro_brevo_list_not_configured')
  return listId
}

export async function addPaidProEmailToBrevo(email: string, listId: number) {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  if (!apiKey || !isValidEmailAddress(email)) throw new ProError('pro_brevo_not_configured')

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
  })
  if (!response.ok) throw new ProError('pro_brevo_list_failed')
}

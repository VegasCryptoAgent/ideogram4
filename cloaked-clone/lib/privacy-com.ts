const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.privacy.com/v1'
    : 'https://sandbox.privacy.com/v1'

async function privacyFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const apiKey = process.env.PRIVACY_COM_API_KEY
  if (!apiKey) throw new Error('PRIVACY_COM_API_KEY not configured')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `api-key ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Privacy.com ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

export interface PrivacyCard {
  token: string
  last_four: string
  hostname?: string | null
  memo?: string
  type: 'SINGLE_USE' | 'MERCHANT_LOCKED' | 'UNLOCKED'
  state: 'OPEN' | 'PAUSED' | 'CLOSED'
  spend_limit: number
  spend_limit_duration: 'TRANSACTION' | 'MONTHLY' | 'ANNUALLY' | 'FOREVER'
  exp_month: string
  exp_year: string
  pan?: string
  cvv?: string
}

export interface PrivacyTransaction {
  token: string
  card_token: string
  merchant: { descriptor: string; city?: string }
  amount: number
  status: 'PENDING' | 'VOIDED' | 'SETTLING' | 'SETTLED' | 'BOUNCED'
  result: 'APPROVED' | 'DECLINED'
  created: string
}

export async function listCards(): Promise<{ data: PrivacyCard[] }> {
  return privacyFetch<{ data: PrivacyCard[] }>('/card')
}

export async function getCard(token: string): Promise<PrivacyCard> {
  return privacyFetch<PrivacyCard>(`/card/${token}`)
}

export async function createCard(params: {
  memo: string
  type: 'SINGLE_USE' | 'MERCHANT_LOCKED' | 'UNLOCKED'
  spend_limit?: number
  spend_limit_duration?: 'TRANSACTION' | 'MONTHLY' | 'ANNUALLY' | 'FOREVER'
  hostname?: string
}): Promise<PrivacyCard> {
  return privacyFetch<PrivacyCard>('/card', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function updateCard(
  token: string,
  params: {
    state?: 'OPEN' | 'PAUSED' | 'CLOSED'
    memo?: string
    spend_limit?: number
    spend_limit_duration?: string
  },
): Promise<PrivacyCard> {
  return privacyFetch<PrivacyCard>(`/card/${token}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  })
}

export async function listTransactions(cardToken: string): Promise<{ data: PrivacyTransaction[] }> {
  return privacyFetch<{ data: PrivacyTransaction[] }>(
    `/transaction?card_token=${cardToken}`,
  )
}

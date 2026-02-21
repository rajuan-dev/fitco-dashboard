import { getToken } from './auth'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000)
const API_USE_MOCKS_ON_ERROR = String(import.meta.env.VITE_API_USE_MOCKS_ON_ERROR || 'false').toLowerCase() === 'true'

export class ApiError extends Error {
  constructor(message, { status = 0, url = '', payload = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.url = url
    this.payload = payload
  }
}

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

async function parseJsonSafe(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export function hasLiveApi() {
  return Boolean(API_BASE_URL)
}

export function shouldUseFallbackOnError() {
  return API_USE_MOCKS_ON_ERROR
}

export async function request(path, { method = 'GET', body, headers } = {}) {
  if (!hasLiveApi()) {
    throw new ApiError('Live API base URL is not configured.', { url: path })
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  const token = getToken()

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const payload = await parseJsonSafe(response)
    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}.`, {
        status: response.status,
        payload,
        url: buildUrl(path),
      })
    }

    return payload
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError(`Request timeout after ${API_TIMEOUT_MS}ms.`, { url: buildUrl(path) })
    }
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error.message || 'Network request failed.', { url: buildUrl(path) })
  } finally {
    window.clearTimeout(timeoutId)
  }
}


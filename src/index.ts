export interface ValidationResult { valid: boolean; sanitized?: string; reason?: string }
export interface InjectionCheckResult { isInjection: boolean; detected: boolean; pattern?: string }
export interface AiOutputItem { word: string; phonetic?: string; pos?: string; translation: string; example?: string; exampleTranslation?: string }
export interface AiOutput { results: AiOutputItem[] }

export const MAX_INPUT_LENGTH = 2000
export const MAX_TRANSLATE_LENGTH = 8000

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|above|your|the\s+following)?\s*(instructions|rules|guidelines|prompts|orders|directives)/i,
  /disregard\s+(all\s+)?(previous|your|the\s+following)?\s*(instructions|rules|guidelines|prompts)/i,
  /forget\s+(everything|all\s+(your|previous)|your\s+instructions|your\s+rules)/i,
  /(act|behave|pretend|roleplay)\s+as\s+(if\s+you\s+are|a\s+new\s+)/i,
  /you\s+are\s+(now\s+)?(no\s+longer|not)\s+(a\s+)?(translator|translation\s+assistant)/i,
  /override\s+(system|your|previous|existing)\s+(instructions|rules|prompt|behavior)/i,
  /new\s+(system|set\s+of)\s+(instructions|rules|prompt|guidelines)\s*:/i,
  /你(是|变成|充当|扮演|作为|现在|假装)\s*(一只?|一个?)?\s*(角色|猫|狗|女仆|老师|医生|机器人|公主|女王)/i,
]
const SENTINEL_PATTERNS = [/<\|(system|user|assistant)\|>/gi, /<\|endoftext\|>/gi, /<<SYS>>[\s\S]*?<<\/SYS>>/gi, /<\[INST\]/gi, /\[\/INST\]/gi, /<s>[\s\S]*?<\/s>/gi, /{{SYSTEM}}[\s\S]*?{{\/SYSTEM}}/gi]

export function sanitizeInput(input: string, maxLength = MAX_INPUT_LENGTH): string {
  if (typeof input !== 'string') return ''
  let result = input
  for (const pattern of SENTINEL_PATTERNS) result = result.replace(pattern, '')
  return result.substring(0, maxLength)
}

export function escapePromptInput(input: string): string {
  if (typeof input !== 'string') return ''
  return input.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\n\r\t]/g, ' ')
}

export function validateInput(input: string, maxLength = MAX_INPUT_LENGTH): ValidationResult {
  if (!input || typeof input !== 'string') return { valid: false, reason: 'Input is required' }
  const trimmed = input.trim()
  if (!trimmed) return { valid: false, reason: 'Input cannot be empty' }
  if (trimmed.length > maxLength) return { valid: false, reason: `Input exceeds maximum length (${maxLength} characters)` }
  return { valid: true, sanitized: sanitizeInput(trimmed, maxLength) }
}

export function validateTranslateInput(input: string): ValidationResult { return validateInput(input, MAX_TRANSLATE_LENGTH) }
export function sanitizeWordList(words: string[]): string[] { return Array.isArray(words) ? words.map((w) => sanitizeInput(w)).filter((w) => w.length > 0 && w.length <= 500).slice(0, 100) : [] }
export function escapeWordListForPrompt(words: string[]): string { return words.map(escapePromptInput).map((w) => `"${w}"`).join(', ') }

export function detectPromptInjection(input: string): InjectionCheckResult {
  const text = String(input ?? '')
  for (const pattern of INJECTION_PATTERNS) if (pattern.test(text)) return { isInjection: true, detected: true, pattern: pattern.source.substring(0, 60) }
  const lower = text.toLowerCase()
  if (lower.includes('翻译') && ['语气', '口吻', '风格', '方式'].some((x) => lower.includes(x))) return { isInjection: true, detected: true, pattern: 'translate_with_style' }
  if (lower.includes('you are') && (lower.includes('role') || lower.includes('identity'))) return { isInjection: true, detected: true, pattern: 'role_identity' }
  return { isInjection: false, detected: false }
}
export function detectBatchPromptInjection(inputs: string[]): InjectionCheckResult { return detectPromptInjection(inputs.join(' | ')) }

export function validateAiOutput(output: unknown): { valid: boolean; data?: AiOutput } {
  if (!output || typeof output !== 'object' || !Array.isArray((output as { results?: unknown }).results)) return { valid: false }
  const results = (output as { results: unknown[] }).results
  for (const item of results) {
    if (!item || typeof item !== 'object') return { valid: false }
    const value = item as Record<string, unknown>
    if (typeof value.word !== 'string' || !value.word || typeof value.translation !== 'string') return { valid: false }
    if (SENTINEL_PATTERNS.some((pattern) => pattern.test(value.translation as string) || (typeof value.example === 'string' && pattern.test(value.example)))) return { valid: false }
  }
  return { valid: true, data: output as AiOutput }
}

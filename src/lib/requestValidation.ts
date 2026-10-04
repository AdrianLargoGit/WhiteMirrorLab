/** Validate JSON at the HTTP boundary; TypeScript types do not validate requests. */
export function validateJsonFields(
  value: unknown,
  fields: { strings?: readonly string[]; numbers?: readonly string[]; stringArrays?: readonly string[] },
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Expected a JSON object')
  }
  const record = value as Record<string, unknown>
  for (const key of fields.strings ?? []) {
    if (record[key] != null && typeof record[key] !== 'string') throw new Error(`Invalid ${key}`)
  }
  for (const key of fields.numbers ?? []) {
    if (record[key] != null && (typeof record[key] !== 'number' || !Number.isFinite(record[key]))) {
      throw new Error(`Invalid ${key}`)
    }
  }
  for (const key of fields.stringArrays ?? []) {
    const items = record[key]
    if (items != null && (!Array.isArray(items) || items.some(item => typeof item !== 'string'))) {
      throw new Error(`Invalid ${key}`)
    }
  }
}

// Storage can be disabled by browser settings or run out of quota. Neither
// condition should prevent the rest of the application from working.
export const browserStorage = {
  getItem(key: string): string | null {
    try { return window.localStorage.getItem(key) } catch { return null }
  },
  setItem(key: string, value: string): void {
    try { window.localStorage.setItem(key, value) } catch { /* Optional persistence. */ }
  },
  removeItem(key: string): void {
    try { window.localStorage.removeItem(key) } catch { /* Optional persistence. */ }
  },
}

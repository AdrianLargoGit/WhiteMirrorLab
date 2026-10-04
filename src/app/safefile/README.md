# SafeFile

## Modes

- **Portable encrypted (default):** downloads `safefile-portable.html`, containing the encrypted container and a self-contained unlock screen. Open it from Downloads in a compatible, updated browser and enter the password to download the exact original. It works offline, requires no SafeFile installation, contains no plaintext password or original metadata, and encrypts the original bytes, filename and MIME type locally (up to 30 MiB). Its content security policy prohibits network connections and allows only the embedded runtime by its SHA-256 hash. Opening the HTML requires a browser that supports Web Crypto in local files. There is no separate encrypted container export or import UI. Locking again revokes the temporary decrypted download link; an original already saved to disk is a separate, unencrypted copy.
- **antiIA / Anti-AI:** accepts PDFs (up to 20 pages) and supported raster images. Pages are rasterized with a maximum edge of 1800 pixels. Selected redactions are painted as opaque black pixels before export. PDFs embed only the resulting PNGs, with no original file or text layer. Unredacted content remains readable by OCR and vision models. There is no filter intensity selector or noise/moiré processing. The mode name refers to redaction, not a guarantee of making visible content unreadable to AI.

## Cryptographic format v1

| Offset | Bytes | Meaning |
| --- | --- | --- |
| 0 | 8 | ASCII `SAFEFIL` followed by version byte `1` |
| 8 | 16 | Random PBKDF2 salt |
| 24 | 12 | Random AES-GCM IV |
| 36 | remaining | Ciphertext including the 16-byte authentication tag |

The whole 36-byte header is AES-GCM additional authenticated data. The encrypted payload is a four-byte, big-endian metadata length, UTF-8 JSON `{name, type}`, then the original bytes. Metadata is capped at 4096 bytes. The KDF is fixed by version: PBKDF2-HMAC-SHA256, 600,000 iterations, deriving a non-extractable AES-256-GCM key. Each encryption creates fresh salt and IV using Web Crypto's CSPRNG. The password is used exactly as typed, without Unicode normalization.

Encryption requires 12–1024 characters and matching confirmation. Numbers and symbols are optional; blank passwords are rejected. Field feedback and submission errors explain the specific missing or invalid value. Decryption accepts the exact password without applying new password creation rules. The generator produces 192 random bits encoded as 48 hexadecimal characters. Length alone does not establish password strength. Offline guessing is possible against a weak password. Keep a long unique passphrase or the generated secret, and deliver it separately from the encrypted file. There is no password recovery or escrow. Passwords are held only in the current page state.

This format is a local tool format, not password-protected PDF or ZIP. An AI can still recognize the container and estimate content size. Confidentiality applies only while the key remains secret: sharing a decrypted copy or screenshot reveals visible content. The tests verify implementation behavior and interoperability, not a universal security guarantee or an external audit.

## Verification

Run `npm run test:safefile`. Tests cover exact recovery, independent Node crypto interoperability, nonce/salt freshness, wrong passwords, tampered files, malformed headers, size limits, empty files, Unicode and each password validation reason. The portable test executes the emitted offline runtime, verifies its CSP hash and embedded ciphertext, rejects wrong passwords, restores the exact original, clears the password, revokes the unlocked link and verifies that no `.safe` export remains. The visible export test checks that redacted pixels remain black after PDF rasterization and there is no searchable text layer.

References: [Web Crypto deriveKey](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey), [OWASP cryptographic storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html), [OWASP PBKDF2 parameters](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2).

## Download wait and advertising

Both website exports show a modal for at least five seconds of visible-tab time, then download only when processing has also completed. The dialog cannot be dismissed with Escape or a backdrop click. Reloading drops in-memory inputs and pending output. Advertising uses the existing Adsterra placement inside an opaque-origin sandboxed iframe without access to document/password state. Ad delivery failures do not prevent completion after the wait. The offline portable document contains no advertising or wait.

## Research limitation

Universal visible anti-AI protection and camera/screenshot blocking have not been achieved. There is no functional camera-protection toggle. Black redactions remove the selected pixels from exported copies; unredacted content remains readable. See [Fooling OCR Systems with Adversarial Text Images](https://arxiv.org/abs/1802.05385) for model-specific attacks, not a universal camera guarantee.

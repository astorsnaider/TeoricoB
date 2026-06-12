# web-public — ficheros a hostear en `teoric.app`

Estos ficheros hacen que el enlace `https://teoric.app/u/<username>` (el que
codifica el QR de amigos) abra la app si está instalada y, si no, lleve a la
store. Hasta que `teoric.app` esté hosteado, el QR funciona igual con el
**escáner propio** de la app (que lee el username del QR sin depender de que el
enlace "funcione") y con el esquema `teoric://`.

## Qué desplegar y dónde

Hostear en la raíz del dominio `teoric.app` (HTTPS, sin redirecciones):

| Fichero | URL pública | Para qué |
|---|---|---|
| `.well-known/apple-app-site-association` | `https://teoric.app/.well-known/apple-app-site-association` | Universal Links iOS. **Sin extensión .json** y servido como `application/json`. |
| `.well-known/assetlinks.json` | `https://teoric.app/.well-known/assetlinks.json` | App Links Android (autoVerify). |
| `u/index.html` | `https://teoric.app/u/<cualquier-cosa>` | Página de fallback que abre la app o lleva a la store. |

## Placeholders a rellenar antes de desplegar

1. **`apple-app-site-association`** → `REEMPLAZA_APPLE_TEAM_ID` por el Team ID de
   tu cuenta Apple Developer (10 caracteres, p.ej. `A1B2C3D4E5`). Queda
   `A1B2C3D4E5.com.astorsnaider.teoric`.
2. **`assetlinks.json`** → `REEMPLAZA_SHA256...` por el fingerprint SHA256 del
   certificado de firma Android. Con EAS: `eas credentials` → Android → ver el
   SHA-256, o desde Play Console → App integrity.
3. **`u/index.html`** → `idREEMPLAZA_APP_ID` por el ID numérico de App Store
   cuando publiques.

## Activación

- iOS: requiere `associatedDomains: ["applinks:teoric.app"]` (ya en `app.json`)
  y un build nuevo con entitlement de Associated Domains (Apple Developer).
- Android: requiere los `intentFilters` con `autoVerify` (ya en `app.json`) y
  que `assetlinks.json` esté accesible para que Google verifique el dominio.

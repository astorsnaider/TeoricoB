# EAS Build — guía paso a paso

EAS (Expo Application Services) es el sistema oficial de Expo para
compilar tu app en la nube y subirla a App Store / Play Store sin
necesitar Xcode ni un Mac.

Este documento es operativo: cubre exactamente qué tienes que hacer
para llegar desde "tengo el código en GitHub" hasta "mi app está en
TestFlight y en la pista interna de Google Play".

## Inventario de lo que YA está hecho

- ✅ `app.json` con bundleIds (`com.astorsnaider.teoric`), versión `0.6.0`,
  build numbers e iconos.
- ✅ `eas.json` con tres perfiles: `development`, `preview`, `production`.
- ✅ Scripts npm shortcut: `npm run eas:dev:ios`, `eas:preview:android`,
  etc. (ver `package.json`).

## Inventario de lo que TE FALTA hacer

| Trámite | Coste | Tiempo | Bloquea |
|---|---|---|---|
| Cuenta Expo (free) | 0 € | 2 min | Cualquier build |
| Cuenta Apple Developer Program | 99 €/año + DUNS | 2-4 semanas | Builds iOS para tienda |
| Cuenta Google Play Console | 25 € una vez | horas | Builds Android para tienda |
| Dominio (opcional pero recomendado) | 10-30 €/año | inmediato | SMTP propio, marca |

---

## 1. Cuenta Expo (gratis, 2 min)

1. Ve a https://expo.dev y regístrate con tu email (o GitHub).
2. Confirma el email.
3. Anota tu nombre de usuario — lo necesitarás para vincular el proyecto.

## 2. Vincular el proyecto a tu cuenta Expo (1 vez, 1 min)

Desde la raíz de `TeoricoB-expo/`:

```bash
npx eas-cli login        # te pide tu email/password de expo.dev
npx eas-cli whoami       # confirma que estás logueado
npx eas-cli init         # crea un projectId y lo añade a app.json
```

`eas init` añade automáticamente al `app.json` un bloque así:

```json
"extra": {
  "eas": {
    "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**Commitea ese cambio** — el projectId no es secreto, va al repo.

## 3. Primera build de desarrollo (5 min + 10-15 min de build)

La build de **development** te da una versión instalable en simulador
iOS / emulador Android con dev tools. NO necesita cuenta Apple Developer
todavía: corre en simulador.

### iOS (simulator, gratis sin cuenta Apple)

```bash
npm run eas:dev:ios
```

EAS te preguntará si quieres credenciales — para simulator dile que NO.
Cuando termine (10-15 min en cola gratuita), descargas un `.tar.gz` que
contiene un `.app`. Arrástralo al simulador iOS abierto y listo.

### Android (APK)

```bash
npm run eas:dev:android
```

Cuando termine, EAS te da un link al `.apk`. Descárgalo y arrástralo a
un emulador Android o instálalo en un móvil real con USB debugging.

> 💡 **Cola gratuita**: la primera build a veces tarda 20-30 min porque
> está en cola. Las siguientes suelen tardar 8-15 min. Si quieres más
> velocidad o builds en paralelo, EAS tiene plan **Production** desde
> 19 $/mes — pero NO lo necesitas para empezar.

## 4. Cuenta Apple Developer (99 €/año, **trámite paralelo importante**)

Mientras pruebas las builds de desarrollo, abre esto YA porque tarda.

1. Necesitas un **número DUNS** (gratis pero tarda 5-14 días):
   https://developer.apple.com/enroll/duns-lookup/
2. Da de alta tu cuenta como **persona física** (más simple que como
   empresa, no requiere CIF/sociedad):
   https://developer.apple.com/programs/enroll/
3. Apple cobra los 99 €/año al confirmar.
4. Aprobación: entre 24-48h tras confirmar pago si todo está OK; hasta
   3-4 semanas si te piden verificación adicional.

Mientras esperas, dile a Apple que asocien tu Apple ID a la organización
de desarrollador. Apunta tu **Apple Team ID** (lo verás en el portal,
es un código de 10 caracteres).

## 5. Cuenta Google Play Console (25 € una vez)

1. Ve a https://play.google.com/console/signup
2. Acepta términos y paga los 25 € (one-time).
3. Aprobación: típicamente en horas.

## 6. Build de preview (interno TestFlight / Internal Track) — necesita cuentas Apple/Google

Una vez tengas Apple Developer activo:

```bash
npm run eas:preview:ios
```

EAS te preguntará por credenciales iOS. Lo más cómodo:

- "**Generate new keys**" → EAS gestiona los certificados y provisioning
  profiles por ti. Se quedan guardados en tu cuenta Expo.
- Tu Apple ID + contraseña + (si tienes 2FA) un app-specific password
  desde https://appleid.apple.com → Sign-In and Security → App-Specific
  Passwords.

Para Android:

```bash
npm run eas:preview:android
```

EAS te pedirá si quieres que él genere la keystore. Dile que **SÍ** —
así no tienes que custodiarla tú; queda en tu cuenta Expo.

## 7. Distribuir a beta testers

### iOS — TestFlight

```bash
npm run eas:submit:ios -- --latest
```

EAS sube la última build production a App Store Connect, que la procesa
en 10-15 min y aparece como disponible en **TestFlight**. Desde
**App Store Connect → My Apps → TestFlight** invitas a beta testers
por email.

### Android — Internal Track

```bash
npm run eas:submit:android -- --latest --track internal
```

EAS sube a Google Play Console pista interna. Allí añades testers por
email o un link de opt-in. Aprobación de Google: minutos.

## 8. Build de producción (lanzamiento real)

Cuando hayas validado con beta testers:

```bash
npm run eas:prod:ios
npm run eas:prod:android
```

Y luego:

```bash
npm run eas:submit:ios
npm run eas:submit:android
```

Estos `submit` envían a revisión a App Store / Google Play. Apple suele
revisar en **24-48h**; Google en **horas-1 día**. Si rechazan, EAS te
muestra el motivo y tú haces el cambio + nueva build + nuevo submit.

---

## Secretos y variables de entorno

EAS soporta **secretos de proyecto** que se inyectan al build:

```bash
npx eas-cli secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
npx eas-cli secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
```

Estos se ven en builds remotas pero **NO** en builds locales (que siguen
leyendo `.env.local`). Para que `eas build` los lea, asegúrate de
configurarlos al menos una vez. La anon key NO es sensible (vive en
clientes públicos), pero los secretos REALES (Stripe, etc. cuando los
metamos) sí.

## Coste real estimado para llegar a tiendas

| Item | Coste primer año |
|---|---|
| Cuenta Apple Developer | 99 € |
| Cuenta Google Play | 25 € (one-time) |
| EAS Build (cola gratis suficiente para MVP) | 0 € |
| Dominio `teoric.app` o similar | 10-30 € |
| **Total mínimo viable** | **~140 €** |

Plus opcionales: SMTP de pago si superas free tier (~5-20 €/mes),
revisión legal por abogado (~300-800 €).

---

## Troubleshooting típico

- **"Project is not configured"** → te falta `npx eas-cli init`.
- **"You are not logged in"** → `npx eas-cli login`.
- **"Apple credentials missing"** → tu cuenta Apple Developer aún no
  está aprobada, o no la has asociado: vuelve a `eas build --platform
  ios` y deja que EAS te guíe interactivamente.
- **Build falla con "Native module X not linked"** → un paquete necesita
  `expo prebuild` o configurar el plugin en `app.json`. Compárteme el
  log y lo corrijo.
- **"App icon must be 1024x1024 without alpha"** → el icono actual ya
  cumple. Si en algún momento lo cambias, asegúrate de que el PNG es
  exactamente 1024×1024 sin canal alfa.

---

## Próximos pasos para ti

1. Crear cuenta Expo y hacer `npx eas-cli login` + `npx eas-cli init`
   (5 min).
2. Confirmar `app.json` con el projectId nuevo y commitearlo.
3. Iniciar trámites Apple Developer + Google Play (paralelos).
4. Cuando tengas la primera build de desarrollo, dímelo y seguimos.

# Setup de Supabase — guía paso a paso

Esta guía te lleva desde "no tengo cuenta Supabase" hasta "el cliente Expo se conecta y sincroniza progreso multi-dispositivo". Tiempo estimado: **20-30 min**.

## 1. Crear cuenta + proyecto (5 min)

1. Entra en **https://supabase.com** → "Start your project" → registra con GitHub o email (recomendado GitHub).
2. **Create a new project**:
   - Organization: la que se cree por defecto.
   - Project name: `Teoric`.
   - Database password: genera una fuerte (Supabase tiene generador) → **GUÁRDALA en tu gestor de contraseñas**, no la verás más en claro.
   - Region: **West EU (London / Frankfurt)** — más cerca = más rápido para usuarios españoles.
   - Pricing plan: **Free**.
3. Espera 2-3 min mientras Supabase aprovisiona el proyecto.

## 2. Aplicar el esquema BD (3 min)

1. En el dashboard de tu proyecto, panel izquierdo → **SQL Editor**.
2. Click en **+ New query**.
3. Abre el archivo `Teoric-expo/supabase/schema.sql` de este repo, copia su contenido entero.
4. Pega en el editor SQL de Supabase → **RUN** (botón verde arriba a la derecha).
5. Si todo va bien: "Success. No rows returned".
6. Verifica que las tablas están: panel izquierdo → **Table Editor** → deberías ver: `profiles`, `user_progress`, `mistakes`, `exam_history`, `friendships`, `autoescuelas`, `autoescuela_members`, `rewards_catalog`, `redemptions`.

## 3. Obtener las credenciales (1 min)

1. Panel izquierdo → **Project Settings** (icono de engranaje al final) → **API**.
2. Copia:
   - **Project URL** → algo como `https://xxxxxxxxxxxxxxxx.supabase.co`
   - **anon / public key** (la primera de "Project API keys") → empieza por `eyJ...` y es muy larga
3. **NO copies la `service_role` key.** Esa es de admin y va solo en backend (panel autoescuelas), nunca en la app.

## 4. Configurar en el proyecto Expo (1 min)

Crea un archivo `.env.local` en `Teoric-expo/` (junto a `package.json`, NO en git, ya está en `.gitignore`):

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...
```

Reinicia Expo (`npx expo start --clear`) para que cargue las variables.

> **Por qué `EXPO_PUBLIC_*`**: Expo solo expone variables con ese prefijo al cliente. La anon key está pensada para ser pública (protegida por Row Level Security en Postgres).

## 5. Configurar providers de auth (10 min)

### a) Email + magic link (recomendado activar primero)

1. Panel izquierdo → **Authentication** → **Providers** → **Email**.
2. **Enable Email provider**: ON.
3. Confirma email: déjalo en ON (más seguro). Para testing puedes ponerlo en OFF temporalmente.

### b) Google Sign-In

1. Necesitas un Google Cloud OAuth client. En **https://console.cloud.google.com** → crea proyecto → APIs & Services → Credentials → Create OAuth client ID → tipo "Web application".
2. Authorized redirect URIs: añade el que Supabase te indica (en Providers → Google).
3. Copia client_id + client_secret a Supabase.

### c) Apple Sign-In

1. Requiere cuenta Apple Developer ($99/año). Si aún no la tienes, salta esto por ahora.
2. Cuando la tengas: en [developer.apple.com](https://developer.apple.com), **Certificates, Identifiers & Profiles** → crea Sign in with Apple key + identifier.
3. Configura en Supabase Providers → Apple.

## 6. Auth Email Template (opcional pero importante) (3 min)

Authentication → **Email Templates** → personaliza:
- "Confirm signup" → cambia "Confirm your email" por algo como "Bienvenido a Teoric — confirma tu email".
- "Magic Link" → "Enlace para entrar en Teoric".

Esto es lo que verán los usuarios reales, ponle cariño.

## 7. Verificación end-to-end

Cuando el cliente Expo arranque con las env configuradas:

```
npx tsc --noEmit          # 0 errores
npx expo start --web      # debería arrancar sin warning de supabase
```

En la consola del navegador NO debería aparecer el warning `[supabase] EXPO_PUBLIC_SUPABASE_URL...`. Si aparece, las env no se cargaron.

## 8. Comandos útiles que vas a usar

| Acción | Dónde |
|---|---|
| Ver tablas como Excel | Table Editor |
| Ejecutar SQL ad-hoc | SQL Editor |
| Ver logs en vivo | Logs → API / Auth / Postgres |
| Ver políticas RLS | Authentication → Policies |
| Crear usuario de prueba manualmente | Authentication → Users → Invite user |
| Borrar/exportar datos | Table Editor → click derecho |

## 9. Coste y límites del free tier

- 50.000 usuarios activos mensuales (MAU)
- 500 MB BD Postgres
- 1 GB Storage (para comprobantes DGT futuros)
- 5 GB egress
- 2 GB cached egress

Suficiente hasta tener ~20-30k usuarios activos reales. Cuando lo superes, plan **Pro** son $25/mes con 100k MAU + 8 GB BD.

## 10. Backup / migración (cuando ya tengas datos reales)

- Supabase guarda backups diarios automáticos en plan Pro.
- En Free: puedes hacer `pg_dump` manual desde Settings → Database → Connection string.
- Para migrar a otro Postgres (Neon, Aurora, Railway): exportas con pg_dump, importas en destino. **Tu app no depende de Supabase**, solo del SQL estándar.

---

## Cuando termines

Mándame por chat:
1. **Project URL**: `https://xxxxxxxxxxxxxxxx.supabase.co`
2. **anon key**: `eyJh...` (entera)
3. Confirmación de que el esquema corrió OK.

Con eso puedo:
- Conectar el cliente real.
- Implementar el login screen.
- Conectar el store Zustand a la sync.
- Verificar que un usuario creado en Supabase aparece con perfil + progreso vacío automáticamente.

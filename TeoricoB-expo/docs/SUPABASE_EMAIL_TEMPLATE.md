# Personalizar los emails de Teoric en Supabase

El flow de auth usa **email + contraseña con verificación por código OTP de 6 dígitos**. Supabase envía dos tipos de email:

1. **Confirm signup** — al crear cuenta nueva (verificación de email).
2. **Reset password** — al pedir cambio de contraseña.

Ambos deben mostrar un **código de 6 dígitos** (no un link), porque los links a localhost no abren la app y porque el código funciona idéntico en web / iOS / Android.

Esta guía cubre los dos templates. **5-7 minutos en total**.

---

## 0. Antes de empezar

- Confirma que el dominio (`Authentication → URL Configuration → Site URL`) está como `https://teoric.app` o equivalente. Cuando registres el dominio real, lo cambias.
- Confirma que está activado **"Confirm email"** en `Authentication → Providers → Email → "Confirm email"` (ON). Si está OFF, Supabase no envía email de verificación y cualquiera puede crear cuenta sin demostrar que el email es suyo.

---

## 1. Template "Confirm signup" (3 min)

1. Entra al dashboard: https://supabase.com/dashboard/project/putsyjnzqqbptqrlcdrd
2. Panel izquierdo → **Authentication** → **Email Templates**.
3. Selecciona la plantilla **"Confirm signup"**.
4. Asunto:

```
Tu código de verificación Teoric: {{ .Token }}
```

5. Cuerpo HTML (reemplaza todo el contenido):

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Verifica tu email — Teoric</title>
</head>
<body style="margin:0;padding:0;background:#F2F2F7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1C1C1E;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F2F2F7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#E63946;padding:28px 24px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">Teoric</div>
              <div style="font-size:13px;color:#ffd9dc;margin-top:4px;">Tu app para aprobar el Teórico de la DGT</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 12px 28px;">
              <h1 style="font-size:20px;font-weight:700;margin:0 0 12px 0;color:#1C1C1E;">Confirma tu email</h1>
              <p style="font-size:15px;line-height:22px;margin:0 0 16px 0;color:#3C3C43;">
                Para activar tu cuenta, introduce este código en la app. Es válido durante <strong>1 hora</strong> y solo se puede usar una vez.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px 28px;text-align:center;">
              <div style="display:inline-block;background:#F2F2F7;border-radius:14px;padding:18px 28px;letter-spacing:14px;font-size:32px;font-weight:800;color:#1C1C1E;font-family:'SF Mono',Menlo,Monaco,Consolas,monospace;">
                {{ .Token }}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px 28px;">
              <p style="font-size:13px;line-height:20px;margin:0;color:#6D6D72;">
                Si no has creado una cuenta en Teoric, puedes ignorar este email. Nunca compartas este código con nadie.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFAFA;border-top:1px solid #E5E5EA;padding:18px 28px;text-align:center;">
              <p style="font-size:12px;line-height:18px;margin:0;color:#8E8E93;">
                Teoric · Preparación para el examen teórico del permiso B<br/>
                Material adaptado del catálogo oficial de la DGT
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

6. Pulsa **Save**.

---

## 2. Template "Reset password" (2 min)

1. En la misma pantalla de Email Templates, selecciona **"Reset password"**.
2. Asunto:

```
Tu código de recuperación Teoric: {{ .Token }}
```

3. Cuerpo HTML — es casi idéntico al de signup, solo cambia el texto. Pega esto:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Recupera tu cuenta — Teoric</title>
</head>
<body style="margin:0;padding:0;background:#F2F2F7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1C1C1E;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F2F2F7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#E63946;padding:28px 24px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">Teoric</div>
              <div style="font-size:13px;color:#ffd9dc;margin-top:4px;">Tu app para aprobar el Teórico de la DGT</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 12px 28px;">
              <h1 style="font-size:20px;font-weight:700;margin:0 0 12px 0;color:#1C1C1E;">Recupera tu cuenta</h1>
              <p style="font-size:15px;line-height:22px;margin:0 0 16px 0;color:#3C3C43;">
                Hemos recibido una solicitud para cambiar la contraseña de tu cuenta. Introduce este código en la app para continuar. Es válido durante <strong>1 hora</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px 28px;text-align:center;">
              <div style="display:inline-block;background:#F2F2F7;border-radius:14px;padding:18px 28px;letter-spacing:14px;font-size:32px;font-weight:800;color:#1C1C1E;font-family:'SF Mono',Menlo,Monaco,Consolas,monospace;">
                {{ .Token }}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px 28px;">
              <p style="font-size:13px;line-height:20px;margin:0;color:#6D6D72;">
                Si no has solicitado el cambio, ignora este email y tu contraseña seguirá siendo la misma. Nunca compartas este código.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFAFA;border-top:1px solid #E5E5EA;padding:18px 28px;text-align:center;">
              <p style="font-size:12px;line-height:18px;margin:0;color:#8E8E93;">
                Teoric · Preparación para el examen teórico del permiso B
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

4. Pulsa **Save**.

---

## 3. Subir el rate limit (importante para desarrollo)

Por defecto el plan free de Supabase limita el envío de emails a **~3 por hora** para todo el proyecto. Esto bloquea el desarrollo continuo.

Dos caminos:

### Opción A — Configurar SMTP propio (recomendado para producción)

Cuando tengas dominio `teoric.app`:
1. Crea cuenta gratis en **Resend** (https://resend.com) o **Brevo** (https://brevo.com).
2. Verifica el dominio (añadir 2-3 registros DNS).
3. En Supabase → **Project Settings** → **Authentication** → **SMTP Settings** → introduce credenciales SMTP.
4. Marca "Enable Custom SMTP" → Save.

Con SMTP propio el rate limit lo defines tú (300/día gratis en Brevo, 100/día en Resend).

### Opción B — Subir el rate limit interno (parche temporal)

1. **Authentication** → **Rate Limits**.
2. Sube "Rate limit for sending emails" al máximo permitido (por defecto 4/h, max en free tier limitado).
3. Save.

Esto no resuelve el problema definitivo pero da margen extra durante desarrollo.

---

## 4. (Opcional) Confirmar email automático en desarrollo

**Solo para acelerar pruebas locales**. NO lo dejes activado en producción.

1. **Authentication** → **Providers** → **Email**.
2. Desactiva **"Confirm email"**.
3. Save.

Con esto, al crear cuenta entras directamente sin verificar email. Cuando termines la fase de pruebas, **vuelve a activarlo**.

---

## Verificación

Tras aplicar los pasos 1, 2 y 3:

1. Abre la app, ve a Perfil → "Iniciar sesión o crear cuenta" → pestaña "Crear cuenta".
2. Introduce nombre, email, contraseña (≥8 caracteres) → "Crear cuenta".
3. Revisa tu correo. Asunto: `Tu código de verificación Teoric: 123456`.
4. El email debería tener el banner rojo Teoric y el código grande centrado.
5. Vuelve a la app, introduce el código → entras autenticado.
6. Prueba también el flow "¿Olvidaste tu contraseña?" para verificar el segundo email.

Si los emails siguen siendo los genéricos de Supabase, comprueba que pulsaste **Save** en cada plantilla.

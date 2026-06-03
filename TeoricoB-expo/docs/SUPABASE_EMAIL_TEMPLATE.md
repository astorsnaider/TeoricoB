# Personalizar el email de TeoricoB en Supabase

El flujo de login ahora usa **código OTP de 6 dígitos** (no magic link). Para que el email se vea profesional y muestre el código en lugar de un link a localhost, hay que tocar dos cosas en el dashboard de Supabase. **5 minutos en total.**

## 1. Cambiar el template del email (3 min)

1. Entra al dashboard: https://supabase.com/dashboard/project/putsyjnzqqbptqrlcdrd
2. Panel izquierdo → **Authentication** → **Email Templates**
3. Selecciona la plantilla **"Magic Link"** (es la que Supabase usa para el OTP también).
4. Cambia el asunto y el cuerpo:

### Asunto
```
Tu código de acceso a TeoricoB: {{ .Token }}
```

### Cuerpo HTML
Pega esto entero (reemplaza lo que haya):

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Tu código TeoricoB</title>
</head>
<body style="margin:0;padding:0;background:#F2F2F7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1C1C1E;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F2F2F7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#E63946;padding:28px 24px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">TeoricoB</div>
              <div style="font-size:13px;color:#ffd9dc;margin-top:4px;">Tu app para aprobar el Teórico de la DGT</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 12px 28px;">
              <h1 style="font-size:20px;font-weight:700;margin:0 0 12px 0;color:#1C1C1E;">Tu código de acceso</h1>
              <p style="font-size:15px;line-height:22px;margin:0 0 16px 0;color:#3C3C43;">
                Introduce este código en la app para iniciar sesión. Sirve durante <strong>1 hora</strong> y solo se puede usar una vez.
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
                Si no has solicitado este código, puedes ignorar este email. Nunca compartas este código con nadie.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFAFA;border-top:1px solid #E5E5EA;padding:18px 28px;text-align:center;">
              <p style="font-size:12px;line-height:18px;margin:0;color:#8E8E93;">
                TeoricoB · Preparación para el examen teórico del permiso B<br/>
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

5. Pulsa **Save**.

> **Clave**: la variable `{{ .Token }}` es lo que reemplaza Supabase por el código de 6 dígitos. Si pones `{{ .ConfirmationURL }}` te manda un link en su lugar.

## 2. Cambiar el "Site URL" (1 min)

Aunque ya no usamos magic link, conviene poner una URL razonable porque aparece en otros emails (recuperación de cuenta, cambio de email, etc.).

1. **Authentication** → **URL Configuration**
2. **Site URL**: pon `https://teoricob.es` (aunque todavía no exista el dominio, no pasa nada). Cuando registres el dominio real, cambia esto.
3. **Redirect URLs**: déjalo vacío de momento. Cuando publiquemos la app, añadiremos los deep links (`com.astorsnaider.teoricob://auth-callback`).
4. Guarda.

## 3. (Opcional, recomendado para producción) Branding del remitente

El email todavía sale como `noreply@mail.supabase.io`. Para producción conviene un dominio propio con SPF/DKIM, así no cae en spam:

1. Cuando tengas dominio `teoricob.es`, crea cuenta en **Resend** (https://resend.com) — gratis 3.000 emails/mes.
2. Verifica el dominio en Resend (añades 2-3 registros DNS).
3. En Supabase → **Authentication** → **SMTP Settings** → introduce las credenciales de Resend SMTP. A partir de ahí los emails salen como `noreply@teoricob.es`.

Esto **no es urgente** para desarrollo / beta. Lo dejamos para Fase 2.

---

## Verificación

Tras los pasos 1 y 2:

1. Abre la app (web o Expo Go).
2. Tab Perfil → "Guarda tu progreso" → introduce tu email → "Enviarme el código".
3. Revisa tu correo. Asunto debería ser: `Tu código de acceso a TeoricoB: 123456`.
4. El email debería tener el banner rojo con "TeoricoB" y el código grande en el centro.
5. Vuelve a la app, introduce el código → entras autenticado.

Si el email sigue siendo el genérico de Supabase, vuelve al paso 1 y comprueba que pulsaste **Save** en la plantilla "Magic Link" (no "Confirm signup").

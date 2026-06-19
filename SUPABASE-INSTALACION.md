# Activación de reservas Zoyen

1. Crear un proyecto gratuito en Supabase.
2. Abrir **SQL Editor**, pegar `supabase/schema.sql` y ejecutarlo.
3. En **Authentication > Users**, crear el usuario administrador con su email.
4. En el botón **Connect** del proyecto, copiar únicamente **Project URL** y **Publishable key** en `supabase-config.js`.
5. Colocar el mismo email del usuario administrador en `adminEmail`.
6. Subir `supabase-config.js` y `zoyen-reservas-api.js` junto con el sitio.

Nunca publicar una **Secret key**, `service_role`, claves de Resend ni el Access Token de Mercado Pago.

## Correos y pagos

La función de correo está preparada en `supabase/functions/reservation-email`. Para activarla se despliega como Edge Function y se configuran los secretos `RESEND_API_KEY`, `RESEND_FROM`, `BUSINESS_EMAIL`, `SITE_URL` y `WEBHOOK_SECRET`. Después se crea un Database Webhook para INSERT y UPDATE de `reservations`, enviando el encabezado `x-zoyen-secret`.

Mercado Pago se conectará después mediante Checkout Pro y webhook; el navegador nunca debe marcar un pago como aprobado por sí mismo. Para transferencias, el estado recomendado es `proof_received` hasta que una persona valide el comprobante en el admin.

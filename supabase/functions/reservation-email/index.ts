const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const BUSINESS_EMAIL = Deno.env.get('BUSINESS_EMAIL') || 'zoyenperitomoreno@gmail.com';
const RESEND_FROM = Deno.env.get('RESEND_FROM') || 'Zoyen Turismo <reservas@zoyenturismo.com>';
const SITE_URL = (Deno.env.get('SITE_URL') || 'https://www.zoyenturismo.com.ar').replace(/\/$/, '');
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || '';

function esc(value: unknown) {
  return String(value  '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c));
}
function money(value: unknown) {
  return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(Number(value)||0);
}
function statusLabel(record: Record<string, unknown>) {
  const payment: Record<string,string> = {pending:'Pendiente de pago',proof_received:'Comprobante recibido',approved:'Pago aprobado',rejected:'Pago rechazado',refunded:'Pago reintegrado'};
  return payment[String(record.payment_status)] || 'Reserva recibida';
}
function emailShell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f1ed;font-family:Arial,sans-serif;color:#211a14"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px"><table width="600" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden"><tr><td style="background:#1e1810;padding:22px;text-align:center"><img src="${SITE_URL}/assets/logo-zoyen-circular-static.png" width="76" height="76" alt="Zoyen Turismo" style="display:block;margin:auto;border-radius:50%"><div style="color:#fff;font-weight:700;letter-spacing:2px;margin-top:10px">ZOYEN <span style="color:#d4772a">TURISMO</span></div></td></tr><tr><td style="padding:30px"><h1 style="font-size:24px;margin:0 0 18px">${title}</h1>${body}<p style="font-size:12px;color:#756b62;margin-top:28px">Zoyen Turismo · Perito Moreno, Santa Cruz · +54 9 297 443-2855</p></td></tr></table></td></tr></table></body></html>`;
}
function detail(record: Record<string, unknown>) {
  return `<table width="100%" style="border-collapse:collapse;font-size:14px"><tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Experiencia</b></td><td style="padding:8px;border-bottom:1px solid #eee">${esc(record.tour_name)}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Fecha</b></td><td style="padding:8px;border-bottom:1px solid #eee">${esc(record.departure_date)}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Personas</b></td><td style="padding:8px;border-bottom:1px solid #eee">${esc(record.people_count)}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Asientos</b></td><td style="padding:8px;border-bottom:1px solid #eee">${esc((record.seats as unknown[] || []).join(', '))}</td></tr><tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Seña</b></td><td style="padding:8px;border-bottom:1px solid #eee">${money(record.deposit_amount)}</td></tr><tr><td style="padding:8px"><b>Estado</b></td><td style="padding:8px;color:#b8621e;font-weight:700">${statusLabel(record)}</td></tr></table>`;
}
async function send(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {method:'POST',headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:RESEND_FROM,to:[to],subject,html})});
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
}

Deno.serve(async request => {
  if (request.method !== 'POST') return new Response('Método no permitido',{status:405});
  if (!RESEND_API_KEY || !WEBHOOK_SECRET) return new Response('Faltan secretos del servidor',{status:500});
  if (request.headers.get('x-zoyen-secret') !== WEBHOOK_SECRET) return new Response('No autorizado',{status:401});
  try {
    const payload = await request.json();
    const record = payload.record || {};
    const old = payload.old_record || {};
    const isNew = payload.type === 'INSERT';
    const changed = isNew || record.status !== old.status || record.payment_status !== old.payment_status;
    if (!changed) return Response.json({ok:true,skipped:true});
    const code = String(record.id || '').slice(0,8).toUpperCase();
    const details = detail(record);
    await Promise.all([
      send(String(record.customer_email), `${isNew'Recibimos tu reserva':'Actualización de tu reserva'} · Zoyen Turismo`, emailShell(`Hola ${esc(record.customer_name)}`,`<p style="line-height:1.6">${isNew'Recibimos tu solicitud. La reserva quedará confirmada cuando se acredite la seña.':'El estado de tu reserva fue actualizado.'}</p>${details}<p><b>Código:</b> ${code}</p>`)),
      send(BUSINESS_EMAIL, `${isNew'Nueva reserva':'Reserva actualizada'} · ${esc(record.tour_name)}`, emailShell(`${isNew'Nueva reserva':'Cambio de estado'} #${code}`,`<p><b>Pasajero:</b> ${esc(record.customer_name)}<br><b>Email:</b> ${esc(record.customer_email)}<br><b>Teléfono:</b> ${esc(record.customer_phone)}</p>${details}`))
    ]);
    return Response.json({ok:true});
  } catch(error) { return Response.json({ok:false,error:String(error)},{status:500}); }
});

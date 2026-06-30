(function () {
  var cfg = window.ZOYEN_SUPABASE || {};
  var publicKey = cfg.publishableKey || cfg.anonKey || '';
  var ready = Boolean(cfg.url && publicKey && window.supabase && window.supabase.createClient);
  var client = ready ? window.supabase.createClient(cfg.url, publicKey) : null;

  function cleanText(value, max) { return String(value || '').trim().slice(0, max || 500); }
  function inferLeadType(data, isInquiry) {
    if (!isInquiry) return 'reservation';
    if (data.origen === 'zoyi') return 'zoyi_chat';
    if (data.excursionKey || data.excursion) return 'tour_inquiry';
    return 'general_inquiry';
  }
  function normalizeReservation(data) {
    var isInquiry = data.estado === 'consulta' || data.status === 'inquiry' || !data.fecha;
    var email = cleanText(data.email, 180).toLowerCase();
    return {
      customer_name: cleanText(data.nombre, 120),
      customer_phone: cleanText(data.tel, 60),
      customer_email: email || null,
      tour_key: cleanText(data.excursionKey, 80),
      tour_name: cleanText(data.excursion, 180),
      departure_date: data.fecha || null,
      people_count: Math.max(1, Math.min(30, parseInt(data.personas, 10) || 1)),
      seats: String(data.asientos || '').split(/[^0-9]+/).map(Number).filter(Boolean),
      deposit_amount: Math.max(0, Number(data.senia) || 0),
      status: isInquiry ? 'inquiry' : 'pending_payment',
      payment_method: 'not_selected',
      payment_status: 'pending',
      source: cleanText(data.origen || 'website', 40),
      lead_type: inferLeadType(data, isInquiry),
      inquiry_type: cleanText(data.tipoConsulta || data.inquiryType || inferLeadType(data, isInquiry), 80),
      admin_notes: cleanText(data.notas, 1000)
    };
  }
  async function createReservation(data) {
    if (!ready) return {ok:false, local:true};
    var row = normalizeReservation(data);
    if (!row.customer_name || !row.tour_name) throw new Error('Faltan datos obligatorios de la consulta.');
    if (row.status !== 'inquiry' && (!row.customer_email || !row.departure_date)) throw new Error('Faltan datos obligatorios de la reserva.');
    // El visitante puede crear una reserva, pero no debe poder leer filas de la base.
    // Por eso no encadenamos .select(): RLS permite INSERT anónimo y reserva SELECT al personal autenticado.
    var result = await client.from('reservations').insert(row);
    if (result.error) throw result.error;
    return {ok:true, data:null};
  }
  async function signIn(email, password) {
    if (!ready) return {ok:false, local:true};
    var result = await client.auth.signInWithPassword({email:email,password:password});
    if (result.error) throw result.error;
    return {ok:true,user:result.data.user};
  }
  async function signOut() { if (ready) await client.auth.signOut(); }
  async function listReservations() {
    if (!ready) return {ok:false,local:true,data:[]};
    var result = await client.from('reservations').select('*').order('created_at',{ascending:false}).limit(1000);
    if (result.error) throw result.error;
    return {ok:true,data:result.data || []};
  }
  async function updateReservation(id, changes) {
    if (!ready || !id) return {ok:false,local:true};
    var allowed = {};
    ['status','payment_status','payment_method','admin_notes','follow_up_at','lead_type','inquiry_type'].forEach(function(k){ if(changes[k] !== undefined) allowed[k]=changes[k]; });
    var result = await client.from('reservations').update(allowed).eq('id',id).select('*').single();
    if (result.error) throw result.error;
    return {ok:true,data:result.data};
  }
  async function getTourConfig() {
    if (!ready) return {ok:false,local:true,data:null};
    var result = await client.from('tour_config').select('config').eq('id','main').maybeSingle();
    if (result.error) throw result.error;
    return {ok:true,data:result.data && result.data.config ? result.data.config : null};
  }
  async function saveTourConfig(config) {
    if (!ready) return {ok:false,local:true};
    var result = await client.from('tour_config').upsert({id:'main',config:config || {},updated_at:new Date().toISOString()});
    if (result.error) throw result.error;
    return {ok:true};
  }
  window.ZoyenCloud = {ready:ready,client:client,createReservation:createReservation,signIn:signIn,signOut:signOut,listReservations:listReservations,updateReservation:updateReservation,getTourConfig:getTourConfig,saveTourConfig:saveTourConfig};
})();

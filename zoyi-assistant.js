
(function(){
  var widget = document.getElementById("zoyiWidget");
  if (!widget || widget.dataset.ready) return;
  widget.dataset.ready = "true";

  var toggle   = document.getElementById("zoyiToggle");
  var closeBtn = document.getElementById("zoyiClose");
  var form     = document.getElementById("zoyiForm");
  var input    = document.getElementById("zoyiInput");
  var messages = document.getElementById("zoyiMessages");
  var chips    = document.getElementById("zoyiChips");
  var waLink   = "https://wa.me/5492974432855";

  // -- Flujo guiado de consulta (lead) -------------------------------
  var consultationText = "Consultar las tarifas vigentes y disponibilidad vía WhatsApp: [[LINK:2974432855 (oficina)|https://wa.me/5492974432855]] · [[LINK:2976238811 (gerencia)|https://wa.me/5492976238811]].";
  var leadDraft = null; // {producto, personas, fecha, nombre, telefono, step}
  var LEAD_STEP = { PERSONAS:"personas", FECHA:"fecha", CONTACTO:"contacto", CONFIRMAR:"confirmar" };

  function getLang(){ return typeof currentLang !== 'undefined' ? currentLang : 'es'; }

  var UI = {
    es: {
      greeting: "Hola, soy Zoyi. Puedo responder sobre excursiones, tours, consulta de tarifas por WhatsApp, consulta de disponibilidad, cupos, ubicación e itinerarios. Solo te paso con una persona si me lo pedís.",
      fallback: "Preguntame por fechas, disponibilidad, precios, excursiones, tours, ubicación o reservas.",
      helpFull: "Puedo ayudarte con: fechas disponibles, consulta de tarifas por WhatsApp, cupos, excursiones, tours de autor, ubicación, itinerarios PDF y cómo reservar. Probá: 'precio de Capillas', 'fechas para Patagonia Inédita' o '?qué excursión me recomendás'.",
      humanAns: function(){ return consultationText; },
      datesAsk: "¿Sobre qué excursión o tour querés consultar fechas disponibles?",
      datesBase: "La disponibilidad se consulta según la experiencia elegida. En la página de cada experiencia encontrás duración, recorrido e inclusiones.",
      datesExtra: function(p){ return " Para " + p.name + ": " + p.duration + ". " + p.summary; },
      datesCta: " Si querés consultar, tocá Consultar, elegí experiencia, cantidad de personas y fecha tentativa.",
      pricesPer: " Precio en pesos argentinos AR por persona.",
      pricesAll: "Precios AR por persona: ",
      resAnswer: "Decime qué tour o excursión te interesa y te voy preguntando cantidad de personas y fecha tentativa. Al final armamos un resumen y seguimos por WhatsApp para confirmar precio, fecha y cupo.",
      locAnswer: "Zoyen Turismo est? en Perito Moreno, Santa Cruz, Patagonia Argentina. Salen excursiones a Cueva de las Manos, Parque Patagonia, Ruta 41, Lago Posadas y Carretera Austral.",
      compareAnswer: "Para poco tiempo: excursiones de día · Cueva de las Manos, Capillas de Mármol, Ruta 41, Lago Posadas o Parque Patagonia. Para viaje completo: Patagonia Inédita (5 días), Santa Cruz Inexplorada (8 días, sin aéreos incluidos) o Circuito Binacional Santa Cruz/Aysén (8 días). Arqueología: Cueva o Charcamata. Navegación: Capillas. Ruta escénica: Ruta 41 o Lago Posadas.",
      wellnessAnswer: "Tenemos una línea de Nuevas Experiencias con dos propuestas: Off Road 4x4 (salidas con tu propia camioneta por caminos alternativos) y Viajes con Sentido (retiros introspectivos de fin de semana o una semana, con terapias como Reiki, Grounding y Biodescodificación). Más info en nuevas-experiencias.html.",
      agencyAnswer: "Zoyen Turismo es una agencia local de Perito Moreno, Santa Cruz, legajo 15.625. Diseña excursiones y tours de autor en Patagonia.",
      pdfBase: "Los tours con PDF descargable son Patagonia Inédita y Circuito Binacional Santa Cruz/Aysén. En cada página hay un botón de descarga.",
      pdfProduct: function(p){ return "El itinerario PDF de " + p.name + " se descarga desde su página."; },
      listExc: "Excursiones de día o medio día disponibles: ",
      listTours: "Tours de autor disponibles: ", listToursSuffix: " Ambos tienen itinerario PDF descargable.",
      verMas: "Ver más",
      capacity: " personas",
      kw: { human:["persona","humano","asesor","hablar con alguien","whatsapp","teléfono","email","mail","contactar","contacto directo"], dates:["fecha","fechas","disponible","disponibilidad","cupos","cuando","calendario"], prices:["precio","precios","tarifa","tarifas","valor","valores","cuanto","sale","costo"], book:["reservar","reserva","reservas","seña","pago"], location:["ubicación","ubicación","dónde están","dirección","perito moreno","santa cruz","cómo llegar"], pdf:["itinerario","pdf","descargar","programa","recorrido"], excursion:["excursion","excursiones","paseos","salidas","día completo","medio día"], tour:["tour","tours","autor","varios días","viaje completo","paquete"], compare:["recomendas","recomendacion","conviene","diferencia","comparar","mejor","cual elijo"], wellness:["bienestar","wellness","yoga","masajes"], agency:["zoyen","agencia","legajo","quiénes son"] }
    },
    en: {
      greeting: "Hi, I\'m Zoyi. I can answer questions about excursions, tours, availability, rates via WhatsApp and itineraries. Just ask!",
      fallback: "Ask me about dates, availability, prices, excursions, tours or bookings.",
      helpFull: "I can help with: available dates, rates via WhatsApp, group sizes, excursions, author tours, location, PDF itineraries and how to book. Try: \'price of Capillas y Catedrales de Mármol\', \'dates for Patagonia Inédita\' or \'which excursion do you recommend\'.",
      humanAns: function(){ return consultationText; },
      datesAsk: "Which excursion or tour would you like to check availability for",
      datesBase: "Bookings allow you to choose any date from today onwards. Real availability is confirmed by date, excursion and group size.",
      datesExtra: function(p){ return " For " + p.name + " capacity is up to " + p.capacity + " people."; },
      datesCta: " To inquire, tap Book, choose your experience, group size and tentative date.",
      pricesPer: " Price in Argentine pesos (ARS) per person.",
      pricesAll: "Prices ARS per person: ",
      resAnswer: "Tell me which tour or excursion you're interested in and I'll ask for the number of people and a tentative date. We'll wrap up with a summary and continue with Zoyi to confirm price, date and availability.",
      locAnswer: "Zoyen Turismo is based in Perito Moreno, Santa Cruz, Argentine Patagonia. Excursions depart to Cave of Hands, Parque Nacional Patagonia, Ruta 41, Lake Posadas and Carretera Austral.",
      compareAnswer: "Short on time Day excursions: Cave of Hands, Marble Chapels and Cathedrals, Ruta 41, Lake Posadas or Parque Nacional Patagonia. Full trip: Unexplored Patagonia (5 days), Unexplored Santa Cruz (8 days, flights not included) or Binational Circuit Santa Cruz/Aysén (8 days). Archaeology: Cave of Hands or Charcamata. Navigation: Marble Chapels and Cathedrals. Scenic: Ruta 41 or Lake Posadas.",
      wellnessAnswer: "We have a New Experiences line with two proposals: Off Road 4x4 (guided outings with your own vehicle on alternative routes) and Journeys with Purpose (weekend or week-long introspective retreats, with therapies like Reiki, Grounding and Biodecoding). More info at nuevas-experiencias.html.",
      agencyAnswer: "Zoyen Turismo is a local agency from Perito Moreno, Santa Cruz, license 15.625. We design excursions and author tours in Patagonia.",
      pdfBase: "Downloadable PDF itineraries: Unexplored Patagonia and Binational Circuit Santa Cruz/Aysén. Each page has a download button.",
      pdfProduct: function(p){ return "The PDF itinerary for " + p.name + " can be downloaded from its page."; },
      listExc: "Available day and half-day excursions: ",
      listTours: "Available author tours: ", listToursSuffix: " Both have downloadable PDF itineraries.",
      verMas: "See more",
      capacity: " people",
      kw: { human:["person","human","agent","talk to someone","whatsapp","phone","email","contact"], dates:["date","dates","available","availability","spots","when","calendar"], prices:["price","prices","rate","cost","how much","fee"], book:["book","booking","reserve","reservation","payment","deposit"], location:["location","where","address","perito moreno","santa cruz","how to get"], pdf:["itinerary","pdf","download","program","route"], excursion:["excursion","excursions","day trip","half day"], tour:["tour","tours","author","multi-day","full trip","package"], compare:["recommend","best","difference","compare","which","what should"], wellness:["wellness","yoga","massage"], agency:["zoyen","agency","license","about"] }
    },
    pt: {
      greeting: "Ol?, sou Zoyi. Posso responder sobre excursões, tours, disponibilidade, tarifas pelo WhatsApp e itinerários. S? me pergunte!",
      fallback: "Me pergunte sobre datas, disponibilidade, preços, excursões, tours ou reservas.",
      helpFull: "Posso ajudar com: datas disponíveis, tarifas pelo WhatsApp, vagas, excursões, tours de autor, localização, itinerários PDF e como reservar.",
      humanAns: function(){ return consultationText; },
      datesAsk: "Sobre qual excursão ou tour você quer consultar disponibilidade",
      datesBase: "As reservas permitem escolher qualquer data a partir de hoje. Disponibilidade confirmada por data, excursão e vagas.",
      datesExtra: function(p){ return " Para " + p.name + " a capacidade ? de até " + p.capacity + " pessoas."; },
      datesCta: " Para consultar, toque em Reservar, escolha experiência, quantidade de pessoas e data tentativa.",
      pricesPer: " Preço em pesos argentinos (ARS) por pessoa.",
      pricesAll: "Preços ARS por pessoa: ",
      resAnswer: "Me diga qual tour ou excursão te interessa e vou perguntar a quantidade de pessoas e uma data tentativa. No final, fazemos um resumo e seguimos pelo WhatsApp para confirmar preço, data e disponibilidade.",
      locAnswer: "Zoyen Turismo fica em Perito Moreno, Santa Cruz, Patagônia Argentina. Excursões partem para Cueva de las Manos, Parque Patagônia, Rota 41, Lago Posadas e Carretera Austral.",
      compareAnswer: "Com pouco tempo, excursões de dia: Cueva de las Manos, Capelas de Mármore, Rota 41, Lago Posadas ou Parque Patagônia. Viagem completa: Patagônia Inédita (5 dias), Santa Cruz Inexplorada (8 dias, sem voos incluídos) ou Circuito Binacional Santa Cruz/Aysén (8 dias).",
      wellnessAnswer: "Temos uma linha de Novas Experiências com duas propostas: Off Road 4x4 (saídas com sua própria caminhonete por caminhos alternativos) e Viagens com Sentido (retiros introspectivos de fim de semana ou de uma semana, com terapias como Reiki, Grounding e Biodescodificação). Mais informa??es em nuevas-experiencias.html.",
      agencyAnswer: "Zoyen Turismo é uma agência local de Perito Moreno, Santa Cruz, licença 15.625. Projetamos excursões e tours de autor na Patagônia.",
      pdfBase: "Tours com PDF para download: Patagônia Inédita e Circuito Binacional Santa Cruz/Aysén. Cada página tem botão de download.",
      pdfProduct: function(p){ return "O PDF de " + p.name + " pode ser baixado na sua página."; },
      listExc: "Excursões de dia e meio dia disponíveis: ",
      listTours: "Tours de autor disponíveis: ", listToursSuffix: " Ambos têm itinerários PDF para download.",
      verMas: "Ver mais",
      capacity: " pessoas",
      kw: { human:["pessoa","humano","agente","falar com alguem","whatsapp","telefone","email","contato"], dates:["data","datas","disponivel","disponibilidade","vagas","quando","calendario"], prices:["preco","precos","tarifa","valor","quanto","custo"], book:["reservar","reserva","sinal","pagamento"], location:["localizacao","onde","endereco","perito moreno","santa cruz","como chegar"], pdf:["itinerario","pdf","baixar","programa"], excursion:["excursao","excursões","passeio","dia inteiro","meio dia"], tour:["tour","tours","autor","varios días","pacote"], compare:["recomenda","melhor","diferenca","comparar","qual"], wellness:["bem-estar","wellness","yoga","massagem"], agency:["zoyen","agencia","licenca","quem sao"] }
    },
    ko: {
      greeting: "ì•ˆë…•í•˜ì„¸ìš”, ì €ëŠ” Zoyiìž…ë‹ˆë‹¤. íˆ¬ì–´, ì˜ˆì•½ ê°€ëŠ¥ ì—¬ë¶€, ê°€ê²©(ARS), ì¼ì •ì— ëŒ€í•´ ë‹µë³€ë“œë¦´ ìˆ˜ ìžˆìŠµë‹ˆë‹¤. ë¬´ì—‡ì´ë“  ë¬¼ì–´ë³´ì„¸ìš”!",
      fallback: "ë‚ ì§œ, ê°€ëŠ¥ ì—¬ë¶€, ê°€ê²©, íˆ¬ì–´ ë˜ëŠ” ì˜ˆì•½ì— ëŒ€í•´ ì§ˆë¬¸í•˜ì„¸ìš”.",
      helpFull: "ë„ì™€ë“œë¦´ ìˆ˜ ìžˆëŠ” ë‚´ìš©: ì˜ˆì•½ ê°€ëŠ¥ ë‚ ì§œ, ARS ê°€ê²©, ì¸ì›, íˆ¬ì–´, ìœ„ì¹˜, PDF ì¼ì • ë° ì˜ˆì•½ ë°©ë²•.",
      humanAns: function(){ return consultationText; },
      datesAsk: "ì–´ë–¤ íˆ¬ì–´ì˜ ê°€ëŠ¥ ë‚ ì§œë¥¼ í™•ì¸í•˜ì‹œê² ì–´ìš”",
      datesBase: "ì˜¤ëŠ˜ë¶€í„° ì›í•˜ëŠ” ë‚ ì§œë¥¼ ì„ íƒí•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤. ì‹¤ì œ ê°€ëŠ¥ ì—¬ë¶€ëŠ” ë‚ ì§œ, íˆ¬ì–´, ì¸ì›ì— ë”°ë¼ í™•ì¸ë©ë‹ˆë‹¤.",
      datesExtra: function(p){ return " " + p.name + " ì •ì›: ìµœëŒ€ " + p.capacity + "ëª…."; },
      datesCta: " ë¬¸ì˜í•˜ë ¤ë©´ ì˜ˆì•½ ë²„íŠ¼ì„ ëˆ„ë¥´ê³  íˆ¬ì–´, ì¸ì›, ì˜ˆìƒ ë‚ ì§œë¥¼ ì„ íƒí•˜ì„¸ìš”.",
      pricesPer: " 1ì¸ë‹¹ ì•„ë¥´í—¨í‹°ë‚˜ íŽ˜ì†Œ(ARS) ê°€ê²©.",
      pricesAll: "1ì¸ë‹¹ ARS ê°€ê²©: ",
      resAnswer: "ê´€ì‹¬ ìžˆëŠ” íˆ¬ì–´ë‚˜ íˆ¬ì–´ë¥¼ ì•Œë ¤ì£¼ì‹œë©´ ì¸ì›ìˆ˜ì™€ ì˜ˆìƒ ë‚ ì§œë¥¼ ë¬¼ì–´ë³´ê² ìŠµë‹ˆë‹¤. ë§ˆì§€ë§‰ì— ìš”ì•½ì„ ì •ë¦¬í•˜ê³  ì™“ì¸ ì•±ìœ¼ë¡œ ê°€ê²©, ë‚ ì§œ, ì˜ˆì•½ ê°€ëŠ¥ ì—¬ë¶€ë¥¼ í™•ì¸í•©ë‹ˆë‹¤.",
      locAnswer: "Zoyen TurismoëŠ” ì•„ë¥´í—¨í‹°ë‚˜ íŒŒíƒ€ê³ ë‹ˆì•„ ì‚°íƒ€í¬ë£¨ìŠ¤ì£¼ íŽ˜ë¦¬í†  ëª¨ë ˆë…¸ì— ìžˆìŠµë‹ˆë‹¤. ì¿ ì—ë°” ë° ë¼ìŠ¤ ë§ˆë…¸ìŠ¤, íŒŒíƒ€ê³ ë‹ˆì•„ êµ­ë¦½ê³µì›, 41ë²ˆ ë„ë¡œ, í¬ì‚¬ë‹¤ìŠ¤ í˜¸ìˆ˜, ì¹´ë ˆí…Œë¼ ì•„ìš°ìŠ¤íŠ¸ëž„ë¡œ íˆ¬ì–´ê°€ ì¶œë°œí•©ë‹ˆë‹¤.",
      compareAnswer: "ì‹œê°„ì´ ë¶€ì¡±í•  ë•Œ ë‹¹ì¼ íˆ¬ì–´: ì¿ ì—ë°” ë° ë¼ìŠ¤ ë§ˆë…¸ìŠ¤, ë§ˆë¸” ì±„í”Œ, 41ë²ˆ ë„ë¡œ, í¬ì‚¬ë‹¤ìŠ¤ í˜¸ìˆ˜ ë˜ëŠ” íŒŒíƒ€ê³ ë‹ˆì•„ êµ­ë¦½ê³µì›. ì „ì²´ ì—¬í–‰: ë¯¸ì§€ì˜ íŒŒíƒ€ê³ ë‹ˆì•„(5ì¼), ë¯¸ì§€ì˜ ì‚°íƒ€í¬ë£¨ìŠ¤(8ì¼, í•­ê³µíŽ¸ í¬í•¨) ë˜ëŠ” ì¹´ë ˆí…Œë¼ ì•„ìš°ìŠ¤íŠ¸ëž„(ë‹¨ì²´ ì¶œë°œ). ê³ ê³ í•™: ì¿ ì—ë°” ë° ë¼ìŠ¤ ë§ˆë…¸ìŠ¤ ë˜ëŠ” ì°¨ë¥´ì¹´ë§ˆíƒ€. í•­í•´: ë§ˆë¸” ì±„í”Œ. ê²½ì¹˜ ë„ë¡œ: 41ë²ˆ ë„ë¡œ ë˜ëŠ” í¬ì‚¬ë‹¤ìŠ¤ í˜¸ìˆ˜.",
      wellnessAnswer: "ë‘ ê°€ì§€ ìƒˆë¡œìš´ ê²½í—˜ì´ ìžˆìŠµë‹ˆë‹¤: ì˜¤í”„ë¡œë“œ 4x4(ìžì‹ ì˜ ì°¨ëŸ‰ìœ¼ë¡œ ëŒ€ì²´ ê²½ë¡œë¥¼ ë‹¬ë¦¬ëŠ” ê°€ì´ë“œ íˆ¬ì–´)ì™€ ì˜ë¯¸ ìžˆëŠ” ì—¬í–‰(ë ˆì´í‚¤, ê·¸ë¼ìš´ë”©, ë°”ì´ì˜¤ë””ì½”ë”© ê°™ì€ ì¹˜ë£Œë²•ì´ í¬í•¨ëœ ì£¼ë§ ë˜ëŠ” ì¼ì£¼ì¼ê°„ì˜ ë‚´ë©´ ì—¬í–‰ ë¦¬íŠ¸ë¦¿). ìžì„¸í•œ ë‚´ìš©ì€ nuevas-experiencias.htmlì—ì„œ í™•ì¸í•˜ì„¸ìš”.",
      agencyAnswer: "Zoyen TurismoëŠ” ì‚°íƒ€í¬ë£¨ìŠ¤ì£¼ íŽ˜ë¦¬í†  ëª¨ë ˆë…¸ì˜ í˜„ì§€ ì—¬í–‰ì‚¬ë¡œ, ë©´í—ˆ ë²ˆí˜¸ëŠ” 15.625ìž…ë‹ˆë‹¤. íŒŒíƒ€ê³ ë‹ˆì•„ì—ì„œ íˆ¬ì–´ì™€ ì˜¤ì„œ íˆ¬ì–´ë¥¼ ì„¤ê³„í•©ë‹ˆë‹¤.",
      pdfBase: "PDF ì¼ì • ë‹¤ìš´ë¡œë“œê°€ ê°€ëŠ¥í•œ íˆ¬ì–´: ë¯¸ì§€ì˜ íŒŒíƒ€ê³ ë‹ˆì•„ì™€ ì¹´ë ˆí…Œë¼ ì•„ìš°ìŠ¤íŠ¸ëž„. ê° íŽ˜ì´ì§€ì— ë‹¤ìš´ë¡œë“œ ë²„íŠ¼ì´ ìžˆìŠµë‹ˆë‹¤.",
      pdfProduct: function(p){ return p.name + "ì˜ PDF ì¼ì •ì€ í•´ë‹¹ íŽ˜ì´ì§€ì—ì„œ ë‹¤ìš´ë¡œë“œí•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤."; },
      listExc: "ì´ìš© ê°€ëŠ¥í•œ ë‹¹ì¼ ë° ë°˜ë‚˜ì ˆ íˆ¬ì–´: ",
      listTours: "ì´ìš© ê°€ëŠ¥í•œ ì˜¤ì„œ íˆ¬ì–´: ", listToursSuffix: " ë‘ íˆ¬ì–´ ëª¨ë‘ PDF ì¼ì • ë‹¤ìš´ë¡œë“œê°€ ê°€ëŠ¥í•©ë‹ˆë‹¤.",
      verMas: "ë” ë³´ê¸°",
      capacity: "ëª…",
      kw: { human:["ì‚¬ëžŒ","ìƒë‹´ì›","ëŒ€í™”","ì—°ë½","whatsapp","ì „í™”","ë©”ì¼","ë¬¸ì˜"], dates:["ë‚ ì§œ","ê°€ëŠ¥","ì˜ˆì•½ê°€ëŠ¥","ì¼ì •","ì–¸ì œ","ìº˜ë¦°ë”"], prices:["ê°€ê²©","ìš”ê¸ˆ","ë¹„ìš©","ì–¼ë§ˆ","ê¸ˆì•¡"], book:["ì˜ˆì•½","ê²°ì œ","ë³´ì¦ê¸ˆ"], location:["ìœ„ì¹˜","ì–´ë””","ì£¼ì†Œ","íŽ˜ë¦¬í†  ëª¨ë ˆë…¸","ì‚°íƒ€í¬ë£¨ìŠ¤","ì˜¤ëŠ” ë°©ë²•"], pdf:["ì¼ì •","pdf","ë‹¤ìš´ë¡œë“œ","í”„ë¡œê·¸ëž¨"], excursion:["íˆ¬ì–´","ë‹¹ì¼","ë°˜ë‚˜ì ˆ"], tour:["ì˜¤ì„œíˆ¬ì–´","ì—¬ëŸ¬ë‚ ","íŒ¨í‚¤ì§€"], compare:["ì¶”ì²œ","ë¹„êµ","ì°¨ì´","ì–´ë–¤","ê°€"], wellness:["ì›°ë‹ˆìŠ¤","ìš”ê°€","ë§ˆì‚¬ì§€"], agency:["ì¡°ì˜Œ","ì—ì´ì „ì‹œ","ë©´í—ˆ"] }
    }
  };

  var excursiones = [
    {id:"cueva", name:"Cueva de las Manos", aliases:["cueva","cuevas","manos","cueva manos","cueva de manos","pinturas","pinturas rupestres","arqueologia","arqueología","río Pinturas","rio pinturas"], duration:"día completo", capacity:14, type:"excursion", summary:"Salidas desde Los Antiguos o Perito Moreno. Sitio arqueológico Patrimonio Mundial, con pinturas rupestres de más de 9.000 años.", includes:"Traslado, chofer/guía, vianda completa e ingreso al Parque Provincial Cueva de las Manos y Parque Patagonia.", url:"excursion-cueva-de-las-manos.html"},
    {id:"capillas", name:"Capillas y Catedrales de Mármol", aliases:["capillas","capilla","marmol","mármol","catedrales","catedrales de marmol","capillas de marmol","capillas y catedrales","general carrera","lago general carrera","chile"], duration:"día completo", capacity:14, type:"excursion", summary:"navegación por el Lago General Carrera para ver formaciones de mármol. Solo salidas grupales ida y vuelta en el día.", includes:"Traslados, guía, coffee break, navegación y almuerzo incluido con bebida sin alcohol. Importante: si se deniega el paso a Chile por falta de documentación vigente o en regla, la devolución será del 50% del valor del tour.", url:"excursion-capillas-de-marmol.html"},
    {id:"posadas", name:"Lago Posadas y Ruta Escénica 41", aliases:["posadas","lago posadas","ruta 41","ruta escénica","ruta escenica","lago","meseta","4x4","lago posada"], duration:"día completo (12 hs)", capacity:14, type:"excursion", summary:"Vuelta a la Meseta por Ruta Escénica 41: 160 km hasta Lago Posadas, recorrido por los lagos y almuerzo picnic incluido con bebida.", includes:"Traslado en 4x4 con chofer/guía y almuerzo picnic con bebida sin alcohol.", url:"excursion-ruta41-lago-posadas.html"},
    {id:"zeballos", name:"Los Antiguos y Ruta Escénica 41", aliases:["zeballos","monte zeballos","ruta 41","ruta escénica 41","ruta escenica 41","los antiguos","antiguos","chacra","chacras"], duration:"día completo", capacity:14, type:"excursion", summary:"Salida por la mañana desde Perito Moreno y Los Antiguos. Desde los 200 m s. n. m. del Lago Buenos Aires hasta el bosque andino patagónico de lengas y ñires por Ruta Escénica 41. Vistas de los Andes, la Meseta del Lago Buenos Aires y Monte Zeballos, estancias ganaderas, paradas y caminatas cortas. Después del almuerzo, visita a La Ascensión, parte del Parque Nacional Patagonia, y a una chacra de fruta fina, dulces y licores locales.", includes:"Traslados con chofer/guía, almuerzo con bebida sin alcohol y visita a chacra en Los Antiguos.", url:"excursion-ruta41-los-antiguos.html"},
    {id:"charcamata", name:"Alero Charcamata", aliases:["charcamata","charca","alero","arte rupestre","pinturas charcamata"], duration:"día completo", capacity:14, type:"excursion", summary:"Arte rupestre de alrededor de 5.000 años. Salida desde Los Antiguos a las 08:00 hs y Perito Moreno a las 09:00 hs.", includes:"Traslado en 4x4 con chofer/guía especializado y vianda para almuerzo.", url:"excursion-alero-charcamata.html"},
    {id:"parque",   name:"Portal Cañadón Pinturas - Parque Patagonia",  aliases:["parque","parque patagonia","portal canadon","cañadon pinturas","canadon pinturas","canadon","cañadon","can","pinturas","portal","senderos","íŒŒíƒ€ê³ ë‹ˆì•„ ê³µ"], duration:"5/6 hs desde Perito Moreno; aproximadamente 7 hs desde Los Antiguos", capacity:14, type:"excursion", summary:"senderos, fauna, geología y vistas del noroeste de Santa Cruz.", includes:"Traslado en 4x4 o minibús con guía y merienda. No incluye almuerzo.", url:"excursion-parque-patagonia.html"},
  ];
  var tours = [
    {id:"patagonia", name:"Patagonia Inédita", aliases:["patagonia inedita","patagonia inédita","inedita","inédita","tour patagonia","patagonia profunda"], duration:"5 días / 4 noches", capacity:14, type:"tour", pdf:"assets/pdfs/patagonia-inedita-itinerario.pdf", summary:"sale desde Comodoro Rivadavia y recorre Perito Moreno, Cueva de las Manos, Parque Patagonia, Los Antiguos, Ruta Escénica 41 y Capillas y Catedrales de Mármol.", includes:"Traslados desde y hacia el aeropuerto de Comodoro Rivadavia, 4 noches de hotel con desayuno y excursiones full day con todo incluido. No incluye bebidas alcohólicas ni cenas.", url:"patagonia-inedita.html"},
    {id:"carretera", name:"Circuito Binacional Santa Cruz/Aysén", aliases:["circuito binacional","santa cruz aysén","carretera austral","austral","aysén","cochrane","puerto río tranquilo","los antiguos","ruta 41","ruta escénica 41","cueva de las manos","capillas de mármol"], duration:"8 días / 7 noches", capacity:16, type:"tour", pdf:"assets/pdfs/carretera-austral-itinerario.pdf", summary:"8 días / 7 noches por Santa Cruz y Aysén: Perito Moreno, Cueva de las Manos, Los Antiguos, Ruta Escénica 41, Carretera Austral, Cochrane, Puerto Río Tranquilo y navegación a Capillas y Catedrales de Mármol.", includes:"Traslados en minibús desde y hacia el aeropuerto; 3 noches en Perito Moreno, 1 en Cochrane, 1 en Puerto Río Tranquilo y 2 en Los Antiguos, con desayuno. Excursiones a Cueva de las Manos y Ruta Escénica 41, recorridos por Carretera Austral y navegación a Capillas y Catedrales de Mármol. Almuerzos durante las actividades. No incluye almuerzos en días libres, cenas ni bebidas extra o alcohólicas.", url:"carretera-austral.html"},
    {id:"circuito_binacional", name:"Santa Cruz Inexplorada", aliases:["santa cruz inexplorada","santa cruz inexplorado","inexplorada","inexplorado","patagonia inexplorada","los antiguos","cueva de las manos"], duration:"8 días / 7 noches", capacity:16, type:"tour", summary:"8 días / 7 noches: 3 noches en Perito Moreno y 4 en Los Antiguos, con excursiones full day a Cueva de las Manos, Capillas y Catedrales de Mármol, Ruta Escénica 41 y chacra. Aéreos no incluidos.", includes:"Traslados desde y hacia Aeropuerto de Perito Moreno, alojamiento con desayuno y excursiones full day con almuerzo y bebida sin alcohol. No incluye aéreos, cenas ni bebidas alcohólicas. Consultar vuelos y opción de llegada a Comodoro Rivadavia.", url:"santa-cruz-inexplorada.html"}
  ];
  function applyEditableTourConfigToZoyi() {
    var cfg = {};
    try { cfg = getTourConfig(); } catch(e) { cfg = {}; }
    var map = {
      patagonia: 'patagonia_inedita',
      carretera: 'carretera_austral',
      circuito_binacional: 'circuito_binacional_patagonia_inexplorada'
    };
    tours.forEach(function(t){
      var src = cfg[map[t.id]];
      if(!src) return;
      if(src.name) t.name = src.name;
      if(src.duration) t.duration = src.duration;
      if(Number(src.capacity) > 0) t.capacity = Number(src.capacity);
    });
  }
  applyEditableTourConfigToZoyi();
  var allProducts = excursiones.concat(tours);

  function normalize(t){ return (t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&middot;|\?/g," ").replace(/[^a-z0-9\s/.-]/g," ").replace(/\s+/g," ").trim(); }
  function money(n){ return "$"+Number(n||0).toLocaleString("es-AR")+" AR p/p"; }
  function escapeHtml(s){
    return String(s||"").replace(/[&<>"']/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c;
    });
  }
  function formatZoyiText(text){
    return escapeHtml(text)
      .replace(/\[\[LINK:([^|\]]*)\|([^\]]*)\]\]/g,function(_,label,url){
        return '<a href="'+escapeHtml(url)+'" target="_blank" rel="noopener" class="zoyi-link">'+escapeHtml(label)+'</a>';
      })
      .replace(/\n/g,"<br>")
      .replace(/(^|<br>)([^<][^:<]{2,42}:)/g,'$1<span class="zoyi-answer-title">$2</span>')
      .replace(/<br>- /g,'<br><span class="zoyi-list-line">- ')
      .replace(/(<span class="zoyi-list-line">[^<]*(:<br>|$))/g,function(m){return m.replace(/<br>$/,'</span><br>');});
  }
  function productLinkTag(p,ui){
    if(!p||!p.url) return "";
    var label=(ui&&ui.verMas)||"Ver más";
    return "[[LINK:"+label+" - "+p.name+"|"+p.url+"]]";
  }
  function addMessage(text,who){
    if(!messages)return;
    var d=document.createElement("div");
    d.className="zoyi-msg "+who;
    if(who==="bot") d.innerHTML=formatZoyiText(text);
    else d.textContent=text;
    messages.appendChild(d);
    messages.scrollTop=messages.scrollHeight;
  }
  function choiceCopy(){
    var lang=getLang();
    return ({
      es:{type:"¿Qué querés consultar?",exc:"Excursiones",tour:"Tours de autor",pickExc:"Elegí una excursión:",pickTour:"Elegí un tour de autor:"},
      en:{type:"What would you like to check",exc:"Excursions",tour:"Author tours",pickExc:"Choose an excursion:",pickTour:"Choose an author tour:"},
      pt:{type:"O que você quer consultar",exc:"Excursões",tour:"Tours de autor",pickExc:"Escolha uma excursão:",pickTour:"Escolha um tour de autor:"},
      ko:{type:"ë¬´ì—‡ì„ í™•ì¸í•˜ì‹œê² ì–´ìš”",exc:"ë‹¹ì¼ íˆ¬ì–´",tour:"ìž‘ê°€ íˆ¬ì–´",pickExc:"ì—¬í–‰ì„ ì„ íƒí•˜ì„¸ìš”:",pickTour:"íˆ¬ì–´ë¥¼ ì„ íƒí•˜ì„¸ìš”:"}
    })[lang]||({type:"¿Qué querés consultar?",exc:"Excursiones",tour:"Tours de autor",pickExc:"Elegí una excursión:",pickTour:"Elegí un tour de autor:"});
  }
  function leadCopy(){
    var lang=getLang();
    return ({
      es:{
        askPersonas:"¿Para cuántas personas?", personasOptions:["1","2","3","4","5+"],
        askFecha:"¿Tenés una fecha tentativa?", fechaSkip:"Todavía no sé",
        fechaPlaceholder:"Escrib? una fecha o mes aproximado y envi?",
        askContacto:"Para que podamos contactarte, dejanos tu nombre y teléfono (ej: Juan Pérez, 1122334455)",
        contactoPlaceholder:"Nombre y teléfono",
        resumenTitle:"Así quedaría tu consulta:",
        resumenProducto:"Experiencia: ", resumenPersonas:"Personas: ", resumenFecha:"Fecha tentativa: ",
        resumenNombre:"Nombre: ", resumenTelefono:"Teléfono: ",
        confirmarBtn:"Continuar por WhatsApp →", editarBtn:"Volver a empezar",
        waMensaje:function(d){ return "Hola! Soy "+d.nombre+". Quiero consultar por "+d.producto+" para "+d.personas+" persona(s)."+(d.fecha ? " Fecha tentativa: "+d.fecha+".":"")+" Mi WhatsApp: "+d.telefono; },
        despuesWa:"Qued? tu consulta registrada. Te abrimos WhatsApp para cerrar la venta y coordinar precio, fecha y cupo."
      },
      en:{
        askPersonas:"How many people", personasOptions:["1","2","3","4","5+"],
        askFecha:"Do you have a tentative date", fechaSkip:"Not sure yet",
        fechaPlaceholder:"Type an approximate date or month and send",
        askContacto:"So we can contact you, please share your name and phone number (e.g. John Smith, 1122334455)",
        contactoPlaceholder:"Name and phone",
        resumenTitle:"Here's your inquiry:",
        resumenProducto:"Experience: ", resumenPersonas:"People: ", resumenFecha:"Tentative date: ",
        resumenNombre:"Name: ", resumenTelefono:"Teléfono: ",
        confirmarBtn:"Continue on WhatsApp →", editarBtn:"Start over",
        waMensaje:function(d){ return "Hello! I'm "+d.nombre+". I'd like to ask about "+d.producto+" for "+d.personas+" people."+(d.fecha ? " Tentative date: "+d.fecha+".":"")+" My WhatsApp: "+d.telefono; },
        despuesWa:"Your inquiry was saved. WhatsApp will open so we can close the sale and confirm price, date and availability."
      },
      pt:{
        askPersonas:"Para quantas pessoas", personasOptions:["1","2","3","4","5+"],
        askFecha:"Você tem uma data tentativa", fechaSkip:"Ainda não sei",
        fechaPlaceholder:"Digite uma data ou más aproximado e envie",
        askContacto:"Para que possamos contatar você, deixe seu nome e telefone (ex: João Silva, 1122334455)",
        contactoPlaceholder:"Nome e telefone",
        resumenTitle:"Assim ficaria sua consulta:",
        resumenProducto:"Experiência: ", resumenPersonas:"Pessoas: ", resumenFecha:"Data tentativa: ",
        resumenNombre:"Nome: ", resumenTelefono:"Teléfono: ",
        confirmarBtn:"Continuar por WhatsApp →", editarBtn:"Começar de novo",
        waMensaje:function(d){ return "Ol?! Sou "+d.nombre+". Quero consultar sobre "+d.producto+" para "+d.personas+" pessoa(s)."+(d.fecha ? " Data tentativa: "+d.fecha+".":"")+" Meu WhatsApp: "+d.telefono; },
        despuesWa:"Sua consulta foi registrada. Vamos abrir o WhatsApp para fechar a venda e confirmar preço, data e disponibilidade."
      },
      ko:{
        askPersonas:"ëª‡ ëª…ì´ì‹ ê°€ìš”", personasOptions:["1","2","3","4","5+"],
        askFecha:"ì˜ˆìƒ ë‚ ì§œê°€ ìžˆìœ¼ì‹ ê°€ìš”", fechaSkip:"ì•„ì§ ëª¨ë¥´ê² ì–´ìš”",
        fechaPlaceholder:"ëŒ€ëžµì ì¸ ë‚ ì§œë‚˜ ì›”ì„ ìž…ë ¥í•˜ê³  ì „ì†¡í•˜ì„¸ìš”",
        askContacto:"ì—°ë½ì„ ìœ„í•´ ì´ë¦„ê³¼ ì „í™”ë²ˆí˜¸ë¥¼ ì•Œë ¤ì£¼ì„¸ìš” (ì˜ˆ: í™ê¸¸ë™, 1122334455)",
        contactoPlaceholder:"ì´ë¦„ê³¼ ì „í™”ë²ˆí˜¸",
        resumenTitle:"ë¬¸ì˜ ë‚´ìš©ì€ ë‹¤ìŒê³¼ ê°™ìŠµë‹ˆë‹¤:",
        resumenProducto:"íˆ¬ì–´: ", resumenPersonas:"ì¸ì›: ", resumenFecha:"ì˜ˆìƒ ë‚ ì§œ: ",
        resumenNombre:"ì´ë¦„: ", resumenTelefono:"ì „í™”ë²ˆí˜¸: ",
        confirmarBtn:"ì™“ì¸ ì•±ìœ¼ë¡œ ê³„ì†í•˜ê¸° ?", editarBtn:"ë‹¤ì‹œ ì‹œìž‘",
        waMensaje:function(d){ return "ì•ˆë…•í•˜ì„¸ìš”! "+d.nombre+"ìž…ë‹ˆë‹¤. "+d.producto+"ì— ëŒ€í•´ "+d.personas+"ëª… ê¸°ì¤€ìœ¼ë¡œ ë¬¸ì˜í•˜ê³  ì‹¶ìŠµë‹ˆë‹¤."+(d.fecha ? " ì˜ˆìƒ ë‚ ì§œ: "+d.fecha+".":"")+" ì œ ì™“ì¸ ì•±: "+d.telefono; },
        despuesWa:"ë¬¸ì˜ê°€ ë“±ë¡ë˜ì—ˆìŠµë‹ˆë‹¤. íŒë§¤ í™•ì •ê³¼ ê°€ê²©, ë‚ ì§œ, ê°€ëŠ¥ ì—¬ë¶€ í™•ì¸ì„ ìœ„í•´ WhatsAppì„ ì—´ì–´ë“œë¦½ë‹ˆë‹¤."
      }
    })[lang]||null;
  }
  function addChoices(prompt,options,intent){
    if(!messages)return;
    var d=document.createElement("div");
    d.className="zoyi-msg bot";
    var title=document.createElement("div");
    title.textContent=prompt;
    d.appendChild(title);
    var wrap=document.createElement("div");
    wrap.className="zoyi-options";
    options.forEach(function(option){
      var b=document.createElement("button");
      b.type="button";
      b.className="zoyi-option";
      b.textContent=option.label;
      b.dataset.zoyiAction=option.action;
      b.dataset.zoyiValue=option.value;
      b.dataset.zoyiIntent=intent;
      wrap.appendChild(b);
    });
    d.appendChild(wrap);
    messages.appendChild(d);
    messages.scrollTop=messages.scrollHeight;
  }
  function showTypeChoices(intent){
    var c=choiceCopy(), lang=getLang(), ui=UI[lang]||UI.es;
    addChoices(intent==="dates" ? (ui.datesAsk||c.type) : c.type,[
      {label:c.exc,action:"type",value:"excursion"},
      {label:c.tour,action:"type",value:"tour"}
    ],intent);
  }
  function showProductChoices(intent,type){
    var c=choiceCopy(), list=type==="tour" ? tours : excursiones;
    addChoices(type==="tour" ? c.pickTour : c.pickExc,list.map(function(p){
      return {label:p.name,action:"product",value:p.id};
    }),intent);
  }
  function selectedProductAnswer(intent,id){
    var lang=getLang(),ui=UI[lang]||UI.es;
    var p=allProducts.find(function(item){return item.id===id;});
    if(!p)return ui.fallback;
    if(intent==="prices")return p.name+"\n"+consultationText;
    if(intent==="dates")return availabilityProductAnswer(p,ui);
    return productSummary(p,ui);
  }

  // -- Flujo guiado de consulta (lead) -------------------------------
  function startLeadFlow(productId){
    var p=allProducts.find(function(item){return item.id===productId;});
    if(!p)return;
    leadDraft={ producto:p.name, productoKey:p.id, personas:"", fecha:"", nombre:"", telefono:"", step:LEAD_STEP.PERSONAS };
    showLeadPersonas();
  }
  function showLeadPersonas(){
    var lc=leadCopy(); if(!lc)return;
    addChoices(lc.askPersonas, lc.personasOptions.map(function(n){
      return {label:n, action:"lead-personas", value:n};
    }), "lead");
  }
  function showLeadFecha(){
    var lc=leadCopy(); if(!lc)return;
    addChoices(lc.askFecha, [{label:lc.fechaSkip, action:"lead-fecha-skip", value:""}], "lead");
    if(input){ input.placeholder=lc.fechaPlaceholder; input.dataset.zoyiLeadField="fecha"; input.focus(); }
  }
  function showLeadContacto(){
    var lc=leadCopy(); if(!lc)return;
    addMessage(lc.askContacto,"bot");
    if(input){ input.placeholder=lc.contactoPlaceholder; input.dataset.zoyiLeadField="contacto"; input.focus(); }
  }
  function showLeadResumen(){
    var lc=leadCopy(); if(!lc||!leadDraft)return;
    var lines=[lc.resumenTitle,
      lc.resumenProducto+leadDraft.producto,
      lc.resumenPersonas+leadDraft.personas
    ];
    if(leadDraft.fecha) lines.push(lc.resumenFecha+leadDraft.fecha);
    lines.push(lc.resumenNombre+leadDraft.nombre);
    lines.push(lc.resumenTelefono+leadDraft.telefono);
    addMessage(lines.join("\n"),"bot");
    addChoices("", [
      {label:lc.confirmarBtn, action:"lead-confirmar", value:"go"},
      {label:lc.editarBtn, action:"lead-reset", value:"reset"}
    ], "lead");
    leadDraft.step=LEAD_STEP.CONFIRMAR;
  }
  function parseContacto(raw){
    var parts=String(raw||"").split(",");
    if(parts.length>=2){
      return { nombre:parts[0].trim(), telefono:parts.slice(1).join(",").trim() };
    }
    var m=String(raw||"").match(/(\+[\d\s\-()]{6,})/);
    if(m){
      return { nombre:String(raw||"").replace(m[0],"").trim() || "-", telefono:m[0].trim() };
    }
    return { nombre:String(raw||"").trim() || "-", telefono:"" };
  }
  function confirmarLead(){
    if(!leadDraft)return;
    var lc=leadCopy();
    var ahora=new Date().toLocaleString('es-AR');
    var reservas=readReservas();
    var nueva={
      id: Date.now(), nombre: leadDraft.nombre, tel: leadDraft.telefono, email:'',
      excursionKey: leadDraft.productoKey, excursion: leadDraft.producto,
      fecha: leadDraft.fecha||'', personas: leadDraft.personas,
      asientos:'', senia:0, estado:'consulta',
      tipoConsulta:'whatsapp_click', leadType:'zoyi_chat', inquiryType:'whatsapp_click',
      origen:'zoyi', canalCierre:'whatsapp', whatsappClicked:true, whatsappClickedAt:ahora, notas:'Consulta vía Zoyi: '+leadDraft.personas+' persona(s)'+(leadDraft.fecha ? ', fecha tentativa '+leadDraft.fecha : '')+'. WhatsApp abierto por el visitante.',
      creado: ahora, ultimoIntento: ahora
    };
    reservas.push(nueva);
    writeReservas(reservas);
    if (window.ZoyenCloud && ZoyenCloud.ready) {
      ZoyenCloud.createReservation(nueva).then(function(result){
        if(result && result.ok){
          var current=readReservas(), local=current.find(function(r){return r.id===nueva.id;});
          if(local){ if(result.data&&result.data.id) local.cloudId=result.data.id; local.sincronizada=true; writeReservas(current); }
        }
      }).catch(function(error){
        console.error('No se pudo sincronizar la consulta de Zoyi:', error);
      });
    }
    var msg=lc.waMensaje(leadDraft);
    window.open(waLink+"text="+encodeURIComponent(msg),"_blank","noopener");
    addMessage(lc.despuesWa,"bot");
    leadDraft=null;
    if(input){ input.placeholder=""; delete input.dataset.zoyiLeadField; }
  }
  function resetLeadFlow(){
    leadDraft=null;
    if(input){ input.placeholder=""; delete input.dataset.zoyiLeadField; }
    var lang=getLang(),ui=UI[lang]||UI.es;
    addMessage(ui.fallback,"bot");
  }

  function priceText(p){ return "Tarifas por WhatsApp"; }
  function formatDateIso(dateText,lang){
    var m=String(dateText||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return dateText;
    var d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
    var locale=lang==="en" ? "en-US" : (lang==="pt" ? "pt-BR" : "es-AR");
    return d.toLocaleDateString(locale,{day:"numeric",month:"long",year:"numeric"});
  }
  function getProductDates(p){ return []; }
  function datesTextForProduct(p,ui){
    var dates=getProductDates(p), lang=getLang();
    if(dates.length){
      return "- Fechas cargadas: " + dates.map(function(d){return formatDateIso(d,lang);}).join(", ") + "\n";
    }
    if(p && p.type==="tour"){
      return "- Fechas cargadas: consultar disponibilidad para una fecha tentativa.\n";
    }
    return "- Fechas: se coordinan según la fecha tentativa que indiques.\n";
  }
  function availabilityProductAnswer(p,ui){
    var out = "Disponibilidad de " + p.name + ":\n";
    out += "- Duración: " + p.duration + "\n";
    out += datesTextForProduct(p,ui);
    out += "- Tarifas: " + consultationText + "\n";
    out += "- Recorrido: " + p.summary + "\n";
    if(p.includes) out += "- Incluye: " + p.includes + "\n";
    out += "Para avanzar: tocá Consultar, elegí esta experiencia, cantidad de personas y una fecha tentativa. Zoyen confirma disponibilidad y condiciones por WhatsApp.";
    var link=productLinkTag(p,ui);
    if(link) out+="\n"+link;
    return out;
  }
  function dateAvailabilityAnswer(p,ui){
    if(p) return availabilityProductAnswer(p,ui);
    return (ui.datesAsk||"¿Sobre qué excursión o tour querés consultar fechas disponibles?");
  }
  function productLine(p,ui){ return p.name+": "+p.duration+", "+priceText(p)+", "+p.capacity+(ui ? ui.capacity:" personas")+"."; }
  function productBullet(p,ui){ return "- "+p.name+"\n  "+p.duration+" - "+priceText(p)+" - "+p.capacity+(ui ? ui.capacity:" personas"); }
  function productSummary(p,ui){
    var out=productBullet(p,ui)+"\n  "+p.summary;
    if(p.includes) out+="\n  Incluye: "+p.includes;
    var link=productLinkTag(p,ui);
    if(link) out+="\n"+link;
    return out;
  }
  function numberedSteps(text){ return String(text||"").replace(/\s*(\d\))/g,"\n$1").trim(); }
  function productSearchText(p){ return normalize([p.name,p.summary,p.includes].concat(p.aliases||[]).join(" ")); }
  function searchTokens(t){
    return normalize(t).split(" ").filter(function(w){
      return w.length>2 && ["que","del","los","las","una","uno","por","para","con","sobre","quiero","consultar","fecha","fechas","disponible","disponibilidad","tour","tours","excursion","excursiones"].indexOf(w)===-1;
    });
  }
  function closeToken(a,b){
    if(!a||!b)return false;
    if(a===b||a.indexOf(b)===0||b.indexOf(a)===0)return true;
    if(Math.abs(a.length-b.length)>2||a.length<5||b.length<5)return false;
    var m=a.length,n=b.length,prev=[],cur=[],i,j;
    for(j=0;j<=n;j++)prev[j]=j;
    for(i=1;i<=m;i++){
      cur=[i];
      for(j=1;j<=n;j++){
        cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a.charAt(i-1)===b.charAt(j-1)?0:1));
      }
      prev=cur;
    }
    return prev[n]<=2;
  }
  function findProduct(raw){
    var q=normalize(raw), qTokens=searchTokens(q), best=null, bestScore=0;
    allProducts.forEach(function(p){
      var score=0, fields=[p.name].concat(p.aliases||[]), hay=productSearchText(p), hayTokens=searchTokens(hay);
      fields.forEach(function(alias){
        var a=normalize(alias);
        if(!a)return;
        if(q===a) score+=20;
        else if(q.indexOf(a)!==-1) score+=a.length>8 ? 12 : 7;
        else if(a.indexOf(q)!==-1 && q.length>3) score+=5;
      });
      qTokens.forEach(function(t){
        if(hay.indexOf(t)!==-1) score+=2;
        else if(hayTokens.some(function(ht){return closeToken(t,ht);})) score+=1;
      });
      if(score>bestScore){ best=p; bestScore=score; }
    });
    return bestScore>=3 ? best : null;
  }
  function isAsking(q,words){ return words.some(function(w){ var nw=normalize(w); return q.indexOf(nw)!==-1 || searchTokens(q).some(function(t){return closeToken(t,nw);}); }); }
  function hasSpecificProductMention(raw){
    var q=normalize(raw);
    return allProducts.some(function(p){
      return [p.name].concat(p.aliases||[]).some(function(alias){
        var a=normalize(alias);
        return a && a.length>4 && q.indexOf(a)!==-1;
      });
    });
  }

  function answer(raw){
    var lang=getLang(), ui=UI[lang]||UI.es, k=ui.kw;
    var q=normalize(raw);
    if(!q||q.length<2) return ui.fallback;
    var p=findProduct(q);
    if(isAsking(q,k.human))    return ui.humanAns();
    if(isAsking(q,k.dates))    return dateAvailabilityAnswer(p,ui);
    if(isAsking(q,k.prices)) return (p ? p.name+"\n" : "")+consultationText;
    if(isAsking(q,k.book))     return ui.resAnswer;
    if(isAsking(q,k.location)) return ui.locAnswer;
    if(isAsking(q,k.pdf))      return p&&p.pdf ? ui.pdfProduct(p) : ui.pdfBase;
    if(isAsking(q,k.excursion))return p ? productSummary(p,ui) : ui.listExc.trim()+"\n"+excursiones.map(function(x){return productBullet(x,ui);}).join("\n");
    if(isAsking(q,k.tour))     return p ? productSummary(p,ui) : ui.listTours.trim()+"\n"+tours.map(function(x){return productBullet(x,ui);}).join("\n")+"\n"+ui.listToursSuffix;
    if(isAsking(q,k.compare))  return ui.compareAnswer;
    if(isAsking(q,k.wellness)) return ui.wellnessAnswer;
    if(isAsking(q,k.agency))   return ui.agencyAnswer;
    if(p) return productSummary(p,ui);
    return ui.helpFull;
  }

  function submit(text){
    var val=(text||(input ? input.value :"")||"").trim();
    if(!val)return;
    addMessage(val,"user");
    if(input)input.value="";
    // Si estamos en medio del flujo guiado, el texto libre responde ese paso puntual
    var leadField = input && input.dataset.zoyiLeadField;
    if(leadField && leadDraft){
      if(leadField==="fecha"){
        leadDraft.fecha=val; leadDraft.step=LEAD_STEP.CONTACTO;
        if(input){ input.placeholder=""; delete input.dataset.zoyiLeadField; }
        window.setTimeout(showLeadContacto,160);
        return;
      }
      if(leadField==="contacto"){
        var c=parseContacto(val);
        leadDraft.nombre=c.nombre; leadDraft.telefono=c.telefono;
        if(input){ input.placeholder=""; delete input.dataset.zoyiLeadField; }
        window.setTimeout(showLeadResumen,160);
        return;
      }
    }
    window.setTimeout(function(){
      var lang=getLang(),ui=UI[lang]||UI.es,q=normalize(val),p=findProduct(q),k=ui.kw;
      if(isAsking(q,k.dates) && !hasSpecificProductMention(val)){
        if(isAsking(q,k.excursion)){ showProductChoices("dates","excursion"); return; }
        if(isAsking(q,k.tour)){ showProductChoices("dates","tour"); return; }
        showTypeChoices("dates");
        return;
      }
      if(isAsking(q,k.book)){
        if(p){ startLeadFlow(p.id); return; }
        if(isAsking(q,k.excursion)){ showProductChoices("book","excursion"); return; }
        if(isAsking(q,k.tour)){ showProductChoices("book","tour"); return; }
        showTypeChoices("book");
        return;
      }
      if(!p&&isAsking(q,k.prices)){showTypeChoices("prices");return;}
      if(!p&&isAsking(q,k.dates)){showTypeChoices("dates");return;}
      if(!p&&isAsking(q,k.excursion)){showProductChoices("details","excursion");return;}
      if(!p&&isAsking(q,k.tour)){showProductChoices("details","tour");return;}
      addMessage(answer(val),"bot");
    },160);
  }

  if(toggle) toggle.addEventListener("click",function(){
    widget.classList.toggle("open");
    toggle.setAttribute("aria-expanded",widget.classList.contains("open") ? "true" : "false");
    if(widget.classList.contains("open")&&input)input.focus();
  });
  window.abrirZoyi = function(){
    widget.classList.add("open");
    if(toggle) toggle.setAttribute("aria-expanded","true");
    if(input) input.focus();
  };
  function openZoyiFromLocalLink(){
    window.abrirZoyi();
  }
  document.addEventListener("click", function(e){
    var link = e.target.closest && e.target.closest('a[href="#abrir-zoyi"]');
    if (!link) return;
    e.preventDefault();
    openZoyiFromLocalLink();
  });
  window.addEventListener("hashchange", function(){
    if (window.location.hash === "#abrir-zoyi") window.abrirZoyi();
  });
  if(closeBtn) closeBtn.addEventListener("click",function(){ widget.classList.remove("open"); if(toggle)toggle.setAttribute("aria-expanded","false"); });
  if(form) form.addEventListener("submit",function(e){ e.preventDefault(); submit(); });
  if(chips) chips.addEventListener("click",function(e){
    var chip=e.target.closest && e.target.closest("button[data-zoyi-chip]");
    if(!chip)return;
    var kind=chip.dataset.zoyiChip;
    addMessage(chip.textContent,"user");
    window.setTimeout(function(){
      if(kind==="book"){ showTypeChoices("book"); return; }
      if(kind==="dates"){ showTypeChoices("dates"); return; }
      if(kind==="prices"){ showTypeChoices("prices"); return; }
      if(kind==="excursion"){ showProductChoices("details","excursion"); return; }
      if(kind==="tour"){ showProductChoices("details","tour"); return; }
      if(kind==="location"){ addMessage((UI[getLang()]||UI.es).locAnswer,"bot"); return; }
      if(kind==="human"){ addMessage((UI[getLang()]||UI.es).humanAns(),"bot"); return; }
      submit(chip.textContent);
    },120);
  });
  if(messages) messages.addEventListener("click",function(e){
    var b=e.target.closest("button[data-zoyi-action]");
    if(!b)return;
    var action=b.dataset.zoyiAction,value=b.dataset.zoyiValue,intent=b.dataset.zoyiIntent;
    if(action==="type"){
      addMessage(b.textContent,"user");
      window.setTimeout(function(){showProductChoices(intent,value);},120);
      return;
    }
    if(action==="product"){
      addMessage(b.textContent,"user");
      if(intent==="book"){
        window.setTimeout(function(){startLeadFlow(value);},120);
        return;
      }
      window.setTimeout(function(){addMessage(selectedProductAnswer(intent,value),"bot");},120);
      return;
    }
    if(action==="lead-personas"){
      addMessage(b.textContent,"user");
      if(leadDraft){ leadDraft.personas=value; leadDraft.step=LEAD_STEP.FECHA; }
      window.setTimeout(showLeadFecha,120);
      return;
    }
    if(action==="lead-fecha-skip"){
      addMessage(b.textContent,"user");
      if(leadDraft){ leadDraft.fecha=""; leadDraft.step=LEAD_STEP.CONTACTO; }
      if(input){ input.placeholder=""; delete input.dataset.zoyiLeadField; }
      window.setTimeout(showLeadContacto,120);
      return;
    }
    if(action==="lead-confirmar"){
      addMessage(b.textContent,"user");
      window.setTimeout(confirmarLead,120);
      return;
    }
    if(action==="lead-reset"){
      addMessage(b.textContent,"user");
      window.setTimeout(resetLeadFlow,120);
      return;
    }
  });

  // Saludo inicial en el idioma activo
  var lang=getLang(), ui=UI[lang]||UI.es;
  addMessage(ui.greeting,"bot");

  // -- Bubble de presentación --------------------------------------------
  var bubble     = document.getElementById('zoyiBubble');
  var bubbleMsg  = document.getElementById('zoyiBubbleMsg');
  var bubbleClose= document.getElementById('zoyiBubbleClose');
  var bubbleTimer = null;

  var bubbleTexts = {
    es: '¡Hola! Soy Zoyi, asistente de Zoyen Turismo. ¿Tenés alguna consulta?',
    en: 'Hi! I\'m Zoyi, Zoyen Turismo assistant. Got a question',
    pt: 'Ol! Sou Zoyi, assistente da Zoyen Turismo. Tem alguma dvida',
    ko: 'ì•ˆë…•í•˜ì„¸ìš”! ì €ëŠ” Zoyen Turismoì˜ Zoyiìž…ë‹ˆë‹¤. ë¬´ì—‡ì„ ë„ì™€ë“œë¦´ê¹Œìš”'
  };

  function showBubble() {
    if (!bubble) return;
    var l = getLang();
    if (bubbleMsg) bubbleMsg.textContent = bubbleTexts[l] || bubbleTexts.es;
    bubble.classList.remove('hiding');
    bubble.classList.add('visible');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(hideBubble, 10000);
  }

  function hideBubble() {
    if (!bubble) return;
    bubble.classList.add('hiding');
    setTimeout(function(){ bubble.classList.remove('visible','hiding'); }, 350);
    clearTimeout(bubbleTimer);
  }

  if (bubbleClose) bubbleClose.addEventListener('click', function(e){
    e.stopPropagation();
    hideBubble();
  });

  // Ocultar bubble al abrir el panel
  if (toggle) {
    var origToggleClick = toggle.onclick;
    toggle.addEventListener('click', function(){
      hideBubble();
    });
  }

  // Mostrar bubble 2s después de cargar
  setTimeout(showBubble, 2000);
})();

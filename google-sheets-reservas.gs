const ZOYEN_SHEET = 'Reservas';
const ZOYEN_HEADERS = ['ID','Nombre','Teléfono','Email','Excursión','Clave del tour','Fecha','Personas','Asientos','Seña','Estado','Último contacto','Seguimiento','Notas','Actualizado'];

function getZoyenSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(ZOYEN_SHEET);
  if (!sheet) sheet = book.insertSheet(ZOYEN_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, ZOYEN_HEADERS.length).setValues([ZOYEN_HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, ZOYEN_HEADERS.length).setFontWeight('bold').setBackground('#201810').setFontColor('#ffffff');
  }
  return sheet;
}

function doGet() {
  const sheet = getZoyenSheet_();
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.shift() || ZOYEN_HEADERS;
  const reservations = values.filter(row => row.some(Boolean)).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || ''])));
  return ContentService.createTextOutput(JSON.stringify({ reservations })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(event) {
  const payload = JSON.parse((event && event.postData && event.postData.contents) || '{}');
  const reservations = payload.reservations || [];
  const sheet = getZoyenSheet_();
  const current = sheet.getDataRange().getValues();
  const rowById = new Map();
  current.slice(1).forEach((row, index) => { if (row[0]) rowById.set(String(row[0]), index + 2); });

  reservations.forEach((item, index) => {
    const id = String(item.id || ('ZY-' + Date.now() + '-' + index));
    const row = [id,item.nombre||'',item.tel||'',item.email||'',item.excursion||'',item.excursionKey||'',item.fecha||'',item.personas||1,item.asientos||'',item.senia||0,item.estado||'consulta',item.ultimoIntento||'',item.followUp||'',item.notas||'',item.updatedAt||new Date().toISOString()];
    const target = rowById.get(id);
    if (target) sheet.getRange(target, 1, 1, row.length).setValues([row]);
    else { sheet.appendRow(row); rowById.set(id, sheet.getLastRow()); }
  });

  sheet.autoResizeColumns(1, ZOYEN_HEADERS.length);
  return ContentService.createTextOutput(JSON.stringify({ ok:true, count:reservations.length })).setMimeType(ContentService.MimeType.JSON);
}

function onEdit(event) {
  if (!event || event.range.getSheet().getName() !== ZOYEN_SHEET || event.range.getRow() === 1) return;
  const sheet = event.range.getSheet();
  const updatedColumn = ZOYEN_HEADERS.indexOf('Actualizado') + 1;
  sheet.getRange(event.range.getRow(), updatedColumn).setValue(new Date().toISOString());
  const idCell = sheet.getRange(event.range.getRow(), 1);
  if (!idCell.getValue()) idCell.setValue('SHEET-' + Date.now());
}

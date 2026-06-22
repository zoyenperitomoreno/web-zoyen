# Sincronizar reservas con Google Sheets

El panel admin ahora tiene 4 botones en "Sincronización con Google Sheets":

- **Exportar a Excel**: descarga un archivo `.xlsx` con todas las reservas, sin necesidad de configurar nada.
- **Guardar URL**: guarda en este navegador la URL del Google Apps Script (ver pasos abajo).
- **Enviar reservas al Sheet**: sube todas las reservas actuales del panel al Google Sheet (sobrescribe la hoja "Reservas").
- **Traer cambios del Sheet**: lee el Google Sheet y trae al panel las filas nuevas o editadas a mano (por ejemplo, reservas que llegaron por otro medio y se anotaron directamente en la planilla).

## Paso 1 — Crear el Google Sheet

1. Crea una hoja de cálculo nueva en Google Sheets.
2. En la fila 1, poné estos encabezados exactos, en este orden:

```
#	Nombre	Teléfono	Email	Excursión	Clave tour	Fecha	Personas	Asientos	Seña	Estado	Último contacto	Próximo seguimiento	Notas
```

## Paso 2 — Crear el Apps Script

1. En el Sheet, ir a **Extensiones → Apps Script**.
2. Borrar el código de ejemplo y pegar este:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservas');
  var body = JSON.parse(e.postData.contents);
  var reservas = body.reservas || [];

  // Limpiar todo excepto encabezados
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();

  var rows = reservas.map(function(r) {
    return [r.numero, r.nombre, r.telefono, r.email, r.excursion, r.excursionKey, r.fecha, r.personas, r.asientos, r.senia, r.estado, r.ultimoContacto, r.followUp, r.notas];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true, count: rows.length }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservas');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1).filter(function(row) { return row[1]; }); // filtra filas sin nombre

  var reservas = rows.map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return {
      nombre: obj['Nombre'], telefono: obj['Teléfono'], email: obj['Email'],
      excursion: obj['Excursión'], excursionKey: obj['Clave tour'], fecha: obj['Fecha'],
      personas: obj['Personas'], asientos: obj['Asientos'], senia: obj['Seña'],
      estado: obj['Estado'], ultimoContacto: obj['Último contacto'],
      followUp: obj['Próximo seguimiento'], notas: obj['Notas']
    };
  });

  return ContentService.createTextOutput(JSON.stringify({ reservas: reservas }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Guardar el proyecto (ícono de disquete).

## Paso 3 — Publicar como Web App

1. Arriba a la derecha, click en **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. "Ejecutar como": **Yo (tu cuenta)**.
4. "Quién tiene acceso": **Cualquier usuario** (necesario para que el panel pueda llamarlo).
5. Click en **Implementar**.
6. Google va a pedir autorización la primera vez — aceptar los permisos.
7. Copiar la **URL de la aplicación web** que aparece (termina en `/exec`).

## Paso 4 — Conectar el panel

1. En el panel admin, pegar esa URL en el campo "URL de Google Apps Script (Web App)".
2. Click en **Guardar URL**.
3. Click en **Enviar reservas al Sheet** para la primera carga.
4. A partir de ahí, cuando alguien anote a mano una reserva nueva directamente en el Sheet (por ejemplo, una que llegó por teléfono), tocar **Traer cambios del Sheet** en el panel para incorporarla.

## Notas importantes

- Cada vez que tocás "Enviar reservas al Sheet", se **sobrescribe** todo el contenido de la hoja "Reservas" (fila 1 de encabezados queda intacta). Si edita algo a mano en el Sheet y todavía no lo trajiste al panel, primero hacé "Traer cambios del Sheet" antes de volver a enviar, para no perder esos cambios.
- Si Google pide volver a autorizar después de cambios en el script, hay que repetir el paso 3 (Nueva implementación) y actualizar la URL en el panel si cambia.
- La URL del Apps Script queda guardada en este navegador únicamente. Si abrís el panel desde otra computadora, hay que pegarla de nuevo ahí.

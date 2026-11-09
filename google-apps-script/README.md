# Sincronización Automática con Google Drive (BDSolicitudes-Gex)

Este script permite que cada vez que un estudiante haga clic en **"Inscribirme"** o **"Enviar solicitud de convalidación"** en el portal `uss-gex`, sus datos se guarden directamente en la carpeta compartida de Google Drive:

- **Carpeta Drive:** `Compartido conmigo > CINF GEX > BDSolicitudes-Gex`
- **ID de la Carpeta:** `13ga9IRDc3CHvSZ1IXnlHtv8w_k9GBryp`
- **URL de la Carpeta:** [Abrir en Google Drive](https://drive.google.com/drive/u/1/folders/13ga9IRDc3CHvSZ1IXnlHtv8w_k9GBryp)
- **Hoja de Cálculo:** `USS_CINF_Solicitudes_GEX`

---

## 🚀 Pasos para Desplegar el Webhook en 1 Minuto

1. **Abrir la carpeta en Drive:**
   - Entra a [BDSolicitudes-Gex](https://drive.google.com/drive/u/1/folders/13ga9IRDc3CHvSZ1IXnlHtv8w_k9GBryp).
   - Abre la hoja de cálculo `USS_CINF_Solicitudes_GEX` (o crea una nueva Hoja de Cálculo de Google si no existiera).

2. **Abrir Apps Script:**
   - En el menú superior de la hoja, haz clic en **Extensiones** > **Apps Script**.

3. **Pegar el código:**
   - Borra cualquier código que aparezca y pega el contenido completo de [`Code.gs`](./Code.gs).
   - Guarda con `Cmd + S` o clic en el icono del disquete.

4. **Implementar como Aplicación Web:**
   - Haz clic en el botón azul **Implementar** (arriba a la derecha) > **Nueva implementación**.
   - Haz clic en el engranaje ⚙️ junto a "Seleccionar tipo" y elige **Aplicación web**.
   - Configura:
     - **Descripción:** `Sincronizador GEX Solicitudes Drive`
     - **Ejecutar como:** `Yo (tu correo institucional o de Drive)`
     - **Quién tiene acceso:** `Cualquier usuario` *(Anyone)*
   - Haz clic en **Implementar**. Si te pide autorizar permisos de Drive, haz clic en *Revisar permisos* y acéptalos.

5. **Copiar la URL en el proyecto:**
   - Copia la **URL de la aplicación web** generada (termina en `/exec`).
   - En el archivo `/Users/dagnerchumanlluen/Documents/USS/uss-gex/.env`, agrega la línea:
     ```env
     VITE_GEX_APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_ID_DE_APPS_SCRIPT/exec
     VITE_GEX_DRIVE_FOLDER_ID=13ga9IRDc3CHvSZ1IXnlHtv8w_k9GBryp
     ```

¡Listo! Cada registro creará automáticamente una nueva fila con estilo institucional en la hoja de cálculo de Google Drive y también generará el archivo Excel descargable.

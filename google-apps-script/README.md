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

¡Listo! Cada registro crea una fila en la hoja de cálculo de Google Drive con las 9 columnas oficiales:

1. `Fecha y Hora`
2. `Código Universitario`
3. `Estudiante`
4. `Escuela`
5. `Celular / WhatsApp`
6. `Correo`
7. `Trámite / Plan`
8. `Documento Adjunto`
9. `Estado`

## Si cambias `Code.gs`

Pegar el código nuevo no basta: la URL `/exec` sigue ejecutando la versión publicada. Ve a **Implementar > Gestionar implementaciones > ✏️ Editar > Versión: Nueva versión > Implementar**. La URL no cambia.

## Comprobar que funciona

Abre la URL `/exec` en el navegador. Debe responder `"status":"online"`. Si dice `"carpetaAccesible":false`, la cuenta que publicó el script no es editora de la carpeta `BDSolicitudes-Gex`: la hoja se crea igual, pero en "Mi unidad" de esa cuenta. Para que quede en la carpeta, publica el script con una cuenta editora de la carpeta o vincúlalo a una hoja creada dentro de ella (paso 1).


# Google Drive Node.js API

Servidor Node.js con API REST para facilitar la interacción entre Google Drive API y aplicaciones web, móviles y/o de escritorio.

## Checklist
* Login ✔️
* Obtener lista de archivos de un directorio ✔️
* Copiar documento ✔️
* Mover documento ✔️
* Renombrar documento ✔️
* Crear documento ✔️
* Crear directorio ✔️
* Descargar documento como PDF ✔️
* Estabelcer permisos de un documento a otros usuarios
* Obtener comentarios de un documento
* Obtener historial de modificaciones de un documento
* Obtener última fecha de acceso a un documento
* Copiar archivo a repositorio VPS

## Instalación

1. Instalar [Node](https://nodejs.org/es/) y [npm](https://www.npmjs.com) en su ordenador.
2. Abrir una terminal en el directorio *Server*.
3. Ejecutar el comando  ```$ npm install``` para instalar los módulos requeridos.

## Configuración

1. Ingresar a [Google Console](https://console.cloud.google.com/) con la cuenta de administrador.
2. Crear un nuevo proyecto.
3. En el panel izquierdo selecciónar *APIs y Servicios*, luego *Biblioteca*.
4. Buscar *Google Drive API* y habilitarla.
5. Buscar *Google+ API* y habilitarla.
6. Volver al panel de *APIs y Servicios*, luego seleccionar *Credenciales* y por último *Pantalla de consentiemiento de OAuth*.
7. Ingresar los datos solicitados y guardar.
8. Volver a la pestaña *Credenciales*, hacer click en *Crear credenciales* y seleccionar la opción *ID de cliente de OAuth*.
9. Seleccionar el tipo de aplicación y añadir un nombre de cliente.
10. En la sección *URI de redireccionamiento autorizados* ingresar los URL a los cuales se dará permiso de redireccionar luego de iniciar sesión, por ejemplo, si ejecuta la aplicación en un servidor local añadir el URL ```http://localhost:3000/login```.
11. Una vez terminado hacer click en *Crear*.
12. Se mostrarán dos códigos, los cuales debe añadir al archivo ```Server/conf/conf.json```.<br>
```javascript
{
	"client_id":"ID de Cliente",
	"client_secret":"Secreto de Cliente",
	"email":"Email del administrador",
	"scopes":["https://www.googleapis.com/auth/plus.profile.emails.read","https://www.googleapis.com/auth/drive"],
	"mimeTypes":["application/vnd.google-apps.folder","application/vnd.google-apps.document"],
	"redirect_uris":["http://localhost:3000/login"],
	"port":3000
}
```
13. Por último, añadir el email del administrador y configurar los otros parámetros a gusto.

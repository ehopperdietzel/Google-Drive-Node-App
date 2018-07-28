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
* Crear permisos a un archivo ✔️
* Modificar permisos a un archivo ✔️
* Obtener lista de permisos creados a un archivo ✔️
* Obtener información de un permiso ( Usuario ) ✔️
* Eliminar permisos a un archivo ✔️
* Obtener comentarios de un documento
* Obtener historial de modificaciones de un documento
* Obtener última fecha de acceso a un documento
* Copiar archivo a repositorio VPS
* Frontend de Testeo
* Documentación

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

## Métodos API REST

### Listado de un directorio : GET /listDir
--
Retorna una lista con la información de todos los archivos de un directorio.
Por defecto solo muestra archivos de tipo directorio y Google Docs. Se pueden agregar más tipos modificando el parámetro *mimeTypes* en el archivo *conf.json*. [Lista de MIME Types soportados.](https://developers.google.com/drive/api/v3/mime-types)

##### Entrada

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>fileId</td>
		<td>STRING</td>
		<td>ID del directorio que se quiere listar. El ID del directorio principal es <i>root<i>.</td>
	</tr>
</table>

##### Respuesta

Retorna un arreglo de objetos en formato JSON, donde cada objeto posee los siguientes parámetros:

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID de un archivo</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre de un archivo</td>
	</tr>
	<tr>
		<td>mimeType</td>
		<td>STRING</td>
		<td>Tipo de archivo</td>
	</tr>
</table>

--
### Copia de un archivo : POST /copyFile
--
Realiza una copia de un archivo en Google Drive.

##### Entrada

Se debe enviar un objeto JSON con los siguientes parámetros.
<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>fileId</td>
		<td>STRING</td>
		<td>ID del archivo que se quiere desea.</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre del archivo copiado.</td>
	</tr>
	<tr>
		<td>parentId</td>
		<td>STRING</td>
		<td>ID del directorio de destino.</td>
	</tr>
</table>

##### Respuesta

Retorna un STRING con el ID de la copia.
















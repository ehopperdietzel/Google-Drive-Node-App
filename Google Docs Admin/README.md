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
* Obtener información de un permiso ✔️
* Eliminar permisos a un archivo ✔️
* Obtener comentarios de un documento ✔️
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
-----------------------------------------------
### Generar URL de login : GET /loginUrl
-----------------------------------------------

Genera un URL para iniciar sesión con OAuth de Google. Este método se debería modificar si se quisiera generar un URL de login para aplicaciones móviles.

##### Entrada

Sin parámetros de entrada.

##### Respuesta

Retorna un URL STRING para iniciar sesión, el cual luego debería redireccionar al método */login* como se explica a continuación.

-----------------------------------------------
### Inicio de sesión : GET /login
-----------------------------------------------

Es el URL al cual debe redirigir la ventana de inicio de sesión OAuth de Google ( Paso Nº10 de la configuración ), el cual contiene el parámetro de entrada *code*, con el código necesario para generar un token de sesión.

##### Entrada

Parámetros del GET request:

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>code</td>
		<td>STRING</td>
		<td>Código generado por OAuth de Google.</td>
	</tr>
</table>

##### Respuesta
Si todo concluye con éxito, el token es almacenado en una *cookie("token")* para manejar la sesión, y se envía la página de la interfaz al usuario.

-----------------------------------------------
### Listado de un directorio : GET /listDir
-----------------------------------------------
Retorna una lista con la información de todos los archivos de un directorio.
Por defecto solo muestra archivos de tipo directorio y Google Docs. Se pueden agregar más tipos modificando el parámetro *mimeTypes* en el archivo *conf.json*. [Lista de MIME Types soportados.](https://developers.google.com/drive/api/v3/mime-types)

##### Entrada

Parámetros del GET request:

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

Retorna un arreglo de objetos en formato JSON con la información de cada archivo y directorio, donde cada objeto posee los siguientes parámetros:

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID del archivo o directorio.</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre del archivo o directorio.</td>
	</tr>
	<tr>
		<td>mimeType</td>
		<td>STRING</td>
		<td>Tipo de archivo.</td>
	</tr>
</table>

-----------------------------------------------
### Copia de un archivo : POST /copyFile
-----------------------------------------------
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
		<td>ID del archivo a copiar.</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre de la copia.</td>
	</tr>
	<tr>
		<td>parentId</td>
		<td>STRING</td>
		<td>ID del directorio destino.</td>
	</tr>
</table>

##### Respuesta

Retorna un objeto en formato JSON con los siguientes parámetros.

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID de la copia.</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre de la copia.</td>
	</tr>
	<tr>
		<td>mimeType</td>
		<td>STRING</td>
		<td>Tipo del archivo.</td>
	</tr>
</table>

-----------------------------------------------
### Mover un archivo : PATCH /moveFile
-----------------------------------------------

Mueve un archivo o directorio de Google Drive a otro directorio.

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
		<td>ID del archivo.</td>
	</tr>
	<tr>
		<td>parentId</td>
		<td>STRING</td>
		<td>ID del directorio destino.</td>
	</tr>
</table>

##### Respuesta

Retorna un objeto en formato JSON con los siguientes parámetros.

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID del archivo o directorio.</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre del archivo.</td>
	</tr>
	<tr>
		<td>mimeType</td>
		<td>STRING</td>
		<td>Tipo de archivo.</td>
	</tr>
</table>

-----------------------------------------------
### Renombrar un archivo : PATCH /renameFile
-----------------------------------------------

Cambia el nombre de un archivo o directorio de Google Drive.

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
		<td>ID del archivo o directorio.</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nuevo nombre.</td>
	</tr>
</table>

##### Respuesta

Retorna un objeto en formato JSON con los siguientes parámetros.

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID del archivo.</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nuevo nombre del archivo.</td>
	</tr>
	<tr>
		<td>mimeType</td>
		<td>STRING</td>
		<td>Tipo del archivo.</td>
	</tr>
</table>

-----------------------------------------------
### Crear un documento : POST /createDoc
-----------------------------------------------

Crea un nuevo Google Document en blanco.

##### Entrada

Se debe enviar un objeto JSON con los siguientes parámetros.
<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre del nuevo archivo</td>
	</tr>
	<tr>
		<td>parentId</td>
		<td>STRING</td>
		<td>ID del directorio destino.</td>
	</tr>
</table>

##### Respuesta

Retorna un objeto en formato JSON con los siguientes parámetros.

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID del nuevo archivo.</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre del archivo.</td>
	</tr>
	<tr>
		<td>mimeType</td>
		<td>STRING</td>
		<td>Tipo del archivo.</td>
	</tr>
</table>

-----------------------------------------------
### Crear un directorio : POST /createDir
-----------------------------------------------

Crea un nuevo directorio en Google Drive.

##### Entrada

Se debe enviar un objeto JSON con los siguientes parámetros.
<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre del nuevo directorio</td>
	</tr>
	<tr>
		<td>parentId</td>
		<td>STRING</td>
		<td>ID del directorio destino.</td>
	</tr>
</table>

##### Respuesta

Retorna un objeto en formato JSON con los siguientes parámetros.

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID del nuevo directorio.</td>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre del directorio.</td>
	</tr>
	<tr>
		<td>mimeType</td>
		<td>STRING</td>
		<td>Tipo del archivo.</td>
	</tr>
</table>

-----------------------------------------------
### Descargar PDF : GET /downloadPdf
-----------------------------------------------

Descarga un documento de Google Drive en formato PDF, lo almacena en la carpeta *pdf* de la aplicación, y envía un URL de descarga al usuario.

##### Entrada

Parámetros del GET request:

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>fileId</td>
		<td>STRING</td>
		<td>ID del documento.</td>
	</tr>
</table>

##### Respuesta

Retorna un URL STRING con el enlace de descarga del PDF.

```/downloadFile?name=nombre_del_archivo.pdf```

-----------------------------------------------
### Descargar Archivo : GET /downloadFile
-----------------------------------------------

Descarga un documento ya almacenado en la carpeta *pdf*.

##### Entrada

Parámetros del GET request:

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>name</td>
		<td>STRING</td>
		<td>Nombre del archivo.</td>
	</tr>
</table>

##### Respuesta

Envía el archivo al usuario, como descarga.

-----------------------------------------------
### Crear permisos de archivo : POST /createFilePermission
-----------------------------------------------

Crea un nuevo permiso de archivo para un usuario B.

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
		<td>ID del archivo.</td>
	</tr>
	<tr>
		<td>role</td>
		<td>STRING</td>
		<td>Rol del usuario. [Ver roles permitidos.](https://developers.google.com/drive/api/v3/about-permissions)</td>
	</tr>
	<tr>
		<td>emailAddress</td>
		<td>STRING</td>
		<td>Email del usuario B.</td>
	</tr>
</table>

##### Respuesta

Retorna un objeto en formato JSON con los siguientes parámetros.

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID del permiso.</td>
	</tr>
	<tr>
		<td>role</td>
		<td>STRING</td>
		<td>Rol del usuario B.</td>
	</tr>
	<tr>
		<td>emailAddress</td>
		<td>STRING</td>
		<td>Email del usuario del permiso.</td>
	</tr>
</table>

-----------------------------------------------
### Eliminar permiso de archivo : DELETE /deleteFilePermission
-----------------------------------------------

Elimina un permiso dado a un archivo.

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
		<td>ID del archivo.</td>
	</tr>
	<tr>
		<td>permissionId</td>
		<td>STRING</td>
		<td>ID del permiso.</td>
	</tr>
</table>

##### Respuesta

No retorna ningún dato.

-----------------------------------------------
### Modificar permisos de archivo : PATCH /updateFilePermission
-----------------------------------------------

Permite cambiar el rol de un permiso ya existente.

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
		<td>ID del archivo.</td>
	</tr>
	<tr>
		<td>permissionId</td>
		<td>STRING</td>
		<td>ID del permiso.</td>
	</tr>
	<tr>
		<td>role</td>
		<td>STRING</td>
		<td>Nuevo rol. [Ver roles permitidos.](https://developers.google.com/drive/api/v3/about-permissions)</td>
	</tr>
	
</table>

##### Respuesta

Retorna un objeto en formato JSON con los siguientes parámetros.

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID del permiso.</td>
	</tr>
	<tr>
		<td>role</td>
		<td>STRING</td>
		<td>Nuevo rol.</td>
	</tr>
	<tr>
		<td>emailAddress</td>
		<td>STRING</td>
		<td>Email del usuario del permiso.</td>
	</tr>
</table>

-----------------------------------------------
### Listar permisos de archivo : GET /listFilePermissions
-----------------------------------------------

Lista todos los permisos otorgados a un archivo.

##### Entrada

Parámetros del GET request:
<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>fileId</td>
		<td>STRING</td>
		<td>ID del archivo.</td>
	</tr>	
</table>

##### Respuesta

Retorna un arreglo de objetos en formato JSON con la información de cada permiso, donde cada objeto posee los siguientes parámetros:

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID del permiso.</td>
	</tr>
	<tr>
		<td>role</td>
		<td>STRING</td>
		<td>Rol del permiso.</td>
	</tr>
	<tr>
		<td>emailAddress</td>
		<td>STRING</td>
		<td>Email del usuario del permiso.</td>
	</tr>
</table>

-----------------------------------------------
### Información de un permiso : GET /permissionInfo
-----------------------------------------------

Entrega información de un permiso.

##### Entrada

Parámetros del GET request:
<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>fileId</td>
		<td>STRING</td>
		<td>ID del archivo.</td>
	</tr>
	<tr>
		<td>permissionId</td>
		<td>STRING</td>
		<td>ID del permiso.</td>
	</tr>
</table>

##### Respuesta

Retorna un objeto en formato JSON con los siguientes parámetros:

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>id</td>
		<td>STRING</td>
		<td>ID del permiso.</td>
	</tr>
	<tr>
		<td>role</td>
		<td>STRING</td>
		<td>Rol del permiso.</td>
	</tr>
	<tr>
		<td>emailAddress</td>
		<td>STRING</td>
		<td>Email del usuario del permiso.</td>
	</tr>
</table>

-----------------------------------------------
### Listar comentarios de un archivo : GET /listFileComments
-----------------------------------------------

Retorna los comentarios de un archivo.

##### Entrada

Parámetros del GET request:
<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>fileId</td>
		<td>STRING</td>
		<td>ID del archivo.</td>
	</tr>
</table>

##### Respuesta

Retorna un arreglo de objetos en formato JSON, donde cada objeto tiene la siguiente estructura:

[Ver estructura.](https://developers.google.com/drive/api/v3/reference/comments#resource)

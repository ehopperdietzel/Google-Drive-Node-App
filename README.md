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
* Obtener historial de modificaciones de un documento ✔️
* Frontend de Testeo ✔️
* Documentación ✔️
* Copiar archivo a repositorio VPS

## Instalación

1. Instalar [Node](https://nodejs.org/es/) y [npm](https://www.npmjs.com) en su ordenador.
2. Abrir una terminal en el directorio *Server*.
3. Ejecutar el comando  ```$ npm install``` para instalar los módulos requeridos.

## Configuración

1. Ingresar a [Google Console](https://console.cloud.google.com/).
2. Crear un nuevo proyecto.
3. En el panel izquierdo selecciónar *APIs y Servicios*, luego *Biblioteca*.
4. Buscar *Google Drive API* y habilitarla.
5. Volver al panel de *APIs y Servicios*.
6. Ir a la pestaña *Credenciales*, hacer click en *Crear credenciales* y seleccionar la opción *Clave de cuenta de servicio*.
7. Asignar un nombre y selecionar la función *Proyecto > Propietario*.
8. Seleccionar tipo de clave JSON, y hacer click en crear.
9. Se descargara un archivo JSON, el cual debe renombrar a *key.json* y ubicarlo en el directorio */conf* de la aplicación.
10. Hacer click en *Administrar cuentas de servicio* para ver el email del servicio.
11. Acceder a Google Drive con su cuenta normal y compartir los archivos y directorios que considere necesarios con la cuenta de servicio, otorgándole el permiso de propietario.
12. Modificar el puerto y contraseña de administrador a gusto, en el archivo conf.json.
13. Iniciar la aplicación ejecutando el comando ```$ node index.js```

## Métodos API REST

1. [Generar URL de login](#a)
2. [Inicio de sesión](#b)
3. [Cierre de sesión](#bb)
4. [Listado de un directorio](#c)
5. [Copia de un archivo](#d)
6. [Mover un archivo](#e)
7. [Renombrar un archivo](#f)
8. [Crear un documento](#g)
9. [Crear un directorio](#h)
10. [Descargar PDF](#i)
11. [Descargar Archivo](#j)
12. [Crear permisos de archivo](#k)
13. [Eliminar permiso de archivo](#l)
14. [Modificar permisos de archivo](#m)
15. [Listar permisos de archivo](#n)
16. [Información de un permiso](#ñ)
17. [Listar comentarios de un archivo](#o)
18. [Listar cambios de un archivo](#p)


<hr id="a">

### Generar URL de login : GET /loginUrl
-----------------------------------------------

Genera un URL para iniciar sesión con OAuth de Google. Este método se debería modificar si se quisiera generar un URL de login para aplicaciones móviles.

##### Entrada

Sin parámetros de entrada.

##### Respuesta

Retorna un URL STRING para iniciar sesión, el cual luego debería redireccionar al método */login* como se explica a continuación.

<hr id="b">

### Inicio de sesión : GET /login
-----------------------------------------------
Inicia sesión de administrador, comprueba que la contraseña sea igual a la almacenada en el archivo conf.json.

##### Entrada

Parámetros del GET request:

<table>
	<tr>
		<th>Parámetro</th>
		<th>Tipo</th>
		<th>Descripción</th>
	</tr>
	<tr>
		<td>password</td>
		<td>STRING</td>
		<td>Contraseña de administrador.</td>
	</tr>
</table>

##### Respuesta
Si todo concluye con éxito, almacena un token en una *cookie("token")* para manejar la sesión, y se envía la página de la interfaz al usuario.

<hr id="bb">

### Cierre de sesión : GET /logout
-----------------------------------------------
Cierra la sesión del administrador.

##### Entrada

Sin parámetros de entrada.

##### Respuesta
Redirige a la página de inicio.

<hr id="c">

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

<hr id="d">

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

<hr id="e">

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

<hr id="f">

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

<hr id="g">

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

<hr id="h">

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

<hr id="i">

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
<hr id="j">

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
<hr id="k">

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
		<td>Rol del usuario. <a href="https://developers.google.com/drive/api/v3/about-permissions">Ver roles permitidos.</a></td>
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

<hr id="l">

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
<hr id="m">

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
		<td>Nuevo rol. <a href="https://developers.google.com/drive/api/v3/about-permissions">Ver roles permitidos.</a></td></td>
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

<hr id="n">

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

<hr id="ñ">

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

<hr id="o">

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

<hr id="p">

### Listar cambios de un archivo : GET /listFileChanges
-----------------------------------------------

Retorna todos los cambios que Google almacena de un documento.

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

[Ver estructura.](https://developers.google.com/drive/api/v3/reference/revisions#resource)

/****************************************************************************
**
** Cuarzo Software - 2018
** Eduardo Hopperdietzel - Informatic Engineer
** Universidad Austral de Chile
** Contact: ehopperdietzel@gmail.com
**
** index.js
**
** Aplicación NodeJS interactiva con Google Drive API
**
****************************************************************************/

// Módulo para leer y escribir archivos
var fs = require('fs');

// Módulo de las APIs de Google
var {google} = require('googleapis');

// Módulo para manipular cookies
var cookieParser = require('cookie-parser')

// Módulo para leer POST requests
var bodyParser = require("body-parser");

// Módulo Express utilizado para simplificar la API REST
var express = require('express');

// Instancia de Express
var app = express();

// Activa el uso de cookies, para almacenar los tokens en los requests
app.use(cookieParser());

// Activa el parseo para facilitar lectura de los requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Almacena las sesiones desde varios origenes ( Más de un usuario conectado a la cuenta admin, por ejemplo desde distintos dispositivos )
var sessions = new Array();

// Lee las configuraciones
const conf = require(__dirname + "/conf/conf.json");

// Instancia de Google Drive
var drive = google.drive('v3');

// Instancia de Google Plus ( Utilizado para verificar el email de administrador al iniciar sesión)
var plus = google.plus('v1');

// Envía la página de inicio ( Sin parámetros de entrada, retorna la interfaz de testeo HTML )
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/html/index.html');
});

/****************************************
 ** Generar URL de login.
 ****************************************/

app.get('/loginUrl', function (req, res) {

  // Genera el URL
  var generator = new google.auth.OAuth2(conf.client_id, conf.client_secret,conf.redirect_uris);
  const url = generator.generateAuthUrl({ access_type: 'offline', scope: conf.scopes });

  // Envía el URL al cliente
  res.send(url);
});

/****************************************
 ** Inicio de sesión.
 ****************************************/

app.get('/login', function (req, res) {

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.query, 1 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Crea un nuevo cliente OAuth2
  var admin = new google.auth.OAuth2(conf.client_id, conf.client_secret,conf.redirect_uris);

  // Obtiene el token a partir del código de verificación
  admin.getToken(req.query.code, (err, token) => {

    // Si ocurre un error con la verificación
    if (err)
    {
      res.status(500).send("Error de verificación.");
      return;
    }

    // Asigna el token al nuevo cliente
    admin.setCredentials(token);

    // Verifica si el email corresponde al del administrador ( Establecer el email de administrador en el archivo conf.json )
    plus.people.get({
        auth: admin,
        userId: 'me'
    }, function (err, user) {

      // Si ocurre un error con Google
      if(err)
      {
        res.status(500).send(err.message);
        return;
      }

      // Si no existen emails
      if( user.data.emails.length == 0 )
      {
        res.status(500).send("Error de cuenta.");
        return;
      }

      // Recorre los emails del usuario
      for(var i = 0; i < user.data.emails.length; i++ )
      {
        // Si encuentra el email del admin
        if( user.data.emails[i].value == conf.email )
        {
          // Almacena al cliente para futuras acciones
          sessions.push(admin);

          // Almacena el token en las cookies
          res.cookie('token', admin.credentials.access_token)

          // Redirige el cliente a la interfaz nuevamente
          res.sendFile(__dirname + '/html/index.html');
          return;
        }
      }

      // Si no se encuentra el email ( el usuario no es el admin )
      res.status(401).send("Usuario no permitido.");

    });
  });
});

/****************************************
 ** Listado de un directorio.
 ****************************************/

app.get('/listDir', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken( req.cookies.token );

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.query, 1 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía el request a Google Drive
  drive.files.list({
    auth: admin,
    types:conf.mimeTypes,
    q: "'" + req.query.fileId + "' in parents and " + mimeTypesQuery() },
    function (err, files)
    {
      // Si ocurre un error de Google
      if (err)
      {
        res.status(500).send(err.message);
        return;
      }

      // Éxito
      res.send(files.data.files);
    });
});

/****************************************
 ** Copia de un archivo.
 ****************************************/

app.post('/copyFile', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.body, 3 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía el request a Google Drive
  drive.files.copy({
    auth: admin,
    fileId: req.body.fileId,
    resource:{
      name: req.body.name,
      parents: [req.body.parent]
    }
    },
    function (err, ans)
    {
      // Si ocurre un error de Google
      if (err)
      {
        res.status(500).send(err.message);
        return;
      }

      // Éxito
      res.send(ans.data);
    });
});

/****************************************
 ** Mover un archivo.
 ****************************************/

app.patch('/moveFile', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.body, 2 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Se obtienen los IDs de los directorios padre anteriores
  drive.files.get({
    auth: admin,
    fileId: req.body.fileId,
    fields: 'parents'
    },function (err, file)
    {

    // Si ocurre un error de Google
    if (err)
    {
      res.status(500).send(err.message);
      return;
    }

    // Obtiene los IDs de los padres actuales
    var oldParents = file.data.parents;

    // Le asigna el nuevo padre
    drive.files.update({
      auth: admin,
      fileId: req.body.fileId,
      addParents: req.body.parent,
      removeParents: oldParents
      },function (err, file)
      {

      // Si ocurre un error de Google
      if (err)
      {
        res.status(500).send(err.message);
        return;
      }

      // Éxito
      res.send(file.data)

    });
  });
});

/****************************************
 ** Renombrar un archivo.
 ****************************************/

app.patch('/renameFile', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.body, 2 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google Drive
  drive.files.update({
    auth: admin,
    fileId: req.body.fileId,
    resource:{
      name: req.body.name,
    }
    },
    function (err, ans)
    {
      // Si ocurre un error de Google
      if (err)
      {
        res.status(500).send(err.message);
        return;
      }

      // Éxito
      res.send( ans.data );

    });
});

/****************************************
 ** Crear un nuevo documento.
 ****************************************/

app.post('/createDoc', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.body, 2 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google Drive
  drive.files.create({
    auth: admin,
    resource:{
      name: req.body.name,
      parents:[req.body.parent],
      mimeType:"application/vnd.google-apps.document"
    }
    },
    function (err, ans)
    {
      // Si ocurre un error de Google
      if (err)
      {
        res.status(500).send(err.message);
        return;
      }

      // Éxito
      res.send( ans.data );

    });
});

/****************************************
 ** Crear un nuevo directorio.
 ****************************************/

app.post('/createDir', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.body, 2 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google Drive
  drive.files.create({
    auth: admin,
    resource:{
      name: req.body.name,
      parents:[req.body.parent],
      mimeType:"application/vnd.google-apps.folder"
    }
    },
    function (err, ans)
    {
      // Si ocurre un error de Google
      if (err)
      {
        res.status(500).send(err.message);
        return;
      }

      // Éxito
      res.send( ans.data );
    });
});

/****************************************
 ** Descargar PDF.
 ****************************************/

app.get('/downloadPdf', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.query, 1 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Obtiene el nombre del archivo
  drive.files.get({
    auth: admin,
    fileId: req.query.fileId
    },
    function (err, name)
    {
      // Si ocurre un error de Google
      if (err)
      {
        res.status(500).send(err.message);
        return;
      }

      // Descarga el pdf
      drive.files.export({
        auth: admin,
        fileId: req.query.fileId,
        mimeType:"application/pdf"
        },
        {
          responseType: 'stream'
        },
        function (err, ans)
        {

          // Si ocurre un error de Google
          if (err)
          {
            res.status(500).send(err.message);
            return;
          }

          // Genera un nombre que no exista
          const fileName = validSaveName( name.data.name );

          // Directorio de destino
          const dest = fs.createWriteStream(__dirname + "/pdf/" + fileName + ".pdf");

          ans.data.on('error', err =>
          {
            // Si ocurre un error con la descarga
            res.status(500).send("Error de descarga.");
            return;

          }).on('end', ()=>
          {
              // Éxito
              res.send("/downloadFile?name="  + fileName.replace(/ /g, "%") + ".pdf" );

          }).pipe(dest);

        });
    });
});

/****************************************
 ** Descargar archivo.
 ****************************************/

app.get('/downloadFile', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.query, 1 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Ubicación del archivo
  const path = __dirname + "/pdf/" + req.query.name.replace(/%/g, " ") ;

  // Si el archivo no existe
  if( ! fs.existsSync( path ) )
  {
    res.status(500).send("El archivo no existe.");
    return;
  }

  // Éxito
  res.download(path);

});

/****************************************
 ** Crear permisos de archivo.
 ****************************************/

app.post('/createFilePermission', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.body, 3 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google
  drive.permissions.create({
    auth:admin,
    resource: {
      type:"user",
      role: req.body.role,
      emailAddress: req.body.emailAddress
    },
    fields: "id,emailAddress,role",
    fileId: req.body.fileId,
  }, function (err, ans) {

    // Si ocurre un error de Google
    if (err)
    {
      res.status(500).send(err.message);
      return;
    }

    // Éxito
    res.send(ans.data);

  });
});

/****************************************
 ** Eliminar permisos de archivo.
 ****************************************/

app.delete('/deleteFilePermission', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.body, 2 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google
  drive.permissions.delete({
    auth:admin,
    permissionId: req.body.permissionId.toString(),
    fileId: req.body.fileId,
  }, function (err, ans) {

    // Si ocurre un error de Google
    if (err)
    {
      console.log(err);
      res.status(500).send(err.message);
      return;
    }

    // Éxito
    res.send("Permiso eliminado.");
  });
});

/****************************************
 ** Modificar permisos de archivo.
 ****************************************/

app.patch('/updateFilePermission', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.body, 3 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google
  drive.permissions.update({
    auth:admin,
    permissionId: req.body.permissionId,
    fileId: req.body.fileId,
    fields: "id,emailAddress,role",
    resource:{
      role: req.body.role
    }
  }, function (err, ans) {

    // Si ocurre un error de Google
    if (err)
    {
      res.status(500).send(err.message);
      return;
    }

    console.log(ans.data);

    // Éxito
    res.send(ans.data);
  });
});

/****************************************
 ** Listar permisos de archivo.
 ****************************************/

app.get('/listFilePermissions', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.query, 1 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google
  drive.permissions.list({
    auth:admin,
    fileId: req.query.fileId,
    fields: "permissions(id,emailAddress,role)"
  }, function (err, ans) {

    // Si ocurre un error de Google
    if (err)
    {
      res.status(500).send(err.message);
      return;
    }

    // Éxito
    res.send(ans.data.permissions);

  });
});

/****************************************
 ** Información de un permiso.
 ****************************************/

app.get('/permissionInfo', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.query, 2 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google
  drive.permissions.get({
    auth:admin,
    fileId: req.query.fileId,
    permissionId: req.query.permissionId,
    fields: "id,emailAddress,role"
  }, function (err, ans) {

    // Si ocurre un error de Google
    if (err)
    {
      res.status(500).send(err.message);
      return;
    }

    // Éxito
    res.send(ans.data);
  });
});

/****************************************
 ** Listar comentarios de un documento.
 ****************************************/

app.get('/listFileComments', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.query, 1 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google
  drive.comments.list({
    auth:admin,
    fileId: req.query.fileId,
    fields: "comments(id,createdTime,modifiedTime,author,htmlContent,content,deleted,resolved,quotedFileContent,anchor,replies)",
  }, function (err, ans) {

    // Si ocurre un error de Google
    if (err)
    {
      res.status(500).send(err.message);
      return;
    }

    // Éxito
    res.send(ans.data.comments);
  });
});

/****************************************
 ** Listar modificaciones de un documento.
 ****************************************/

app.get('/listFileChanges', function (req, res) {

  // Comprueba que el usuario ha iniciado sesión
  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.status(401).send("No ha iniciado sesión.");
    return;
  }

  // Comprueba que exista el número de parámetros requeridos en el request
  if( invalidRequest( req.query, 1 ) )
  {
    res.status(400).send("Bad Request.");
    return;
  }

  // Envía solicitud a Google
  drive.revisions.list({
    auth:admin,
    fileId: req.query.fileId,
    pageSize: 1000,
    fields: "revisions(id,modifiedTime,lastModifyingUser,originalFilename,size)",

  }, function (err, ans) {

    // Si ocurre un error de Google
    if (err)
    {
      res.status(500).send(err.message);
      return;
    }

    // Éxito
    res.send(ans.data.revisions);
  });
});


// Inicia el servidor con puerto establecido en el archivo conf.json
app.listen(conf.port, function () {
  console.log('Servidor local corriendo en http://localhost:' + conf.port + ".");
});

// Verifica si el nombre de un PDF ya existe y genera nuevos nombres hasta que no exista
function validSaveName(name)
{
  // Genera nuevos nombres
  while (fs.existsSync( __dirname + "/pdf/" + name + ".pdf"))
  {
    name += " copy";
  }

  return name;
}

// Comprueba que exista el número de parámetros requeridos en un request, retorna true si es inválido
function invalidRequest(query,length)
{
  const keys = Object.keys(query);

  // Si algún parámetro esta vacío
  for(var i = 0; i < keys.length; i++)
    if( query[keys[i]] == null  || query[keys[i]] == "" || query[keys[i]] == undefined)
      return true;

  // Si falta algún parametro
  if( keys.length === length )
    return false;

  return true;
}

// Genera un string query para filtrar las busquedas de archivos en drive
function mimeTypesQuery()
{
  var q = "(";
  for(var i = 0; i<conf.mimeTypes.length; i++)
  {
      q += "mimeType='" + conf.mimeTypes[i] + "'";
      if( i != conf.mimeTypes.length - 1)
      q += " or ";
  }
  q += ")";

  return q;
}

// Verifica si el cliente ha iniciado sesión segun el token y lo retorna
function getSessionFromToken(token)
{
  // Recorre el arreglo de tokens
  for( var i = 0; i < sessions.length; i++ )
  {

    // Si existe el token lo retorna
    if( sessions[i].credentials.access_token == token )
    {
      return sessions[i];
    }

  }

  // Si no encuentra el token retorna falso
  return false;
}

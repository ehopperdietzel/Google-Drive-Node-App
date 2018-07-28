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

// Activa el parseo para los POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Almacena las sesiones desde varios origenes ( Más de un usuario conectado a la cuenta admin )
var sessions = new Array();

// Lee las configuraciones
const conf = require(__dirname + "/conf/conf.json");

// Instancia de Google Drive
var drive = google.drive('v3');

// Instancia de Google Plus ( Única forma de verificar email )
var plus = google.plus('v1');

// Envía la página de inicio ( Sin parámetros de entrada, retorna la página de inicio HTML )
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/html/index.html');
});

// Genera un URL para iniciar sesión ( Sin parámetros de entrada, retorna el URL string )
app.get('/loginUrl', function (req, res) {

  // Genera el URL
  var generator = new google.auth.OAuth2(conf.client_id, conf.client_secret,conf.redirect_uris);
  const url = generator.generateAuthUrl({ access_type: 'offline', scope: conf.scopes });

  //Envía el URL al cliente
  res.send(url);
});

app.get('/login', function (req, res) {

  // Detecta si existe el código de verificación en la redirección del login
  if(req.query.code)
  {
    // Crea un nuevo cliente OAuth2
    var admin = new google.auth.OAuth2(conf.client_id, conf.client_secret,conf.redirect_uris);

    // Obtiene el token a partir del código de verificación
    admin.getToken(req.query.code, (err, token) => {

      // Si ocurre un error con la verificación
      if (err)
      {
        console.log(err);
        return;
      }

      // Asigna el token al cliente
      admin.setCredentials(token);

      // Verifica si el email corresponde al del admin
      plus.people.get({
          auth: admin,
          userId: 'me'
      }, function (err, user) {

        // Si ocurre un error con Google
        if( err ) {
          console.log(err)
          return;
        }

        // Si existen emails
        if( user.data.emails )
        {
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

              // Redirige al cliente a la página de inicio
              res.sendFile(__dirname + '/html/index.html');
              return;
            }
          }
          // Si el usuario no es el admin
          res.send("Usuario no permitido.");
        }
      });
    });
  }

  // En caso contrario retorna error.
  else res.status(401).send("Constraseña Incorrecta.");

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
    res.status(400).send("Request errónea.");
    return;
  }

  // Envía el request a Google Drive
  drive.files.list({
    auth: admin,
    types:conf.mimeTypes,
    q: "'" + req.query.fileId + "' in parents and " + mimeTypesQuery() },
    function (err, files)
    {
      if (err)
      {
        res.status(500).send(err);
        return;
      }

      // Éxito
      res.send(JSON.stringify(files.data.files));
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
    res.status(400).send("Request errónea.");
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
      if (err)
      {
        res.status(500).send(err);
        return;
      }

      // Éxito
      res.send(ans.data.id);
    });
});

app.patch('/moveFile', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

  // Se obtienen los IDs de los directorios padre anteriores
  drive.files.get({
    auth: admin,
    fileId: req.body.fileId,
    fields: 'parents'
    },function (err, file)
    {

    if (err)
    {
      console.error(err);
    }
    else
    {
      console.log(file);
      // Obtiene los padres viejos
      var oldParents = file.data.parents;

      // Le asigna el nuevo padre
      drive.files.update({
        auth: admin,
        fileId: req.body.fileId,
        addParents: req.body.parent,
        removeParents: oldParents
        },function (err, file)
        {
        if (err)
        {
          console.error(err);
        } else
        {
          // El ha sido movido
          console.log(file);
        }
      });
    }
  });
});

app.patch('/renameFile', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

  drive.files.update({
    auth: admin,
    fileId: req.body.fileId,
    resource:{
      name: req.body.name,
    }
    },
    function (err, ans)
    {
      if (err)
      {
        console.log(err);
        res.send("No se pudo reenviar el archivo.");
      }
      else
      {
        // Retorna (kind,id,name,mimeType)
        console.log(ans);
      }
    });
});

app.post('/createDoc', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

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
      if (err)
      {
        console.log(err);
        res.send("No se pudo crear el archivo.");
      }
      else
      {
        // Retorna (kind,id,name,mimeType)
        console.log(ans);
      }
    });
});

app.post('/createDir', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

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
      if (err)
      {
        console.log(err);
        res.send("No se pudo crear el directorio.");
      }
      else
      {
        // Retorna (kind,id,name,mimeType)
        console.log(ans);
      }
    });
});

app.get('/downloadPdf', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

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
      if (err)
      {
        console.log(err);
        res.send("No se pudo generar el link de descarga.");
      }
      else
      {
        const dest = fs.createWriteStream(__dirname + "/pdf/demo.pdf");
        ans.data.on('error', err =>
        {
            console.log(err);
        }).on('end', ()=>{
            console.log("OK");
        }).pipe(dest);
      }
    });
});

app.post('/createFilePermission', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

  drive.permissions.create({
    auth:admin,
    resource: req.body.permission,
    fileId: req.body.fileId,
  }, function (err, ans) {
    if (err)
    {
      console.error(err);
    }
    else
    {
      console.log(ans);

      /*
      data:
  { kind: 'drive#permission',
    id: '00438897399906863672',
    type: 'user',
    role: 'writer' } }
    */
    }
  });
});

app.delete('/deleteFilePermission', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

  drive.permissions.delete({
    auth:admin,
    permissionId: req.body.permissionId,
    fileId: req.body.fileId,
  }, function (err, ans) {
    if (err)
    {
      console.error(err);
    }
    else
    {
      console.log(ans);
    }
  });
});

app.patch('/updateFilePermission', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

  drive.permissions.update({
    auth:admin,
    permissionId: req.body.permissionId,
    fileId: req.body.fileId,
    resource:{
      role: req.body.role
    }
  }, function (err, ans) {
    if (err)
    {
      console.error(err);
    }
    else
    {
      console.log(ans);
    }
  });
});

app.get('/listFilePermissions', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

  drive.permissions.list({
    auth:admin,
    fileId: req.query.fileId
  }, function (err, ans) {
    if (err)
    {
      console.error(err);
    }
    else
    {
      console.log(ans);

      /*
      {
        "kind": "drive#permissionList",
        "nextPageToken": string,
        "permissions": [
          permissions Resource
        ]
      }
      */
    }
  });
});

app.get('/listPermissionInfo', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin)
  {
    res.send("Error");
    return;
  }

  drive.permissions.list({
    auth:admin,
    fileId: req.body.fileId,
    permissionId: req.body.permissionId
  }, function (err, ans) {
    if (err)
    {
      console.error(err);
    }
    else
    {
      console.log(ans);
    }
  });
});



// Inicia el servidor en el puerto establecido en el archivo conf.json
app.listen(conf.port, function () {
  console.log('Servidor local corriendo en http://localhost:' + conf.port + ".");
});


// Comprueba que exista el número de parámetros requeridos en un request
function invalidRequest(query,length)
{
  if( Object.keys(query).length === length )
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

// Verifica si un token existe
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

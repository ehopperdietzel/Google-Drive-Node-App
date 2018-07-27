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
const fs = require('fs');

// Módulo de las APIs de Google
const {google} = require('googleapis');

// Módulo para manipular cookies
var cookieParser = require('cookie-parser')

// Módulo Express utilizado para simplificar la API REST
var express = require('express');

// Instancia de Express
var app = express();

// Activa el uso de cookies, para almacenar los tokens en los requests
app.use(cookieParser());

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

// Genera una lista con los archivos y directorios de otro ( Entrada id (ID del directorio), retorna una lista con los archivos )
app.get('/listDir', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin || !req.query.id)
  {
    res.send("Error");
    return;
  }

  var query = "'" + req.query.id + "' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/vnd.google-apps.document')";
  drive.files.list({
    auth: admin,
    q: query },
    function (err, files)
    {
      if (err)
      {
        console.log(err);
      }
      else
      {
        res.send(JSON.stringify(files.data.files));
      }
    });
});

/*
app.post('/copyFile', function (req, res) {

  var admin = getSessionFromToken(req.cookies.token);

  if(!admin || !req.query.id)
  {
    res.send("Error");
    return;
  }

  var query = "'" + req.query.id + "' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/vnd.google-apps.document')";
  drive.files.list({
    auth: admin,
    q: query },
    function (err, files)
    {
      if (err)
      {
        console.log(err);
      }
      else
      {
        res.send(JSON.stringify(files.data.files));
      }
    });
});
*/

// Inicia el servidor en el puerto establecido en el archivo conf.json
app.listen(conf.port, function () {
  console.log('Servidor local corriendo en http://localhost:' + conf.port + ".");
});


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

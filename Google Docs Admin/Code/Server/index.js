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

// Módulo Express utilizado para simplificar la API REST
var express = require('express');

// Instancia de Express
var app = express();

// Almacena los Tokens
var tokens = new Array();

// Path al Session Key ( No se debe compartir ese archivo! )
const privatekey = require(__dirname + "/conf/key.json");

// Path a las configuraciones
const conf = require(__dirname + "/conf/conf.json");

// Instancia de Google Drive
let drive = google.drive('v3');

// Genera los datos del Jason Web Token a partir de PrivateKey.json
const admin = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  ['https://www.googleapis.com/auth/drive']
);

// Autoriza el Jason Web Token
admin.authorize((err, toks) =>
{
  // Si el token es inválido se detiene el servidor
  if (err)
  {
    console.log(err);
    return;
  }

  console.log("Conectado a Google Drive.")


  /************************************************
   ** Solicitud de página de inicio
   ** Método: GET
   ** Input:  null
   ** Output: interface.html
  *************************************************/

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/html/interface.html');
  });

  /************************************************
   ** Solicitud de inicio de sesión
   ** Método: GET
   ** Input:  password:string
   ** Output: token:string
  *************************************************/

  app.get('/login', function (req, res) {

    // Si la contraseña es igual a la almacenada en conf.json retorna un token
    if( req.query.password == conf.password )
    {
      // Genera un token y lo almacena. Se elimina si el admin no ha interactuado en 3 horas ( Cierra sesión )
      const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      tokens.push( { token:newToken, lastTime:new Date() } );

      // Envía la respuesta con el token
      res.status(200).send( newToken );
    }

    // En caso contrario retorna error.
    else res.status(401).send("Constraseña Incorrecta.");

  });

  /************************************************
   ** Crear nuevo directorio
   ** Método: POST
   ** Input:  nombre:string,idPadre:string,
   ** Output: token:string
  *************************************************/

  drive.files.list({
  auth: admin,
  q: "name contains 'a'"
  }, function (err, response) {
  if (err) {
     console.log('The API returned an error: ' + err);
     return;
  }
  var files = response.files;
  if (files.length == 0) {
     console.log('No files found.');
  } else {
     console.log('Files from Google Drive:');
     for (var i = 0; i < files.length; i++) {
         var file = files[i];
         console.log('%s (%s)', file.name, file.id);
     }
  }
  });

  app.get('/getFiles', function (req, res) {

  });

  // Inicia el servidor en el puerto establecido en el archivo conf.json
  app.listen(conf.port, function () {
    console.log('Servidor local corriendo en http://localhost:' + conf.port + ".");
  });

});

/*
//creating the folder in drive
  function createFolder(name,folderId,next) {
    var folderIds=[];
    if(folderId !== null){
      folderIds.push(folderId);
    }
    var fileMetadata = {
      'name' : name,
      'mimeType' : 'application/vnd.google-apps.folder',
       parents: folderIds
    };
    drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    }, function(err, file) {
      if(err) {
        console.log("error creating folder: ",err);
        next(err);
      } else {
        console.log('Folder Id: ', file.id);
        next(err,file.id);
      }
    });
  }
*/
// Verifica si un token existe y elimina los caducados
function checkToken(token)
{
  // Obtiene el tiempo actual
  const currentTime = new Date();

  // Largo del arreglo
  var length = tokens.length;

  // Recorre el arreglo de tokens
  for( var i = 0; i < length; i++ )
  {

    // Si el token no se ha utilizado en 3 horas se elimina
    if( Math.abs(tokens[i].lastTime.getTime() - currentTime.getTime()) / 1000*60 > 60*3)
    {
      tokens.splice(i, 1);
      length--;
    }

    // Si existe el token retorna verdadero y actualiza su ultima fecha
    if( tokens[i].token == token )
    {
      tokens[i].lastTime = new Date();
      return true;
    }

  }

  // Si no encuentra el token retorna falso
  return false;
}

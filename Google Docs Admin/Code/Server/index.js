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

// Puerto del Servidor
const port = 3000;

// Path al PrivateKey ( No se debe compartir ese archivo! )
const privatekey = require(__dirname + "/GoogleData/PrivateKey.json");

// Genera los datos del Jason Web Token a partir de PrivateKey.json
const admin = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  ['https://www.googleapis.com/auth/drive'],
  null
);

// Instancia de Google Drive
var drive = google.drive({ version: 'v3', auth: admin });

// Autoriza el Jason Web Token
admin.authorize((err) =>
{
  // Si el token es inválido se detiene el servidor
  if (err) return;

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/html/interface.html');
  });

  // Inicia el servidor
  app.listen(port, function () {
    console.log('Servidor local corriendo en http://localhost:' + port + ".");
  });

});

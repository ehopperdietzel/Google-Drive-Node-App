/****************************************************************************
**
** Cuarzo Software - 2018
** Eduardo Hopperdietzel - Informatic Engineer
** Universidad Austral de Chile
** Contact: ehopperdietzel@gmail.com
**
** UrlFixer.js
**
****************************************************************************/


// Runs when the website finishes loading
window.onload = function()
{
  // Get all the <a> tags
  var links = document.getElementsByTagName("a");

  // Hostname
  var host = window.location.host.toLowerCase();

  // Iterators
  var url,i;

  // Loop through all the <a> tags
  for( i = 0; i<links.length; i++ )
  {
    // Get the tag url
    url = links[i].getAttribute("href");

    // If the url is not empty
    if( url != null )
    {
      // Url to LowerCase
      url = url.toLowerCase();

      // If url contains the hostname
      if( url.indexOf(host) >= 0)
      {
        links[i].setAttribute("target","_self");
      }
      // Else
      else
      {
        links[i].setAttribute("target","_blank");
      }
    }
  }
}

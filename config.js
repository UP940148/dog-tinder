const path = require('path');

//Define directories
module.exports.www = path.join(__dirname, '/www/');
module.exports.imageStore = path.join(__dirname, '/www/img/');

const credentials = {"web" : {
                    "client_id" : "822838802672-akgmgc8v5i3samscg7dogk0v592oa78q.apps.googleusercontent.com",
                    "project_id" : "dogtinder",
                    "auth_uri" : "https://accounts.google.com/o/oauth2/auth",
                    "token_uri" : "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url" : "https://www.googleapis.com/oauth2/v1/certs",
                    "client_secret" : "B_SKxP50yAlogpmIynsHtfDu",
                    "redirect_uris" : ["http://localhost:8080/oauth2callback"]
                  }};

module.exports.CLIENT_ID = credentials.web.client_id;
module.exports.CLIENT_SECRET = credentials.web.client_secret;


module.exports.PREFERRED_PORT = 8080;

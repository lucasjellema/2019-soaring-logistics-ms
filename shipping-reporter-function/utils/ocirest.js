var https = require('https');
var httpSignature = require('http-signature');
var jsSHA = require('jssha');
const sshpk = require('sshpk')

function process(auth, options, callback) {

  // process request body
  var body;
  if (options.headers['content-type'] == 'application/x-www-form-urlencoded')
    body = options.body;
  else
    body = JSON.stringify(options.body);
//  delete options.body;

  // begin https request
  var request = https.request(options, handleResponse(callback));
  // copy auth to options
  options = Object.assign(options, auth)

  // sing the headers
    sign(auth, request,options);

  // send the body and close the request
  request.write(body === undefined ? '' : body);
  request.end();
}

// signing function as described at https://docs.cloud.oracle.com/Content/API/Concepts/signingrequests.htm
// BUT with 2 changes to support private keys encrypted with a passphrase
function sign (auth,request, options) {
  var keyId = options.tenancyId + '/' + options.userId + '/' + options.keyFingerprint
  // 1. Decrypt the private key using the passphrase
  let key = sshpk.parsePrivateKey(options.privateKey, 'auto', { passphrase: options.passphrase })

  var headersToSign = [
    'host',
    'date',
    '(request-target)'
  ]

  var methodsThatRequireExtraHeaders = ['POST', 'PUT']

  if (methodsThatRequireExtraHeaders.indexOf(request.method.toUpperCase()) !== -1) {
    options.body = options.body || ''

    var shaObj = new jsSHA('SHA-256', 'TEXT')
    shaObj.update(options.body)

    request.setHeader('Content-Length', options.body.length)
    request.setHeader('x-content-sha256', shaObj.getHash('B64'))

    headersToSign = headersToSign.concat([
      'content-type',
      'content-length',
      'x-content-sha256'
    ])
  }

  httpSignature.sign(request, {
    key: key.toBuffer('pem', {}), // 2. Format the decrypted Key as pem
    keyId: keyId,
    headers: headersToSign
  })

  var newAuthHeaderValue = request.getHeader('Authorization').replace('Signature ', 'Signature version="1",')
  request.setHeader('Authorization', newAuthHeaderValue)
}//sign


// generates a function to handle the https.request response object
function handleResponse(callback) {
  return function (response) {
    var contentType = response.headers['content-type'];
    var JSONBody = '';
    var buffer = [];

    response.on('data', function (chunk) {
      if (contentType == 'application/json')
        JSONBody += chunk;
      if (contentType == 'application/x-www-form-urlencoded')
        buffer.push(Buffer.from(chunk, 'binary'));
      if (contentType == 'application/octet-stream')
        buffer.push(chunk);
    });

    response.on('end', function () {
      if (contentType == 'application/x-www-form-urlencoded' ||
        contentType == 'application/octet-stream') {
        var binary = Buffer.concat(buffer);
        callback(binary);
      }
      if (contentType == 'application/json' && JSONBody != '')
        callback(JSON.parse(JSONBody));
    });

  }
};


function buildHeaders(possibleHeaders, options, bString) {
  var headers = {};
  headers['content-type'] = bString ? 'application/x-www-form-urlencoded' : 'application/json';
  headers['user-agent'] = 'Mozilla/5.0';
  for (var i = 0; i < possibleHeaders.length; i++)
    if (possibleHeaders[i].toLowerCase() in options)
      headers[possibleHeaders[i].toLowerCase()] = options[possibleHeaders[i]];
  return headers;
};

function buildQueryString(possibleQuery, options) {
  var query = '';
  for (var i = 0; i < possibleQuery.length; i++)
    if (possibleQuery[i] in options)
      query += (query == '' ? '?' : '&') + possibleQuery[i] + '=' + encodeURIComponent(options[possibleQuery[i]]);
  return query;
};

module.exports = {
  process: process,
  buildHeaders: buildHeaders,
  buildQueryString: buildQueryString
};

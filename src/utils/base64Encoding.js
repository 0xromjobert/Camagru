function encodeBase64(str) {
  return Buffer.from(str).toString('base64')
  .replace(/=/g, '')                      // Remove padding
  .replace(/\+/g, '-')                    // Replace '+' with '-'
  .replace(/\//g, '_');                   // Replace '/' with '_'
  ;
}

function decodeBase64(data) {
    const str = data.replace(/-/g, '+').replace(/_/g, '/');
    const paddedStr = padding64Url(str);  // Add padding if necessary
    return Buffer.from(paddedStr, 'base64').toString();
}

function padding64Url(str) {
    while (str.length % 4 !== 0) {
        str += '=';
    }
    return str;
}
module.exports = { decodeBase64, encodeBase64 };
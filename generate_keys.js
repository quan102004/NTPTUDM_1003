const fs = require('fs');
const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

fs.writeFileSync('d:\\workspace\\NTPTUDM_1003\\public.key', publicKey);
fs.writeFileSync('d:\\workspace\\NTPTUDM_1003\\private.key', privateKey);
console.log('Keys generated successfully');

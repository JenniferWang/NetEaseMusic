/**
 * Reference: https://github.com/stkevintan/nw_musicbox
 */

const bignum = require('bignum');
const crypto = require('crypto');
const {reverse} = require('esrever');
const invariant = require('invariant');

type Response = any;

// Magic numbers from
// https://blog.tompawlak.org/generate-random-values-nodejs-javascript
const RSA_MODULUS = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
const RSA_PUBLIC_KEY = '010001';
const AES_NONCE = '0CoJUm6Qyw8W8jud';
// This cannot be a random salt... which is wierd
const AES_INITIAL_VALUE = '0102030405060708';

function randomString(size: number): /* utf-8 */ string {
  if (size < 1) {
    return '';
  }
  return crypto.randomBytes(Math.ceil(size * 3 / 4))
    .toString('base64')   // convert to base64 format
    .slice(0, size)       // return required number of characters
    .replace(/\+/g, '0')  // replace '+' with '0'
    .replace(/\//g, '0'); // replace '/' with '0'
}

function md5(text: string): string {
  return crypto
    .createHash('md5')
    .update(text)
    .digest('hex');
}

function aesEncrypt(
  /* utf8 */ text: string,
  /* utf8 */ secretKey: string
): /* base64 */ string {
  const cipher = crypto.createCipheriv(
    'aes-128-cbc',
    secretKey,
    AES_INITIAL_VALUE
  );
  let encryptedText = cipher.update(
    text,
    /* input-encoding  */ 'utf8',
    /* output-encoding */ 'base64'
  );
  return encryptedText + cipher.final('base64');
}

function rsaEncrypt(
  /* utf8 */ text: string,
  /* hex  */ publicKey: string,
  /* hex  */ modulus: string
): /* hex */ string {
  const reversedText = reverse(text);

  // trim padding zeros
  // $FlowFixMe
  const zeros = modulus.match(/^0*/gi)[0];
  const trimmedModulus = modulus.substr(zeros.length, modulus.length);
  invariant(
    reversedText.length < trimmedModulus.length,
    'rsaEncrypt: text length should smaller than the modulus length'
  );

  const base = 16;
  const b16Text = Buffer.from(reversedText).toString('hex');

  // int(text) ** int(pubKey) % int(modulus, 16)
  const encryptedText = bignum(b16Text, base)
    .powm(bignum(publicKey, base), bignum(modulus, base))
    .toString(base);

  // padding
  return '0'.repeat(trimmedModulus.length - encryptedText.length) + encryptedText;
}

function encryptRequest(
  data: Object
): {
  params: string,
  encSecKey: string
} {
  const secondKey = randomString(16);
  const encryptedData = aesEncrypt(
    aesEncrypt(JSON.stringify(data), AES_NONCE),
    secondKey
  );

  return {
    params: encryptedData,
    encSecKey: rsaEncrypt(secondKey, RSA_PUBLIC_KEY, RSA_MODULUS)
  };
}

module.exports = {
  encryptRequest,
  md5,
};

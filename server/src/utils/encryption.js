const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;

const encryptToken = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const salt = crypto.randomBytes(saltLength);

  const key = crypto.pbkdf2Sync(process.env.ENCRYPTION_KEY, salt, 100000, 32, 'sha512');

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
};

const decryptToken = (encryptedData) => {
  const buffer = Buffer.from(encryptedData, 'base64');

  const salt = buffer.subarray(0, saltLength);
  const iv = buffer.subarray(saltLength, saltLength + ivLength);
  const tag = buffer.subarray(saltLength + ivLength, saltLength + ivLength + tagLength);
  const encrypted = buffer.subarray(saltLength + ivLength + tagLength);

  const key = crypto.pbkdf2Sync(process.env.ENCRYPTION_KEY, salt, 100000, 32, 'sha512');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final('utf8');
};

module.exports = { encryptToken, decryptToken };
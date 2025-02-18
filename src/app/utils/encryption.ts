// @ts-ignore
import crypto from 'crypto-browserify';

const SECRET_KEY = crypto.randomBytes(32); // 🔐 Clave de 32 bytes
const IV = crypto.randomBytes(16); // 🔄 Vector de Inicialización (16 bytes)

export function encryptData(data: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, IV);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${IV.toString('hex')}:${encrypted}`; // Guardamos IV + mensaje cifrado
}

const SECRET_KEY_HEX = "a77304d85ef3e682bd95b4b25278944d870f8ab9cccd54310981525ddea76a3f";
const SECRET_KEY = hexToUint8Array(SECRET_KEY_HEX);

// Función para cifrar
export async function encryptData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    SECRET_KEY,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(data)
  );

  return `${arrayBufferToHex(iv)}:${arrayBufferToHex(encrypted)}`;
}

// Función para desencriptar
export async function decryptData(encryptedData: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {

      // 🔹 Verificar si los datos ya están en texto plano y evitar desencriptar
      if (!encryptedData || typeof encryptedData !== "string") {
        console.error("Error: Valor inválido o vacío para desencriptar:", encryptedData);
        reject("Datos inválidos para desencriptar.");
        return;
      }

      if (!encryptedData.includes(":")) {
        /* Ya se envian desencriptados por ello se comenta esa linea  
        console.warn("Advertencia: Los datos no están cifrados, se devuelven tal cual:", encryptedData);
            */
        resolve(encryptedData);
        return;
      }

      const [ivHex, encryptedHex] = encryptedData.split(":");

      const iv = hexToUint8Array(ivHex);
      const encrypted = hexToUint8Array(encryptedHex);

      const key = await window.crypto.subtle.importKey(
        "raw",
        SECRET_KEY,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );

      const decryptedData = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted
      );

      resolve(new TextDecoder().decode(decryptedData));
    } catch (error) {
      console.error("Error al descifrar:", error);
      reject("");
    }
  });
}


// Convertir ArrayBuffer a Hex
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Convertir Hex a Uint8Array
function hexToUint8Array(hex: string): Uint8Array {
  if (!hex || typeof hex !== 'string') {
    console.error('Error: hex no es una cadena válida:', hex);
    return new Uint8Array(); // Retorna un Uint8Array vacío en caso de error
  }

  const matchedHex = hex.match(/.{1,2}/g);
  if (!matchedHex) {
    console.error('Error: Formato de hex incorrecto:', hex);
    return new Uint8Array();
  }

  return new Uint8Array(matchedHex.map(byte => parseInt(byte, 16)));
}


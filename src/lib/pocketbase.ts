import PocketBase from 'pocketbase';

// 🟢 MODO AUTOMÁTICO INTELIGENTE
// Esto detecta si entraste por "localhost", "127.0.0.1" o una IP de red (ej: 192.168.x.x)
// y asume que PocketBase está corriendo en el puerto 8090 de esa misma dirección.
const url = `http://${window.location.hostname}:8090`;

export const pb = new PocketBase(url);

pb.autoCancellation(false);
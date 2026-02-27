// src/utils/shippingService.js

export const calcularDistanciaReal = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2)); // Retorna km con 2 decimales
};

export const calcularEnvio = (distanciaKm) => {
  const COSTO_BASE = 500;
  const COSTO_POR_KM = 150;
  // Si estás a menos de 300 metros, el envío es gratis
  if (distanciaKm <= 0.3) return 0;
  return Math.round(COSTO_BASE + (distanciaKm * COSTO_POR_KM));
};

export const ESTADOS_PEDIDO = {
  PROCESO: 'proceso',
  COMPLETADO: 'completado'
};
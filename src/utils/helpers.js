export const URL_CARPETA_IMAGENES = "https://res.cloudinary.com/dwpgncjgn/image/upload/f_auto,q_auto/v1/PRODUCTOS/";

export const generarNombreImagen = (tipo, marca, contenido) => {
  if (!tipo) return "producto-sin-nombre";

  const t = tipo.trim();
  const m = marca ? marca.trim() : "";
  const c = contenido ? contenido.trim() : "";

  // Filtramos para que no queden espacios dobles si la marca está vacía
  // Luego reemplazamos espacios por guiones
  const nombreLimpio = `${t} ${m} ${c}`
    .replace(/\s+/g, ' ') // Quita espacios dobles si m está vacío
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quita acentos
    .replace(/[.]/g, '')             // Quita puntos (1.8kg -> 18kg)
    .replace(/[^a-z0-9\s-]/g, "")    // Quita símbolos
    .replace(/\s+/g, '-')            // Espacios a guiones
    .replace(/-+/g, '-')             // Quita guiones dobles
    .replace(/^-+|-+$/g, "");        // Limpia extremos

  return nombreLimpio;
};
/**
 * Calcula la distancia en kilómetros entre dos puntos geográficos 
 * usando la fórmula de Haversine.
 */
export const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Valida si un producto puede ser agregado al carrito según las reglas de negocio.
 */
export const validateCartAddition = (cart, nuevoProducto) => {
    if (cart.length > 0) {
        // Obtenemos el ID del local del primer item en el carrito
        // Manejamos tanto objetos poblados como IDs simples
        const localIdCarrito = cart[0].local._id || cart[0].local;
        const localIdNuevo = nuevoProducto.local._id || nuevoProducto.local;
        
        if (localIdCarrito !== localIdNuevo) {
            return { 
                valid: false, 
                msg: "Solo puedes pedir productos de un mismo local por vez." 
            };
        }
    }
    
    return { valid: true };
};
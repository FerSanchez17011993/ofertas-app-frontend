import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart_ofertas_v1');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart_ofertas_v1', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (producto) => {
        setCart((prevCart) => {
            const itemExists = prevCart.find((item) => item._id === producto._id);
            if (itemExists) {
                // Sincronizado con 'stock' en minúscula
                return prevCart.map((item) =>
                    item._id === producto._id 
                        ? { ...item, cantidad: Math.min(item.cantidad + 1, item.stock) } 
                        : item
                );
            }
            return [...prevCart, { ...producto, cantidad: 1 }];
        });
    };

    const updateQuantity = (id, newQty) => {
        if (newQty < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item._id === id) {
                    // Sincronizado con 'stock' en minúscula
                    const cantFinal = Math.min(newQty, item.stock);
                    return { ...item, cantidad: cantFinal };
                }
                return item;
            })
        );
    };

    const removeFromCart = (id) => setCart((prevCart) => prevCart.filter((item) => item._id !== id));
    const clearCart = () => setCart([]);

    // --- CÁLCULOS (Usando precioNuevo en minúscula) ---
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.precioNuevo * item.cantidad), 0);

    return (
        <CartContext.Provider value={{ 
            cart, addToCart, removeFromCart, updateQuantity, clearCart, 
            count: totalItems, 
            total: totalPrice 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

const TAX_RATE = 0.18;

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('Dine In');
  const [completedOrder, setCompletedOrder] = useState(null);

  // const addToCart = useCallback((item) => {
  //   setCart(prev => {
  //     const existing = prev.find(c => c.id === item.id);
  //     if (existing) {
  //       return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
  //     }
  //     return [...prev, { ...item, qty: 1 }];
  //   });
  // }, []);

  const addToCart = useCallback((item) => {
  setCart(prev => {
    const existing = prev.find(
      c => c.menuId === item.menuId
    );

    if (existing) {
      return prev.map(c =>
        c.menuId === item.menuId
          ? { ...c, qty: c.qty + 1 }
          : c
      );
    }

    return [
      ...prev,
      {
        menuId: item.menuId,
        itemName: item.itemName,
        imagePath: item.imagePath,
        price: item.price,
        category: item.category,
        qty: 1
      }
    ];
  });
}, []);

  // const removeFromCart = useCallback((id) => {
  //   setCart(prev => prev.filter(c => c.id !== id));
  // }, []);

  const removeFromCart = useCallback((menuId) => {
  setCart(prev =>
    prev.filter(c => c.menuId !== menuId)
  );
}, []);

  // const updateQuantity = useCallback((id, qty) => {
  //   if (qty <= 0) {
  //     setCart(prev => prev.filter(c => c.id !== id));
  //   } else {
  //     setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  //   }
  // }, []);

  const updateQuantity = useCallback((menuId, qty) => {
  if (qty <= 0) {
    setCart(prev =>
      prev.filter(c => c.menuId !== menuId)
    );
  } else {
    setCart(prev =>
      prev.map(c =>
        c.menuId === menuId
          ? { ...c, qty }
          : c
      )
    );
  }
}, []);


  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      subtotal, tax, total,
      orderType, setOrderType,
      completedOrder, setCompletedOrder,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

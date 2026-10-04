import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

/**
 * Cart state lives in React context and is persisted to localStorage,
 * so the cart survives page reloads. Each item stores a snapshot of the
 * product fields needed for display; the server recalculates prices at checkout.
 */
const STORAGE_KEY = 'shopnest.cart';
const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { product, quantity } = action;
      const existing = state.find((item) => item.id === product.id);
      if (existing) {
        return state.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item,
        );
      }
      const { id, name, slug, price, image_url, stock } = product;
      return [...state, { id, name, slug, price, image_url, stock, quantity }];
    }
    case 'update':
      return state
        .map((item) =>
          item.id === action.id
            ? { ...item, quantity: Math.max(0, Math.min(action.quantity, item.stock)) }
            : item,
        )
        .filter((item) => item.quantity > 0);
    case 'remove':
      return state.filter((item) => item.id !== action.id);
    case 'clear':
      return [];
    default:
      throw new Error(`Unknown cart action: ${action.type}`);
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    return {
      items,
      count,
      subtotal,
      addItem: (product, quantity = 1) => dispatch({ type: 'add', product, quantity }),
      updateQuantity: (id, quantity) => dispatch({ type: 'update', id, quantity }),
      removeItem: (id) => dispatch({ type: 'remove', id }),
      clearCart: () => dispatch({ type: 'clear' }),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

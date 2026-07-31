import { createSlice } from '@reduxjs/toolkit';

const storedCart = localStorage.getItem('cart');

const initialState = {
  items: storedCart ? JSON.parse(storedCart) : [],
  coupon: null,
};

const persist = (items) => localStorage.setItem('cart', JSON.stringify(items));

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { dishId, quantity = 1, price, name, image } = action.payload;
      const existing = state.items.find((item) => item.dishId === dishId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ dishId, quantity, price, name, image });
      }
      persist(state.items);
    },
    updateQuantity: (state, action) => {
      const { dishId, quantity } = action.payload;
      const item = state.items.find((i) => i.dishId === dishId);
      if (item) item.quantity = Math.max(1, quantity);
      persist(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.dishId !== action.payload);
      persist(state.items);
    },
    applyCoupon: (state, action) => {
      state.coupon = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      persist([]);
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, applyCoupon, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

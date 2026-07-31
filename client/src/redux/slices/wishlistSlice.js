import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ids: [],
  loaded: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.ids = action.payload;
      state.loaded = true;
    },
    toggleWishlistId: (state, action) => {
      const id = action.payload;
      state.ids = state.ids.includes(id) ? state.ids.filter((i) => i !== id) : [...state.ids, id];
    },
    clearWishlist: (state) => {
      state.ids = [];
      state.loaded = false;
    },
  },
});

export const { setWishlist, toggleWishlistId, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

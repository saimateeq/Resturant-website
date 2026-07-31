import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCartOpen: false,
  isMobileMenuOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

export const { toggleCart, toggleMobileMenu, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;

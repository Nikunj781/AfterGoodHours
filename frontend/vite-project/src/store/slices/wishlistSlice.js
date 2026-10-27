import { createSlice } from "@reduxjs/toolkit";

const KEY = "agh_wishlist";

const load = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persist = (items) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: { items: load() },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.some((p) => p._id === product._id);
      state.items = exists
        ? state.items.filter((p) => p._id !== product._id)
        : [{ ...product }, ...state.items];
      persist(state.items);
    },
    removeWishlist: (state, action) => {
      state.items = state.items.filter((p) => p._id !== action.payload);
      persist(state.items);
    },
  },
});

export const { toggleWishlist, removeWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

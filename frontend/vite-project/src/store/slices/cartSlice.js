import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axios";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/cart");
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

export const addToCart = createAsyncThunk("cart/add", async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const res = await api.post("/cart/add", { productId, quantity });
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to add to cart");
  }
});

export const updateCartItem = createAsyncThunk("cart/update", async ({ productId, quantity }, { rejectWithValue }) => {
  try {
    const res = await api.put("/cart/update", { productId, quantity });
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

export const removeFromCart = createAsyncThunk("cart/remove", async (productId, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cart/remove/${productId}`);
    return res.data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

export const clearCart = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try {
    await api.delete("/cart/clear");
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCartLocal: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.items = action.payload?.items || [];
      state.loading = false;
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(clearCart.fulfilled, (state) => { state.items = []; });
  },
});

export const { clearCartLocal } = cartSlice.actions;
export default cartSlice.reducer;


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/axios";

export const fetchProducts = createAsyncThunk("products/fetch", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/products", { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch products");
  }
});

export const fetchProduct = createAsyncThunk("products/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Product not found");
  }
});

export const fetchMyProducts = createAsyncThunk("products/fetchMy", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/products/seller/my");
    return res.data.products;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed");
  }
});

export const createProduct = createAsyncThunk("products/create", async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to create product");
  }
});

export const updateProduct = createAsyncThunk("products/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update product");
  }
});

export const deleteProduct = createAsyncThunk("products/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete product");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    currentProduct: null,
    myProducts: [],
    total: 0,
    pages: 1,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => { state.currentProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.currentProduct = action.payload; state.loading = false; })
      .addCase(fetchProduct.rejected, (state) => { state.loading = false; })
      .addCase(fetchMyProducts.fulfilled, (state, action) => { state.myProducts = action.payload; })
      .addCase(createProduct.fulfilled, (state, action) => { state.myProducts.unshift(action.payload); })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.myProducts = state.myProducts.map((p) => p._id === action.payload._id ? action.payload : p);
        if (state.currentProduct?._id === action.payload._id) state.currentProduct = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.myProducts = state.myProducts.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;


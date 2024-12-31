import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authStatus: false,
    user: null,
    isLoading: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.authStatus = true; 
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.authStatus = false; 
    },
  },
});

export const { setUser, setLoading, logout } = userSlice.actions;
export default userSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authStatus: false,
  user: null,
  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log("Setting user:", action.payload);
      state.authStatus = true;
      state.user = { ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
          profile: {
            ...state.user.profile,
            ...action.payload.profile,
          },
        };
      }
    },
    updateAvatar: (state, action) => {
      if (state.user?.profile) {
        state.user.profile.avatar = action.payload; // Update avatar
      }
    },
    removeAvatar: (state) => {
      if (state.user?.profile) {
        state.user.profile.avatar = null; // Remove avatar
      }
    },
    logout: (state) => {
      state.user = null;
      state.authStatus = false;
    },
  },
});

export const {
  setUser,
  setLoading,
  updateUser,
  updateAvatar,
  removeAvatar,
  logout,
} = userSlice.actions;
export default userSlice.reducer;

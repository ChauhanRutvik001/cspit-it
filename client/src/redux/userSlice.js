import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

// Async thunk for fetching the avatar blob URL
export const fetchAvatarBlob = createAsyncThunk(
  "user/fetchAvatarBlob",
  async (_, { getState, rejectWithValue }) => {
    const {
      app: { user },
    } = getState();
    const avatarId = user?.profile?.avatar;
    if (!avatarId) {
      return null;
    }
    try {
      const response = await axiosInstance.get("/user/profile/upload-avatar", {
        responseType: "blob",
      });
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      const blobUrl = URL.createObjectURL(response.data);
      return blobUrl;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  authStatus: false,
  user: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // When setting the user, initialize the avatarUrl to null
    setUser: (state, action) => {
      state.authStatus = true;
      state.user = { ...action.payload };
      if (state.user && state.user.profile) {
        state.user.profile.avatarUrl = null;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // Update user data merging profile updates
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
    // Update the avatar ID received from the backend
    updateAvatar: (state, action) => {
      if (state.user?.profile) {
        state.user.profile.avatar = action.payload;
      }
    },
    // Store the blob URL for the profile picture
    setAvatarBlobUrl: (state, action) => {
      if (state.user?.profile) {
        state.user.profile.avatarUrl = action.payload;
      }
    },
    // Clear both avatar ID and blob URL
    removeAvatar: (state) => {
      if (state.user?.profile) {
        state.user.profile.avatar = null;
        state.user.profile.avatarUrl = null;
      }
    },
    // Clear user state on logout
    logout: (state) => {
      state.user = null;
      state.authStatus = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvatarBlob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvatarBlob.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && state.user.profile) {
          state.user.profile.avatarUrl = action.payload;
        }
      })
      .addCase(fetchAvatarBlob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setUser,
  setLoading,
  updateUser,
  updateAvatar,
  setAvatarBlobUrl,
  removeAvatar,
  logout,
} = userSlice.actions;
export default userSlice.reducer;

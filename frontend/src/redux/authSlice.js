// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  tokenExpiry: localStorage.getItem('tokenExpiry') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const { user } = action.payload;
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day in ms
      state.user = user;
      state.tokenExpiry = expiry;
      state.token = user.Token;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokenExpiry', expiry);
      localStorage.setItem('token', user.Token);
    },
    logout(state) {
      state.user = null;
      state.tokenExpiry = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('token');
    },
    setUserFromStorage(state) {
      const storedUser = localStorage.getItem('user');
      const storedExpiry = localStorage.getItem('tokenExpiry');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedExpiry && Date.now() < parseInt(storedExpiry) && storedToken) {
        state.user = JSON.parse(storedUser);
        state.tokenExpiry = storedExpiry;
        state.token = storedToken;
      } else {
        state.user = null;
        state.tokenExpiry = null;
        state.token = null;
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('token');
      }
    },
  },
});

export const { login, logout, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;

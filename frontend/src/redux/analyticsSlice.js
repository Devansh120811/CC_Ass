
import { createSlice } from '@reduxjs/toolkit';

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    refreshCounter: 0,
  },
  reducers: {
    triggerRefresh(state) {
      state.refreshCounter += 1;
    },
  },
});

export const { triggerRefresh } = analyticsSlice.actions;
export default analyticsSlice.reducer;

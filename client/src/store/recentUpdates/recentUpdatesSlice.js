import { createSlice } from "@reduxjs/toolkit";

const recentUpdatesSlice = createSlice({
  name: "recentUpdates",
  initialState: null,
  reducers: {
    setRecentUpdates: (state, action) => {
      console.log(action.payload);
      return action.payload;
    },
    unsetRecentUpdates: () => {
      return null;
    },
  },
});

export const { setRecentUpdates, unsetRecentUpdates } =
  recentUpdatesSlice.actions;
export default recentUpdatesSlice.reducer;

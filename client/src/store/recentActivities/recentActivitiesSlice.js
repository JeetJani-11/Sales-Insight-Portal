import { createSlice } from "@reduxjs/toolkit";

const recentActivitiesSlice = createSlice({
  name: "recentActivites",
  initialState: null,
  reducers: {
    setRecentActivities: (state, action) => {
        console.log(action.payload);
      return action.payload;
    },
    unsetRecentActivities: () => {
      return null;
    },
  },
});

export const { setRecentActivities, unsetRecentActivities } =
  recentActivitiesSlice.actions;
export default recentActivitiesSlice.reducer;

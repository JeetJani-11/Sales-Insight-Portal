import { createSlice } from "@reduxjs/toolkit";

const nextStepsSlice = createSlice({
  name: "nextSteps",
  initialState: null,
  reducers: {
    setNextSteps: (state, action) => {
      return action.payload;
    },
    unsetNextSteps: () => {
      return null;
    },
  },
});

export const { setNextSteps, unsetNextSteps } = nextStepsSlice.actions;
export default nextStepsSlice.reducer;

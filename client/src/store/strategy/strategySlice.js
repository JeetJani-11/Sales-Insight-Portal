import { createSlice } from "@reduxjs/toolkit";

const strategySlice = createSlice({
  name: "strategy",
  initialState: null,
  reducers: {
    setStrategy: (state, action) => {
      return action.payload;
    },
    unsetStrategy: () => {
      return null;
    },
  },
});

export const { setStrategy, unsetStrategy } = strategySlice.actions;
export default strategySlice.reducer;
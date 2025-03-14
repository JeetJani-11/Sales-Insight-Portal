import { createSlice } from "@reduxjs/toolkit";

const needsAndRisksSlice = createSlice({
  name: "needsAndRisks",
  initialState: null,
  reducers: {
    setNeedsAndRisks: (state, action) => {
      return action.payload;
    },
    unsetNeedsAndRisks: () => {
      return null;
    },
  },
});

export const { setNeedsAndRisks, unsetNeedsAndRisks } =
  needsAndRisksSlice.actions;
export default needsAndRisksSlice.reducer;

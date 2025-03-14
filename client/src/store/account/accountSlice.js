import { createSlice } from "@reduxjs/toolkit";

const accountSlice = createSlice({
  name: "account",
  initialState: {
    exists: false,
  },
  reducers: {
    setAccount: (state, action) => {
      Object.assign(state, action.payload, { exists: true });
    },
    unsetAccount: () => {
      return { exists: false };
    },
  },
});
export const { setAccount, unsetAccount } = accountSlice.actions;
export default accountSlice.reducer;

import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./account/accountSlice";
import nextStepsReducer from "./nextSteps/nextStepsSlice";
import needsAndRisksReducer from "./needsAndRisks/needsAndRisksSlice";
import recentActivitiesSlice from "./recentActivities/recentActivitiesSlice";
import recentUpdatesSlice from "./recentUpdates/recentUpdatesSlice";
import strategySlice from "./strategy/strategySlice";
export const store = configureStore({
  reducer: {
    account: accountReducer,
    nextSteps: nextStepsReducer,
    needsAndRisks: needsAndRisksReducer,
    recentActivities: recentActivitiesSlice,
    recentUpdates: recentUpdatesSlice,
    strategy: strategySlice,
  },
});

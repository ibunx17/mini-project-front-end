import { configureStore } from "@reduxjs/toolkit";

import authSlice from "./slices/authSlice";
import searchSlice from "./slices/searchSlice";
import eventSlice from "./slices/eventSlice";
import seatSlice from "./slices/seatSlice";
export function makeStore() {
  return configureStore({
    reducer: {
      auth: authSlice,
      search: searchSlice,
      event: eventSlice,
      seat:seatSlice,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

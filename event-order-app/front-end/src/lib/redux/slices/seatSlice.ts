// src/lib/redux/slices/searchSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IEvent } from "@/interface/event.interface";

interface FilterState {
  seats : number;
  end_date : string | null,
}

const initialState: FilterState = {
  seats : 0,
  end_date : null,
};

const seatSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setRemainingSeats(state, action: PayloadAction<FilterState>) {
      state.seats = action.payload.seats;
      state.end_date = action.payload.end_date;
    }
  },
});

export const { setRemainingSeats} = seatSlice.actions;
export default seatSlice.reducer;
// src/lib/redux/slices/searchSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IEvent } from "@/interface/event.interface";
import { IEventCategoryParam } from "@/interface/event-category.interface";

interface FilterState {
  categories: IEventCategoryParam[];
  locations: string[]; 
}

const initialState: FilterState = {
  categories: [],
  locations: [],
};

const eventSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<IEventCategoryParam[]>) {
      state.categories = action.payload;
    },
    setLocations(state, action: PayloadAction<string[]>) {
      state.locations = action.payload;
    },
  },
});

export const { setCategories, setLocations } = eventSlice.actions;
export default eventSlice.reducer;
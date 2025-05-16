// src/lib/redux/slices/searchSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IEvent } from "@/interface/event.interface";

interface SearchState {
  keyword: string;
  results: IEvent[]; 
}

const initialState: SearchState = {
  keyword: "",
  results: [],
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setKeyword(state, action: PayloadAction<string>) {
      state.keyword = action.payload;
    },
    setSearchResults(state, action: PayloadAction<IEvent[]>) {
      state.results = action.payload;
    },
  },
});

export const { setKeyword, setSearchResults } = searchSlice.actions;
export default searchSlice.reducer;
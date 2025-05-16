import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IAuth {
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  role: string;
  referral_code: string;
  isLogin: boolean;
}

const initialState: IAuth = {
  email: "",
  first_name: "",
  last_name: "",
  profile_picture: "",
  role: "",
  referral_code: "",
  isLogin: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state: IAuth, action: PayloadAction<IAuth>) => {
      state.email = action.payload.email;
      state.first_name = action.payload.first_name;
      state.last_name = action.payload.last_name;
      state.profile_picture = action.payload.profile_picture; // Menyimpan image dari payload
      state.role = action.payload.role;
      state.referral_code = action.payload.referral_code;
      state.isLogin = true;
    },
    logout: (state: IAuth) => {
      state.isLogin = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;

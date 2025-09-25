import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export interface AuthState {
    email: string | null;
    password: string | null;
}

const initialState: AuthState = {
    email: null,
    password: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ email: string; password: string }>) => {
            state.email = action.payload.email;
            state.password = action.payload.password;
        },
        clearCredentials: (state) => {
            state.email = null;
            state.password = null;
        },
    },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
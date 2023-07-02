import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
    name: 'auth',
    initialState: { token: null, isAuth: false, login: null, profile_picture: null, rating: 0, role: null, id: undefined },
    reducers: {
        setCredentials: (state, action) => {
            const { jwt_token, login, profile_picture, rating, role, id } = action.payload.data;
            state.token = jwt_token;
            state.login = login;
            state.isAuth = true;
            state.profile_picture = profile_picture;
            state.rating = rating;
            state.role = role;
            state.id = id;
        },
        logOut: (state, action) => {
            state.token = null;
            state.login = null;
            state.isAuth = false;
            state.profile_picture = null;
            state.rating = null;
            state.role = null;
            state.id = null;
        }
    }
})
export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;
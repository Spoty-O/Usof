import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { API } from '../services/APIService'
import authReducer from '../services/authSlice'

const rootReducer = combineReducers({
    authReducer,
    [API.reducerPath]: API.reducer
})

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(API.middleware)
    })
}
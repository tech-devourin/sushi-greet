import { configureStore } from "@reduxjs/toolkit";
import States from "./States";

export const store = configureStore({
    reducer: { States },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./reducers/userSlice";
import wrapperReducer from "./reducers/wrapper.slice";

// Persist configuration for user reducer only
const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ['user', 'accessToken'] // Only persist these fields
};

// Apply persist to user reducer only
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

// Create the root reducer
const rootReducer = combineReducers({
  user: persistedUserReducer,
  wrapper: wrapperReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializableCheck for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

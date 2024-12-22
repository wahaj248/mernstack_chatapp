import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

const persistConfig = {
  key: "root",
  storage,
  blacklist: ['socketConnection'],
};


const reducer = combineReducers({
  user: userReducer,
});

const persistedUserReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedUserReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
})


export const persistor = persistStore(store);
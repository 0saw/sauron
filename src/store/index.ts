import { configureStore } from '@reduxjs/toolkit';
import { reviewerSlice } from './reviewer';
import { saveToLocalStorageMiddleware } from './middlewares/localStorage';

export const store = configureStore({
  reducer: {
    [reviewerSlice.name]: reviewerSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(saveToLocalStorageMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

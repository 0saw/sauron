import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { setIsVisible, setRepo, setStopList, setUser } from '../reviewer';

export const saveToLocalStorageMiddleware = createListenerMiddleware();

saveToLocalStorageMiddleware.startListening({
  matcher: isAnyOf(setIsVisible, setUser, setRepo, setStopList),
  effect: (action, listenerApi) =>
    localStorage.setItem(
      process.env.REACT_APP_STORAGE_KEY!,
      JSON.stringify(listenerApi.getState()),
    ),
});

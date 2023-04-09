import { combineReducers, configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';
import { createLoggerMiddleware } from '../middlewares/loggerMiddleware';
import { localClientSlice } from './localClientSlice';
import { remoteClientsSlice } from './remoteClientsSlice';

const reducer = combineReducers({
	localClient: localClientSlice.reducer,
	remoteClients: remoteClientsSlice.reducer,
});

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => 
  	getDefaultMiddleware(

	).concat(
		thunkMiddleware, 
		createLoggerMiddleware()
	),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

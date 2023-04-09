// import { createSelector } from '@reduxjs/toolkit';
import { RemoteClient, RemoteClientsState } from './remoteClientsSlice';
import { RootState } from './store';

// eslint-disable-next-line no-unused-vars
type Selector<S> = (state: RootState) => S;
export const selectRemoteClients: Selector<RemoteClientsState> = (state) => state.remoteClients;


// src/store/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RemoteClient = {
  clientId: string,
  userId?: string,
  mediaStreamId?: string,
  audioTrackId?: string,
  videoTrackId?: string,
}

export interface RemoteClientsState {
  clients: RemoteClient[],
}

const initialState: RemoteClientsState = {
  clients: []
};

export const remoteClientsSlice = createSlice({
  name: 'remoteClients',
  initialState,
  reducers: {
    add: ((state, action: PayloadAction<RemoteClient>) => {
      const newClient = action.payload;
      if (state.clients.find(c => c.clientId === newClient.clientId)) {
        return;
      }
      state.clients.push(newClient);
      // console.warn(`Added remote client`);
    }),
    remove: ((state, action: PayloadAction<string>) => {
      return {
        clients: state.clients.filter(c => c.clientId !== action.payload),
      }
    }),
    setAudioTrackId: ((state, action: PayloadAction<{ clientId: string, trackId?: string }>) => {
      const remoteClient = state.clients.find(c => c.clientId === action.payload.clientId);
      if (!remoteClient) {
        // console.warn(`setAudioTrackId(): Cannot find reote client`);
        return;
      }
      // console.warn(`Set the audio track`);
      remoteClient.audioTrackId = action.payload.trackId;
      // return {
      //   ...state,
      //   clients: [...state.clients],
      // };
    }),
    setVideoTrackId: ((state, action: PayloadAction<{ clientId: string, trackId?: string }>) => {
      const remoteClient = state.clients.find(c => c.clientId === action.payload.clientId);
      if (!remoteClient) {
        // console.warn(`setVideoTrackId(): Cannot find reote client`);
        return;
      }
      // console.warn(`Set the video track`);
      remoteClient.videoTrackId = action.payload.trackId;
      // return {
      //   ...state,
      //   clients: [...state.clients],
      // };
    }),
    
  },
});

export const remoteClientsActions = remoteClientsSlice.actions;


import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { getRandomDisplayName } from '../utils/randomUserIds';

export interface LocalClientState {
  clientId: string,
  userId?: string,
  audioTrackId?: string,
  videoTrackId?: string,
}

const initialState: LocalClientState = {
  clientId: uuid(),
  userId: getRandomDisplayName()
};

export const localClientSlice = createSlice({
  name: 'localClient',
  initialState,
  reducers: {
    setAudioTrackId: ((state, action: PayloadAction<string>) => {
      state.audioTrackId = action.payload;
    }),

    setVideoTrackId: ((state, action: PayloadAction<string>) => {
      state.videoTrackId = action.payload;
    }),
  },
});

export const localClientActions = localClientSlice.actions;


import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  geofenceCoordinates: string;
  geofenceRadius: string;
  faceLivenessThreshold: string;
  shiftGraceMinutes: string;
  lastSavedAt: string | null;
}

const initialState: SettingsState = {
  geofenceCoordinates: '19.0660° N, 72.8691° E (BKC Mumbai)',
  geofenceRadius: '150 meters',
  faceLivenessThreshold: '98.5% Confidence Score',
  shiftGraceMinutes: '15 Minutes',
  lastSavedAt: null,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return {
        ...state,
        ...action.payload,
        lastSavedAt: new Date().toISOString(),
      };
    },
    resetSettings: () => initialState,
  },
});

export const { updateSettings, resetSettings } = settingsSlice.actions;

export default settingsSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GameService } from "../../services/game.service";
import { GameProgress, Chapter, Level } from "../../types/game.types";

interface GameState {
  progress: GameProgress | null;
  chapters: Chapter[];
  levels: Level[];
  currentLevel: any | null;
  currentSession: any | null; 
  currentScreen: any | null; 
  loading: boolean;
  error: string | null;
}

const initialState: GameState = {
  progress: null,
  chapters: [],
  levels: [],
  currentLevel: null,
  currentSession: null,
  currentScreen: null,
  loading: false,
  error: null,
};

export const fetchGameProgress = createAsyncThunk(
  "game/fetchProgress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GameService.getProgress();
      if (response && response.data) {
        return response.data; // Return the data payload
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChapters = createAsyncThunk(
  "game/fetchChapters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await GameService.getChapters();
      // Ensure we extract the array from response.data
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response && Array.isArray(response)) {
          // Fallback if direct array
          return response;
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLevels = createAsyncThunk(
  "game/fetchLevels",
  async (chapterId: number | string, { rejectWithValue }) => {
    try {
      const response = await GameService.getLevels(chapterId);
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
       else if (response && Array.isArray(response)) {
          return response;
      }
      return [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLevelDetail = createAsyncThunk(
    "game/fetchLevelDetail",
    async (levelId: number | string, { rejectWithValue }) => {
        try {
            const response = await GameService.getLevelDetail(levelId);
            if(response && response.data) return response.data;
            return null;
        } catch (error: any) {
             return rejectWithValue(error.message);
        }
    }
);

export const startLevelSession = createAsyncThunk(
    "game/startSession",
    async (levelId: number | string, { rejectWithValue }) => {
        try {
             // startLevel returns: BaseApiResponse<{ session_id, level, current_screen }>
            const response = await GameService.startLevel(levelId);
             if(response && response.success && response.data) return response.data;
             return rejectWithValue(response?.message || "Failed to start level");
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
      updateCurrentScreen: (state, action) => {
          state.currentScreen = action.payload;
      },
      updateSessionScore: (state, action) => {
        // Optional score update logic
      },
      resetSession: (state) => {
          state.currentSession = null;
          state.currentScreen = null;
      }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGameProgress.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGameProgress.fulfilled, (state, action) => {
        state.loading = false;
        // payload is GameProgress
        state.progress = action.payload;
      })
      .addCase(fetchGameProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchChapters.fulfilled, (state, action) => {
        // payload is Chapter[]
        state.chapters = action.payload as any; 
      })
      .addCase(fetchLevels.pending, (state) => {
          state.loading = true;
      })
      .addCase(fetchLevels.fulfilled, (state, action) => {
          state.loading = false;
           // payload is Level[]
          state.levels = action.payload as any;
      })
      .addCase(fetchLevels.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
      })
      .addCase(fetchLevelDetail.fulfilled, (state, action) => {
          state.currentLevel = action.payload;
      })
      .addCase(startLevelSession.pending, (state) => {
          state.loading = true;
          state.error = null;
      })
      .addCase(startLevelSession.fulfilled, (state, action) => {
          state.loading = false;
          const data = action.payload; 
          // data: { sessionId, level, currentScreen }
          state.currentSession = { 
              id: data.sessionId,
              level: data.level
          };
          state.currentScreen = data.currentScreen;
      })
      .addCase(startLevelSession.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
      });
  },
});

export const { updateCurrentScreen, resetSession } = gameSlice.actions;
export default gameSlice.reducer;


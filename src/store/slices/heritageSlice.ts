import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { HeritageService } from "../../services/heritage.service";
import { HeritageSite, Artifact, TimelineEvent } from "../../types/heritage.types";

interface HeritageState {
  items: HeritageSite[];
  currentItem: HeritageSite | null;
  loading: boolean;
  error: string | null;
  artifacts: Artifact[];
  filteredArtifacts: Artifact[];
  timelineEvents: TimelineEvent[];
  nearbyItems: HeritageSite[];
  historyArticles: TimelineEvent[];
}

const initialState: HeritageState = {
  items: [],
  filteredArtifacts: [],
  currentItem: null,
  loading: false,
  error: null,
  artifacts: [],
  timelineEvents: [],
  nearbyItems: [],
  historyArticles: [],
};

export const fetchHeritageSites = createAsyncThunk(
  "heritage/fetchAll",
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await HeritageService.getAll(params);
      console.log("[fetchHeritageSites] Response:", JSON.stringify(response, null, 2));

      if (response && (response as any).success && (response as any).data) {
          return (response as any).data as HeritageSite[];
      }
      // Fallback if response is already the array
      if (Array.isArray(response)) {
          return response as HeritageSite[];
      }
      
      return [] as HeritageSite[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchHeritageDetail = createAsyncThunk(
  "heritage/fetchDetail",
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await HeritageService.getOne(id);
      console.log(`[fetchHeritageDetail] Response for ${id}:`, JSON.stringify(response, null, 2));
      
      // Robust unwrapping logic
      let data = response;
      
      // If it's an axios response with a data property that looks like our API response
      if (data && (data as any).data && (data as any).data.success) {
          data = (data as any).data;
      }
      
      // If it's our API response wrapper
      if (data && (data as any).success && (data as any).data) {
          console.log("[fetchHeritageDetail] Unwrapped data successfully");
          return (data as any).data;
      }

      // If it's just the data direct
      return data; 
    } catch (error: any) {
      console.error("[fetchHeritageDetail] Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchArtifacts = createAsyncThunk(
  "heritage/fetchArtifacts",
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await HeritageService.getArtifacts(id);
      // Backend returns { success: true, data: items }
       return response.data.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllArtifacts = createAsyncThunk(
  "heritage/fetchAllArtifacts",
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await HeritageService.getAllArtifacts(params);
      if (response && (response as any).success && (response as any).data) {
          return (response as any).data as Artifact[];
      }
      return [] as Artifact[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTimeline = createAsyncThunk(
    "heritage/fetchTimeline",
    async (id: number | string, { rejectWithValue }) => {
      try {
        const response = await HeritageService.getTimeline(id);
        if (response && (response as any).success && (response as any).data) {
            return (response as any).data as TimelineEvent[];
        }
        return [] as TimelineEvent[];
      } catch (error: any) {
        return rejectWithValue(error.message);
      }
    }
);

export const fetchNearbySites = createAsyncThunk(
    "heritage/fetchNearbySites",
    async ({lat, long}: {lat: number, long: number}, { rejectWithValue }) => {
      try {
        const response = await HeritageService.getNearby(lat, long);
        if (response && (response as any).success && (response as any).data) {
            return (response as any).data as HeritageSite[];
        }
        return [] as HeritageSite[];
      } catch (error: any) {
        return rejectWithValue(error.message);
      }
    }
);

export const fetchHistory = createAsyncThunk(
    "heritage/fetchHistory",
    async (params: any, { rejectWithValue }) => {
      try {
        const response = await HeritageService.getHistory(params);
        if (response && (response as any).success && (response as any).data) {
             return (response as any).data as TimelineEvent[];
        }
        return [] as TimelineEvent[];
      } catch (error: any) {
        return rejectWithValue(error.message);
      }
    }
);

export const fetchRelatedHeritage = createAsyncThunk(
    "heritage/fetchRelatedHeritage",
    async (ids: number[], { rejectWithValue }) => {
        try {
            if (!ids || ids.length === 0) return [];
            const response = await HeritageService.getByIds(ids);
            if (response && (response as any).success && (response as any).data) {
                return (response as any).data as HeritageSite[];
            }
            return [] as HeritageSite[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRelatedArticles = createAsyncThunk(
    "heritage/fetchRelatedArticles",
    async (ids: number[], { rejectWithValue }) => {
        try {
            if (!ids || ids.length === 0) return [];
            // Reuse getHistory with ids param
            const response = await HeritageService.getHistory({ ids: ids.join(',') });
            if (response && (response as any).success && (response as any).data) {
                return (response as any).data as TimelineEvent[];
            }
            return [] as TimelineEvent[];
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const heritageSlice = createSlice({
  name: "heritage",
  initialState,
  reducers: {
    clearCurrentItem: (state) => {
      state.currentItem = null;
      state.artifacts = [];
      state.timelineEvents = [];
      state.nearbyItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeritageSites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHeritageSites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchHeritageSites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHeritageDetail.fulfilled, (state, action) => {
        state.currentItem = action.payload;
      })
      .addCase(fetchArtifacts.pending, (state) => {
          // You might want separate loading state for artifacts or just fail silently
      })
      .addCase(fetchArtifacts.fulfilled, (state, action) => {
          state.artifacts = action.payload || [];
      })
      .addCase(fetchArtifacts.rejected, (state) => {
          state.artifacts = [];
      })
      .addCase(fetchAllArtifacts.pending, (state) => {
           state.loading = true;
      })
      .addCase(fetchAllArtifacts.fulfilled, (state, action) => {
           state.loading = false;
           state.filteredArtifacts = action.payload || [];
      })
      .addCase(fetchAllArtifacts.rejected, (state) => {
           state.loading = false;
           state.filteredArtifacts = [];
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
           state.timelineEvents = action.payload || [];
      })
      .addCase(fetchNearbySites.fulfilled, (state, action) => {
           state.nearbyItems = action.payload || [];
      })
      .addCase(fetchRelatedHeritage.fulfilled, (state, action) => {
           state.nearbyItems = action.payload || []; // Reusing nearbyItems for "Related Heritage" to simplify UI binding for now, or create new field
      })
      .addCase(fetchRelatedArticles.fulfilled, (state, action) => {
           state.timelineEvents = action.payload || []; // Update timeline/articles list for detail view
      })
      .addCase(fetchHistory.pending, (state) => {
           state.loading = true;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
           state.loading = false;
           state.historyArticles = action.payload || [];
      })
      .addCase(fetchHistory.rejected, (state) => {
           state.loading = false;
           state.historyArticles = [];
      });
  },
});

export const { clearCurrentItem } = heritageSlice.actions;
export default heritageSlice.reducer;

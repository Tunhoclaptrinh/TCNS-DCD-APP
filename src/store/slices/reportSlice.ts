import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ReportService, ReportOverview } from "../../services/report.service";

interface ReportState {
  overview: ReportOverview | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  overview: null,
  loading: false,
  error: null,
};

export const fetchOverview = createAsyncThunk(
  "report/fetchOverview",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ReportService.getOverview();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch report overview");
    }
  }
);

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default reportSlice.reducer;

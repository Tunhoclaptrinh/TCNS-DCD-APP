import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { NotificationService, Notification } from "../../services/notification.service";

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await NotificationService.getNotifications({ limit: 50 });

      // Khai phá an toàn array items
      let rawArray: any[] = [];
      let unreadCount = 0;

      if (Array.isArray(response)) {
        rawArray = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          rawArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          rawArray = response.data.data;
        } else if (response.data && Array.isArray(response.data.items)) {
          rawArray = response.data.items;
        } else if (Array.isArray(response.items)) {
          rawArray = response.items;
        }

        unreadCount = response.unreadCount ?? response.data?.unreadCount ?? 0;
      }

      // Map chuẩn format Frontend tránh thiếu trường
      const items = rawArray.map((item: any) => ({
        id: item.id || item._id,
        userId: item.userId || item.user_id,
        title: item.title || "Thông báo",
        message: item.message || "",
        type: item.type || "system",
        category: item.category,
        refId: item.refId,
        isRead: item.isRead ?? item.is_read ?? false,
        createdAt: item.createdAt || new Date().toISOString(),
      }));

      return { items, unreadCount };
    } catch (error: any) {
      console.error("NOTIFICATIONS ERROR:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const count = await NotificationService.getUnreadCount();
      return count;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: number, { rejectWithValue }) => {
    try {
      await NotificationService.markAsRead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await NotificationService.markAllAsRead();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await NotificationService.deleteNotification(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  "notifications/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      await NotificationService.clearAll();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.unreadCount = action.payload.unreadCount !== undefined && action.payload.unreadCount !== null
          ? action.payload.unreadCount
          : state.items.filter(item => !item.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.items.find((i) => i.id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const item = state.items.find(i => i.id === action.payload);
        if (item && !item.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.items = [];
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;

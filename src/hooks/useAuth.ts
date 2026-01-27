import {useCallback} from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/src/store";
import {login as loginAction, register as registerAction, logout as logoutAction, initializeAuth, updateUser} from "@/src/store/slices/authSlice";
import {AuthService} from "@/src/services/auth.service";
import {LoginRequest, RegisterRequest} from "../types";

export const useAuth = () => {
  const dispatch = useDispatch<any>();
  const {user, token, loading: isLoading, isAuthenticated} = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const result = await dispatch(loginAction(credentials)).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        const result = await dispatch(registerAction(data)).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const signOut = useCallback(async () => {
    try {
      await dispatch(logoutAction()).unwrap();
    } catch (error) {
      // Ignore error during logout
    }
  }, [dispatch]);

  const restoreSession = useCallback(async () => {
     await dispatch(initializeAuth());
  }, [dispatch]);

  /**
   * Bổ sung: Hàm làm mới thông tin user từ server
   * Sử dụng sau khi update profile, avatar...
   */
  const refreshUser = useCallback(async () => {
    try {
      // Gọi API /auth/me để lấy user & token mới nhất
      // Có thể dùng action riêng hoặc gọi trực tiếp service rồi dispatch updateUser
      const result = await AuthService.getMe();

      // Cập nhật lại vào store
      if (result) {
         dispatch(updateUser(result));
      }
      return result;
    } catch (error) {
      console.error("Refresh user failed:", error);
      throw error;
    }
  }, [dispatch]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    signOut,
    restoreSession,
    refreshUser,
  };
};

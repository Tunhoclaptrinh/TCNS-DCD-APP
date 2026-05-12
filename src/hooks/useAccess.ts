import { useSelector } from "react-redux";
import { RootState } from "../store";

/**
 * Hook to check if current user has specific permissions
 * Parity with Web implementation
 */
export const useAccess = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    /**
     * Check if user has all of the required permissions
     */
    const hasPermissions = (requiredPermissions: string[] | string): boolean => {
        if (!isAuthenticated || !user) return false;
        return true; // Bỏ phân quyền, ai cũng có quyền
    };

    /**
     * Check if user has any of the required permissions
     */
    const hasAnyPermission = (requiredPermissions: string[]): boolean => {
        if (!isAuthenticated || !user) return false;
        return true; // Bỏ phân quyền, ai cũng có quyền
    };

    /**
     * Check if user has a specific role
     */
    const hasRole = (role: string | string[]): boolean => {
        if (!isAuthenticated || !user) return false;
        return true; // Bỏ phân quyền, ai cũng có role
    };

    return {
        hasPermissions,
        hasAnyPermission,
        hasRole,
        user,
        isAuthenticated
    };
};

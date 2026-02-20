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

        // Admin has all permissions
        if (user.role === "admin") return true;

        const permissions = user.permissions || [];
        const required = Array.isArray(requiredPermissions)
            ? requiredPermissions
            : [requiredPermissions];

        return required.every(p => permissions.includes(p));
    };

    /**
     * Check if user has any of the required permissions
     */
    const hasAnyPermission = (requiredPermissions: string[]): boolean => {
        if (!isAuthenticated || !user) return false;
        if (user.role === "admin") return true;

        const permissions = user.permissions || [];
        return requiredPermissions.some(p => permissions.includes(p));
    };

    /**
     * Check if user has a specific role
     */
    const hasRole = (role: string | string[]): boolean => {
        if (!isAuthenticated || !user) return false;
        const roles = Array.isArray(role) ? role : [role];
        return roles.includes(user.role);
    };

    return {
        hasPermissions,
        hasAnyPermission,
        hasRole,
        user,
        isAuthenticated
    };
};

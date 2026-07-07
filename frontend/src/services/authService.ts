import api from '../api/axiosConfig';

export interface AuthResponse {
    token: string;
    role: string;
    loginType: string;
}

const extractRoleFromToken = (token: string): string => {
    try {
        const base64Url = token.split('.')[1];
        const jsonPayload = atob(base64Url);
        const payload = JSON.parse(jsonPayload);
        return payload.role || payload.authorities?.[0] || 'UNKNOWN_ROLE';
    } catch (error) {
        console.error("Failed to parse JWT token:", error);
        return 'UNKNOWN_ROLE';
    }
};

export const fetchLoginTypes = async (): Promise<{code: string, label: string}[]> => {
    const response = await api.get('/auth/login-types');
    return response.data;
}

export const loginUser = async (loginType: string, usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login', {
            loginType,
            usernameOrEmail,
            password
        });

        // Backend returns { token: "..." }
        const token = response.data.token; 
        
        const actualRole = extractRoleFromToken(token);
        
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_role', actualRole);
        localStorage.setItem('login_type', loginType);
        
        return {
            token,
            role: actualRole,
            loginType
        };
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logoutUser = (): void => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('login_type');
};
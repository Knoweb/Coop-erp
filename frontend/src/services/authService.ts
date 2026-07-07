import api from '../api/axiosConfig';

// 1. Define the exact shape of the data Login.tsx is expecting
export interface AuthResponse {
    token: string;
    role: string;
    username: string;
}

// 2. Helper function to decode the JWT and extract the role
const extractRoleFromToken = (token: string): string => {
    try {
        // A JWT has 3 parts separated by dots. The payload is in the middle [1].
        const base64Url = token.split('.')[1];
        // Decode the Base64 payload into a readable JSON string
        const jsonPayload = atob(base64Url);
        const payload = JSON.parse(jsonPayload);
        
        // Spring Security usually stores roles under 'role', 'roles', or 'authorities'
        // Adjust this key if your backend uses a different name inside the token
        return payload.role || payload.authorities?.[0] || 'UNKNOWN_ROLE';
    } catch (error) {
        console.error("Failed to parse JWT token:", error);
        return 'UNKNOWN_ROLE';
    }
};

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
    console.log("DEBUG: Sending request with:", { username, password });
    try {
        // 3. Fetch the raw token string from the Gateway
        const response = await api.post<string>('/auth/token', {
            username,
            password
        });

        const token = response.data; 
        
        // 4. Extract the role from the newly minted token
        const actualRole = extractRoleFromToken(token);
        
        // 5. Store the token securely
        localStorage.setItem('jwt_token', token);
        
        // 6. Return the perfectly structured object back to Login.tsx
        return {
            token: token,
            role: actualRole,
            username: username
        };
        
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logoutUser = (): void => {
    // Make sure you clear BOTH the token and the role on logout!
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
};
import api from '../api/axiosConfig';

export interface AuthResponse {
    token: string;
    role: string;
}

const extractPayloadFromToken = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const jsonPayload = atob(base64Url);
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Failed to parse JWT token:", error);
        return {};
    }
};


export const loginUser = async (usernameOrEmail: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login', {
            usernameOrEmail,
            password
        });

        // Backend returns { token: "..." }
        const token = response.data.token; 
        
        const payload = extractPayloadFromToken(token);
        const actualRole = payload.role || payload.authorities?.[0] || 'UNKNOWN_ROLE';
        
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_role', actualRole);
        if (payload.sub) localStorage.setItem('username', payload.sub);
        if (payload.shopId) localStorage.setItem('shopId', payload.shopId);
        if (payload.shopCode) localStorage.setItem('shopCode', payload.shopCode);
        if (payload.shopName) localStorage.setItem('shopName', payload.shopName);
        
        return {
            token,
            role: actualRole
        };
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logoutUser = (): void => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('shopId');
    localStorage.removeItem('shopCode');
    localStorage.removeItem('shopName');
    
    // Clear old global theme key side effect
    localStorage.removeItem('theme');
    localStorage.removeItem('defaultTheme');
    
    // Clear terminal info
    localStorage.removeItem('terminalId');
    localStorage.removeItem('terminalCode');
};

export const setTerminalInfo = (terminalId: string, terminalCode: string) => {
    localStorage.setItem('terminalId', terminalId);
    localStorage.setItem('terminalCode', terminalCode);
};

export const getTerminalInfo = () => {
    return {
        terminalId: localStorage.getItem('terminalId'),
        terminalCode: localStorage.getItem('terminalCode')
    };
};
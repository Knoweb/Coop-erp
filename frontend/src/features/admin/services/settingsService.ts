import api from '../../../api/axiosConfig';

export interface BusinessProfile {
    businessName: string;
    mainShopName: string;
    address: string;
    phone: string;
    email: string;
    taxNumber: string;
    receiptFooter: string;
}

export interface SecuritySettings {
    minimumPasswordLength: number;
    requireUppercase: boolean;
    requireNumber: boolean;
    requireSpecialCharacter: boolean;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    accountLockMinutes: number;
}

export interface UserPreferences {
    terminalId?: string;
    defaultTheme: string;
    dashboardRefreshIntervalSeconds: number;
    itemsPerPage: number;
    enableSystemNotifications: boolean;
}

export interface BackupSettings {
    autoBackupEnabled: boolean;
    backupFrequency: string;
    backupTime: string;
    retentionDays: number;
    lastBackupAt?: string | null;
    lastBackupStatus?: string | null;
}

export interface AllSettings {
    businessProfile: BusinessProfile;
    securitySettings: SecuritySettings;
    userPreferences: UserPreferences;
    backupSettings: BackupSettings;
}

export const settingsService = {
    getAllSettings: async (): Promise<AllSettings> => {
        const response = await api.get('/admin/settings');
        return response.data;
    },

    getBusinessProfile: async (): Promise<BusinessProfile> => {
        const response = await api.get('/admin/settings/business-profile');
        return response.data;
    },
    updateBusinessProfile: async (payload: BusinessProfile): Promise<void> => {
        await api.put('/admin/settings/business-profile', payload);
    },

    getSecuritySettings: async (): Promise<SecuritySettings> => {
        const response = await api.get('/admin/settings/security');
        return response.data;
    },
    updateSecuritySettings: async (payload: SecuritySettings): Promise<void> => {
        await api.put('/admin/settings/security', payload);
    },

    getUserPreferences: async (): Promise<UserPreferences> => {
        const response = await api.get('/admin/settings/user-preferences');
        return response.data;
    },
    updateUserPreferences: async (payload: UserPreferences): Promise<void> => {
        await api.put('/admin/settings/user-preferences', payload);
    },

    getShopUserPreferences: async (terminalId: string): Promise<UserPreferences> => {
        const response = await api.get('/shop/settings/user-preferences', { params: { terminalId } });
        return response.data;
    },
    updateShopUserPreferences: async (payload: UserPreferences): Promise<void> => {
        await api.put('/shop/settings/user-preferences', payload);
    },

    getBackupSettings: async (): Promise<BackupSettings> => {
        const response = await api.get('/admin/settings/backup');
        return response.data;
    },
    updateBackupSettings: async (payload: BackupSettings): Promise<void> => {
        await api.put('/admin/settings/backup', payload);
    },

    runManualBackup: async (): Promise<any> => {
        const response = await api.post('/admin/settings/backup/run-now');
        return response.data;
    }
};

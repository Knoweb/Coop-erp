import api from '../../../api/axiosConfig';

export interface BusinessProfile {
    businessName: string;
    registrationNumber: string;
    address: string;
    contactNumber: string;
    email: string;
    taxNumber: string;
    receiptFooterText: string;
}

export interface SecuritySettings {
    minimumPasswordLength: number;
    requireStrongPassword: boolean;
    sessionTimeoutMinutes: number;
    enableAccountLocking: boolean;
    maxFailedLoginAttempts: number;
}

export interface UserPreferences {
    defaultTheme: string;
    dashboardRefreshIntervalSeconds: number;
    itemsPerPage: number;
    enableNotifications: boolean;
}

export interface BackupSettings {
    enableAutomaticBackup: boolean;
    backupFrequency: string;
    backupTime: string;
    lastBackupTime?: string | null;
    maintenanceMode: boolean;
}

export const settingsService = {
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

    getBackupSettings: async (): Promise<BackupSettings> => {
        const response = await api.get('/admin/settings/backup');
        return response.data;
    },
    updateBackupSettings: async (payload: BackupSettings): Promise<void> => {
        await api.put('/admin/settings/backup', payload);
    },

    runManualBackup: async (): Promise<string> => {
        const response = await api.post('/admin/settings/backup/run-now');
        return response.data;
    }
};

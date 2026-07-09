import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, fetchLoginTypes } from '../../services/authService';
import heroImage from '../../assets/hero.png';

const Login: React.FC = () => {
    const [loginType, setLoginType] = useState<string>('');
    const [loginTypes, setLoginTypes] = useState<{code: string, label: string}[]>([]);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        const loadLoginTypes = async () => {
            try {
                const types = await fetchLoginTypes();
                setLoginTypes(types);
            } catch (err) {
                console.error("Failed to load login types", err);
            }
        };
        loadLoginTypes();
    }, []);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg('');
        localStorage.clear();

        if (!loginType) {
            setErrorMsg('Critical: Login type selection is required.');
            return;
        }

        setIsLoading(true);

        try {
            const userData = await loginUser(loginType, username, password) as any;
            const actualRole = userData.role ? userData.role.replace(/^ROLE_/, '') : null; 
            
            if (loginType === 'ADMIN' || actualRole === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (loginType === 'SHOP' || actualRole === 'SHOP_ADMIN' || actualRole === 'SHOP_USER') {
                navigate('/shop/dashboard');
            } else {
                throw new Error("Invalid routing selection.");
            }
        } catch (err: any) {
            const status = err?.response?.status;
            setErrorMsg(
                status === 403 || err.message === "Unauthorized"
                    ? 'Authentication failed: Unauthorized access.' 
                    : 'System connection error. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const styles = {
        wrapper: {
            display: 'flex',
            height: '100vh',
            width: '100vw',
            fontFamily: '"Inter", "Segoe UI", sans-serif',
            backgroundColor: '#ffffff',
            margin: 0,
            overflow: 'hidden'
        },
        heroSection: {
            flex: 1,
            backgroundImage: `linear-gradient(to bottom right, rgba(168, 25, 25, 0.87), rgba(215, 77, 3, 0.81)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'center',
            padding: '40px 10%',
            color: 'white',
            boxShadow: 'inset -10px 0px 20px rgba(0,0,0,0.1)'
        },
        heroTitle: {
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '20px',
            lineHeight: '1.2',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        },
        heroSubtitle: {
            fontSize: '18px',
            fontWeight: '400',
            opacity: 0.95,
            maxWidth: '500px',
            lineHeight: '1.6',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        },
        formSection: {
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
        },
        formContainer: {
            width: '100%',
            maxWidth: '420px',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
        },
        formHeader: {
            marginBottom: '30px',
            textAlign: 'left' as const
        },
        mainTitle: {
            fontSize: '28px',
            color: '#0f172a',
            fontWeight: '700',
            marginBottom: '8px'
        },
        subTitle: {
            color: '#64748b',
            fontSize: '15px'
        },
        inputGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            color: '#334155',
            fontWeight: '600',
            fontSize: '13px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px'
        },
        inputWrapper: {
            position: 'relative' as const,
            width: '100%'
        },
        input: {
            width: '100%',
            padding: '14px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '15px',
            color: '#0f172a',
            backgroundColor: '#f8fafc',
            boxSizing: 'border-box' as const,
            transition: 'all 0.2s ease',
            outline: 'none',
            fontFamily: 'inherit'
        },
        selectInput: {
            appearance: 'none' as const,
            WebkitAppearance: 'none' as const,
            MozAppearance: 'none' as const,
            backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" stroke="%2364748b" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            backgroundSize: '16px',
            cursor: 'pointer'
        },
        eyeIcon: {
            position: 'absolute' as const,
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        button: {
            width: '100%',
            padding: '14px',
            backgroundColor: '#FF5A00', 
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isLoading ? 'wait' : 'pointer',
            marginTop: '10px',
            boxShadow: '0 4px 12px rgba(255, 90, 0, 0.3)', 
            transition: 'background-color 0.2s ease, transform 0.1s ease',
            opacity: isLoading ? 0.7 : 1
        },
        errorMsg: {
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '500'
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.heroSection}>
                <h1 style={styles.heroTitle}>Coop Grocery<br/>Management<br/>System</h1>
                <p style={styles.heroSubtitle}>
                    Centralized management for cooperative grocery shops, inventory, purchases, sales, and users.
                </p>
            </div>

            <div style={styles.formSection}>
                <div style={styles.formContainer}>
                    <div style={styles.formHeader}>
                        <h2 style={styles.mainTitle}>Welcome Back</h2>
                        <p style={styles.subTitle}>Login to access your admin or shop dashboard.</p>
                    </div>
                    
                    {errorMsg && <div style={styles.errorMsg}>{errorMsg}</div>}
                    
                    <form onSubmit={handleLogin}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Login Type</label>
                            <select 
                                style={{...styles.input, ...styles.selectInput}} 
                                value={loginType}
                                onChange={(e) => setLoginType(e.target.value)}
                            >
                                <option value="" disabled>-- Select Login Type --</option>
                                {loginTypes.map((type) => (
                                    <option key={type.code} value={type.code}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Username</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                placeholder="e.g., admin or shop1admin"
                                required 
                                style={styles.input}
                            />
                        </div>
                        
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputWrapper}>
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="••••••••"
                                    required 
                                    style={{...styles.input, paddingRight: '40px'}}
                                />
                                <div 
                                    style={styles.eyeIcon} 
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide Password" : "Show Password"}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            style={styles.button}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D9381E'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FF5A00'}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {isLoading ? 'Verifying Identity...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        // Default to Farmer demo if first launch
        await switchDemoRole('FARMER');
        return;
      }
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        await switchDemoRole('FARMER');
      }
    } catch (err) {
      console.warn('[Auth] Token verification failed or offline, loading cached demo profile');
      const cached = localStorage.getItem('pashu_cached_user');
      if (cached) {
        setUser(JSON.parse(cached));
      } else {
        // Fallback default demo user
        const defaultUser: User = {
          id: 'usr_farmer_01',
          email: 'farmer@pashurakshak.gov.in',
          phone: '+919822012345',
          full_name: 'Ramesh Tukaram Patil',
          role: 'FARMER',
          district: 'Pune',
          taluka: 'Shirur',
          village: 'Nighoj',
          language_pref: 'mr'
        };
        setUser(defaultUser);
        localStorage.setItem('pashu_cached_user', JSON.stringify(defaultUser));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login(identifier, pass);
      if (res.success) {
        setAuthToken(res.token);
        setUser(res.user);
        localStorage.setItem('pashu_cached_user', JSON.stringify(res.user));
      }
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    setLoading(true);
    try {
      const res = await api.auth.demoSwitch(role);
      if (res.success) {
        setAuthToken(res.token);
        setUser(res.user);
        localStorage.setItem('pashu_cached_user', JSON.stringify(res.user));
      }
    } catch (e) {
      // Offline fallback demo user generator
      const fallbackMap: Record<UserRole, User> = {
        FARMER: {
          id: 'usr_farmer_01',
          email: 'farmer@pashurakshak.gov.in',
          phone: '+919822012345',
          full_name: 'Ramesh Tukaram Patil',
          role: 'FARMER',
          district: 'Pune',
          taluka: 'Shirur',
          village: 'Nighoj',
          language_pref: 'mr'
        },
        FIELD_VET: {
          id: 'usr_vet_01',
          email: 'vet@pashurakshak.gov.in',
          phone: '+919423011223',
          full_name: 'Dr. Anand Deshmukh (B.V.Sc & A.H)',
          role: 'FIELD_VET',
          district: 'Pune',
          taluka: 'Shirur',
          village: 'Shirur Central Hospital',
          language_pref: 'en'
        },
        PARA_VET: {
          id: 'usr_paravet_01',
          email: 'paravet@pashurakshak.gov.in',
          phone: '+919765432100',
          full_name: 'Sunil Shinde (Livestock Supervisor)',
          role: 'PARA_VET',
          district: 'Pune',
          taluka: 'Shirur',
          village: 'Nighoj Sub-Center',
          language_pref: 'mr'
        },
        LAB_TECH: {
          id: 'usr_lab_01',
          email: 'lab@pashurakshak.gov.in',
          phone: '+919823145678',
          full_name: 'Dr. Priya Kulkarni (Senior Pathologist)',
          role: 'LAB_TECH',
          district: 'Pune',
          taluka: 'Haveli',
          village: 'District Diagnostic Lab, Aundh',
          language_pref: 'en'
        },
        DISTRICT_ADMIN: {
          id: 'usr_district_admin_01',
          email: 'district.admin@pashurakshak.gov.in',
          phone: '+919422001122',
          full_name: 'Sanjay Jadhav (District Animal Husbandry Officer)',
          role: 'DISTRICT_ADMIN',
          district: 'Pune',
          taluka: 'Pune City',
          village: 'Collectorate Office',
          language_pref: 'mr'
        },
        STATE_ADMIN: {
          id: 'usr_state_admin_01',
          email: 'state.admin@pashurakshak.gov.in',
          phone: '+919820003344',
          full_name: 'Dr. Vilas Gaikwad (State Surveillance Director)',
          role: 'STATE_ADMIN',
          district: 'Mumbai City',
          taluka: 'Mantralaya',
          village: 'Commissionerate',
          language_pref: 'en'
        }
      };

      const fallbackUser = fallbackMap[role];
      setUser(fallbackUser);
      localStorage.setItem('pashu_cached_user', JSON.stringify(fallbackUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem('pashu_cached_user');
    // Revert to demo farmer
    switchDemoRole('FARMER');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, switchDemoRole, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

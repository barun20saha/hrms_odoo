import { create } from 'zustand'

interface AuthState {
  token: string | null;
  email: string | null;
  employeeId: string | null;
  role: 'ROLE_EMPLOYEE' | 'ROLE_ADMIN' | null;
  isAuthenticated: boolean;
  setLogin: (token: string, email: string, employeeId: string, role: string, remember: boolean) => void;
  setLogout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Read initial state from localStorage if available
  const storedToken = localStorage.getItem('hrms_token') || sessionStorage.getItem('hrms_token');
  const storedEmail = localStorage.getItem('hrms_email') || sessionStorage.getItem('hrms_email');
  const storedEmpId = localStorage.getItem('hrms_empid') || sessionStorage.getItem('hrms_empid');
  const storedRole = localStorage.getItem('hrms_role') || sessionStorage.getItem('hrms_role');

  return {
    token: storedToken,
    email: storedEmail,
    employeeId: storedEmpId,
    role: storedRole as 'ROLE_EMPLOYEE' | 'ROLE_ADMIN' | null,
    isAuthenticated: !!storedToken,

    setLogin: (token, email, employeeId, role, remember) => {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('hrms_token', token);
      storage.setItem('hrms_email', email);
      storage.setItem('hrms_empid', employeeId);
      storage.setItem('hrms_role', role);

      set({
        token,
        email,
        employeeId,
        role: role as 'ROLE_EMPLOYEE' | 'ROLE_ADMIN',
        isAuthenticated: true,
      });
    },

    setLogout: () => {
      localStorage.removeItem('hrms_token');
      localStorage.removeItem('hrms_email');
      localStorage.removeItem('hrms_empid');
      localStorage.removeItem('hrms_role');
      sessionStorage.removeItem('hrms_token');
      sessionStorage.removeItem('hrms_email');
      sessionStorage.removeItem('hrms_empid');
      sessionStorage.removeItem('hrms_role');

      set({
        token: null,
        email: null,
        employeeId: null,
        role: null,
        isAuthenticated: false,
      });
    },
  };
})

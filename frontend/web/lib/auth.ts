  export type UserRole = "Manager" | "Driver" | "User" | "Owner";

export interface User {
  email: string;
  fullName: string;
  role: UserRole;
  token: string;
}

export const ROLE_ROUTES: Record<UserRole, string> = {
  Manager: "/dashboard/manager",
  Driver: "/dashboard/driver",
  User: "/dashboard/user",
  Owner: "/dashboard/owner",
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Log the API_BASE configuration on module load
console.log('~~~~~~~~~~~~~~~~~~~~~~~[AUTH CONFIG] NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
console.log('~~~~~~~~~~~~~~~~~~~~~~~[AUTH CONFIG] API_BASE value:', API_BASE);

export const AuthService = {
  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("sherine_auth_user");
      if (userStr) return JSON.parse(userStr);
    }
    return null;
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("sherine_auth_token");
    }
    return null;
  },

  async login(email: string, password: string): Promise<User> {
    try {
      console.log('[LOGIN] API_BASE before call:', API_BASE);
      console.log('[LOGIN] Full URL will be:', API_BASE ? `${API_BASE}/auth/login` : 'UNDEFINED');
      
      if (!API_BASE) {
        console.error('[LOGIN ERROR] NEXT_PUBLIC_API_BASE_URL is not configured');
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
      }
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let message: string = `Login failed (${res.status})`;
        try {
          const body = await res.json();
          message = body.message || body.error || message;
        } catch {
          try {
            message = await res.text();
          } catch {}
        }
        throw new Error(message);
      }

      const data = await res.json();

      const user: User = {
        email,
        fullName: email.split("@")[0],
        role: (data.roles?.[0] as UserRole) ?? "User",
        token: data.token,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("sherine_auth_token", data.token);
        localStorage.setItem("sherine_auth_user", JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async signup(fullName: string, email: string, password: string, userType: "User" | "Driver") {
    try {
      console.log('[SIGNUP] API_BASE before call:', API_BASE);
      console.log('[SIGNUP] Full URL will be:', API_BASE ? `${API_BASE}/auth/register?userType=${userType}` : 'UNDEFINED');
      
      if (!API_BASE) {
        console.error('[SIGNUP ERROR] NEXT_PUBLIC_API_BASE_URL is not configured');
        throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
      }
      const res = await fetch(`${API_BASE}/auth/register?userType=${userType}`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!res.ok) {
        let message: string = `Signup failed (${res.status})`;
        try {
          const body = await res.json();
          message = body.message || body.error || message;
        } catch {
          try {
            message = await res.text();
          } catch {}
        }
        throw new Error(message);
      }

      return await res.json();
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sherine_auth_user");
      localStorage.removeItem("sherine_auth_token");
    }
  },
};

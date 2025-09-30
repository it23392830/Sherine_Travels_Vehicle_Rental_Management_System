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
    const bases = [
      process.env.NEXT_PUBLIC_API_URL,
      "http://localhost:5152/api",
      "https://localhost:7126/api",
    ].filter(Boolean) as string[]

    let lastError: any = null
    let data: any = null
    for (const base of bases) {
      try {
        const res = await fetch(`${base}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          // Development fallback endpoint that auto-creates if needed
          if (res.status === 401) {
            try {
              const devRes = await fetch(`${base}/auth/dev-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
              })
              if (devRes.ok) {
                data = await devRes.json()
                lastError = null
                break
              }
            } catch {}
          }
          let message: unknown = `Login failed (${res.status})`;
          try {
            const body = await res.json();
            message = (body && (body.message || body.error)) || body || message;
          } catch {
            try {
              message = await res.text();
            } catch {}
          }
          lastError = new Error(typeof message === "string" ? message : JSON.stringify(message))
          continue
        }
        data = await res.json()
        lastError = null
        break
      } catch (e) {
        lastError = e
        continue
      }
    }
    if (lastError) throw lastError

    // Backend returns: { token, roles }
    const user: User = {
      email,
      fullName: email.split("@")[0], // fallback, since backend doesn’t return full name
      role: (data.roles?.[0] as UserRole) ?? "User",
      token: data.token,
    };

    if (typeof window !== "undefined") {
      // ✅ Store token and user in localStorage
      localStorage.setItem("sherine_auth_token", data.token);
      localStorage.setItem("sherine_auth_user", JSON.stringify(user));
    }

    return user;
  },

  async signup(fullName: string, email: string, password: string, userType: "User" | "Driver") {
    const bases = [
      process.env.NEXT_PUBLIC_API_URL,
      "http://localhost:5152/api",
      "https://localhost:7126/api",
    ].filter(Boolean) as string[]

    let lastError: any = null
    for (const base of bases) {
      try {
        const res = await fetch(`${base}/auth/register?userType=${userType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password }),
        });
        if (!res.ok) {
          let message: unknown = `Signup failed (${res.status})`;
          try {
            const body = await res.json();
            message = (body && (body.message || body.error)) || body || message;
          } catch {
            try { message = await res.text(); } catch {}
          }
          lastError = new Error(typeof message === "string" ? message : JSON.stringify(message))
          continue
        }
        return await res.json()
      } catch (e) {
        lastError = e
        continue
      }
    }
    if (lastError) throw lastError
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sherine_auth_user");
      localStorage.removeItem("sherine_auth_token");
    }
  },
};

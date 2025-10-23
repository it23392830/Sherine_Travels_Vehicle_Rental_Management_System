export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sherine_auth_token");
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { method?: HttpMethod } = {}
): Promise<T> {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5152/api';
  const apiBase = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  const url = path.startsWith("http") ? path : `${apiBase}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}), 
  };

  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    // Debug logging
    console.log("🔗 API Request:", { path, url, hasToken: !!getAuthToken() });
    
    const res = await fetch(url, { ...options, headers });
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
      const message = (body && (body.message || body.error)) || body || res.statusText || "Request failed";
      const error = new Error(typeof message === "string" ? message : JSON.stringify(message));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      error.status = res.status;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      error.url = url;
      throw error;
    }

    return (body as T) ?? (undefined as unknown as T);
  } catch (err: any) {
    // Log detailed network error for debugging
    // eslint-disable-next-line no-console
    console.error("apiFetch raw error:", err)
    // eslint-disable-next-line no-console
    console.error("apiFetch error:", {
      path,
      message: err?.message,
      stack: err?.stack,
      status: err?.status,
      url: err?.url,
      online: typeof navigator !== "undefined" ? navigator.onLine : undefined,
    });
    throw err;
  }
}

export const fetcher = (url: string) => apiFetch(url);

export function getApiBaseUrl() {
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:5152/api";
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

// Booking-related types
export interface BookingResponse {
  id: number;
  bookingId: string;
  startDate: string;
  endDate: string;
  kilometers: number;
  withDriver: boolean;
  totalPrice: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  paymentStatus: string;
  vehicleType: string;
  message: string;
}

export interface DashboardStats {
  upcomingBookings: BookingResponse[];
  completedBookings: BookingResponse[];
  pendingPayments: BookingResponse[];
}

// Booking API functions
export async function getUserBookings(): Promise<BookingResponse[]> {
  return apiFetch<BookingResponse[]>("/booking");
}

export async function getUserDashboardStats(): Promise<DashboardStats> {
  const bookings = await getUserBookings();
  
  const now = new Date();
  const upcomingBookings = bookings.filter(b => 
    (b.status === "Confirmed" || b.status === "Pending") && 
    new Date(b.startDate) >= now
  );
  
  const completedBookings = bookings.filter(b => 
    b.status === "Completed" || 
    b.paymentStatus === "PaidOnline" ||
    (b.paymentStatus === "Paid" && new Date(b.endDate) < now)
  );
  
  const pendingPayments = bookings.filter(b => 
    b.paymentStatus === "Pending" || 
    (b.paymentStatus === "PayAtPickup" && b.balanceDue > 0)
  );
  
  return {
    upcomingBookings,
    completedBookings,
    pendingPayments
  };
}

export async function cancelBooking(bookingId: number): Promise<void> {
  return apiFetch(`/booking/${bookingId}/cancel`, { method: "PUT" });
}

export async function createPayPalOrder(bookingId: number, amount: number): Promise<{ orderId: string }> {
  return apiFetch(`/booking/${bookingId}/paypal/create`, {
    method: "POST",
    body: JSON.stringify({ amount, currency: "PHP" })
  });
}

export async function capturePayPalOrder(bookingId: number, orderId: string): Promise<{ message: string; status: string }> {
  return apiFetch(`/booking/${bookingId}/paypal/capture?orderId=${orderId}`, {
    method: "POST"
  });
}

export async function downloadInvoice(bookingId: number): Promise<Blob> {
  const response = await fetch(`${getApiBaseUrl()}/booking/${bookingId}/invoice`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`
    }
  });
  
  if (!response.ok) {
    throw new Error("Failed to download invoice");
  }
  
  return response.blob();
}



import { AuthService } from '../../../lib/auth';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
});

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
    });

    describe('getCurrentUser', () => {
        it('returns null when no user in localStorage', () => {
            (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

            const user = AuthService.getCurrentUser();

            expect(user).toBeNull();
        });

        it('returns user when valid user data in localStorage', () => {
            const mockUser = {
                email: 'test@example.com',
                fullName: 'Test User',
                role: 'User',
                token: 'mock-token'
            };

            (window.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockUser));

            const user = AuthService.getCurrentUser();

            expect(user).toEqual(mockUser);
        });

        it('returns null when invalid JSON in localStorage', () => {
            (window.localStorage.getItem as jest.Mock).mockReturnValue('invalid-json');

            const user = AuthService.getCurrentUser();

            expect(user).toBeNull();
        });
    });

    describe('getToken', () => {
        it('returns token from localStorage', () => {
            (window.localStorage.getItem as jest.Mock).mockReturnValue('mock-token');

            const token = AuthService.getToken();

            expect(token).toBe('mock-token');
            expect(window.localStorage.getItem).toHaveBeenCalledWith('sherine_auth_token');
        });

        it('returns null when no token in localStorage', () => {
            (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

            const token = AuthService.getToken();

            expect(token).toBeNull();
        });
    });

    describe('login', () => {
        it('successfully logs in with valid credentials', async () => {
            const mockResponse = {
                token: 'mock-jwt-token',
                roles: ['User']
            };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await AuthService.login('test@example.com', 'password123');

            expect(result).toEqual({
                email: 'test@example.com',
                fullName: 'test',
                role: 'User',
                token: 'mock-jwt-token'
            });

            expect(window.localStorage.setItem).toHaveBeenCalledWith('sherine_auth_token', 'mock-jwt-token');
            expect(window.localStorage.setItem).toHaveBeenCalledWith('sherine_auth_user', JSON.stringify({
                email: 'test@example.com',
                fullName: 'test',
                role: 'User',
                token: 'mock-jwt-token'
            }));
        });

        it('throws error for invalid credentials', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Invalid credentials' }),
            });

            await expect(AuthService.login('test@example.com', 'wrongpassword'))
                .rejects.toThrow('Invalid credentials');
        });

        it('handles network errors', async () => {
            (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(AuthService.login('test@example.com', 'password123'))
                .rejects.toThrow('Network error');
        });

        it('handles non-JSON error responses', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                text: async () => 'Server error',
            });

            await expect(AuthService.login('test@example.com', 'password123'))
                .rejects.toThrow('Server error');
        });
    });

    describe('signup', () => {
        it('successfully creates new user account', async () => {
            const mockResponse = { message: 'Account created as User' };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            await AuthService.signup('Test User', 'test@example.com', 'password123', 'User');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/auth/register?userType=User',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fullName: 'Test User',
                        email: 'test@example.com',
                        password: 'password123',
                    }),
                })
            );
        });

        it('creates driver account when userType is Driver', async () => {
            const mockResponse = { message: 'Account created as Driver' };

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            await AuthService.signup('Driver User', 'driver@example.com', 'password123', 'Driver');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/auth/register?userType=Driver',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        fullName: 'Driver User',
                        email: 'driver@example.com',
                        password: 'password123',
                    }),
                })
            );
        });

        it('throws error when signup fails', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'User already exists' }),
            });

            await expect(AuthService.signup('Test User', 'test@example.com', 'password123', 'User'))
                .rejects.toThrow('User already exists');
        });
    });

    describe('logout', () => {
        it('clears user data from localStorage', () => {
            AuthService.logout();

            expect(window.localStorage.removeItem).toHaveBeenCalledWith('sherine_auth_token');
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('sherine_auth_user');
        });
    });
});

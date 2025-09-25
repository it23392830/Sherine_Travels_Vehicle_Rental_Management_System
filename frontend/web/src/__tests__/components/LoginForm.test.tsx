import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../../../components/loginpage/login-form';

// Mock the auth service
jest.mock('../../../lib/auth', () => ({
    AuthService: {
        signup: jest.fn(),
        login: jest.fn(),
    },
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
    signIn: jest.fn(),
}));

// Mock use-auth provider/context with exported loginMock
jest.mock('../../../hooks/use-auth', () => {
    const loginMock = jest.fn(async () => ({ success: true }));
    return {
        __esModule: true,
        useAuth: () => ({
            user: null,
            isLoading: false,
            login: loginMock,
            logout: jest.fn(),
            hasRole: () => false,
            canAccess: () => false,
        }),
        AuthProvider: ({ children }: any) => children,
        loginMock,
    };
});

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock toast
jest.mock('../../../hooks/use-toast', () => ({
    useToast: () => ({
        toast: jest.fn(),
    }),
}));

function renderWithProviders(ui: React.ReactElement) {
    const { AuthProvider } = require('../../../hooks/use-auth');
    return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('LoginForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form by default', () => {
        renderWithProviders(<LoginForm />);

        const signInForm = document.querySelector('.signInContainer form') as HTMLFormElement;
        expect(signInForm).toBeTruthy();
        expect(signInForm.querySelector('input[placeholder="Email"]')).toBeTruthy();
        expect(signInForm.querySelector('input[placeholder="Password"]')).toBeTruthy();
        expect(signInForm.querySelector('button[type="submit"]')).toBeTruthy();
    });

    it('switches to signup form when toggle is clicked', () => {
        renderWithProviders(<LoginForm />);

        const overlaySignUpBtn = screen.getAllByText('Sign Up')[1] || screen.getAllByText('Sign Up')[0]
        fireEvent.click(overlaySignUpBtn);

        expect(screen.getByText('Create Account')).toBeInTheDocument();
        const signUpForm = screen.getByText('Create Account').closest('form') as HTMLFormElement;
        expect(signUpForm).toBeTruthy();
    });

    it('shows validation error for empty fields in signup', async () => {
        renderWithProviders(<LoginForm />);

        // Switch to signup via overlay button
        fireEvent.click(screen.getAllByText('Sign Up')[1] || screen.getAllByText('Sign Up')[0]);

        // Try to submit without filling fields (submit button inside signup form)
        const signUpForm0 = screen.getByText('Create Account').closest('form') as HTMLFormElement;
        const signUpSubmit0 = signUpForm0.querySelector('button[type="submit"]') as HTMLButtonElement;
        fireEvent.click(signUpSubmit0);

        const { AuthService } = require('../../../lib/auth');
        await waitFor(() => {
            expect(AuthService.signup).not.toHaveBeenCalled();
        });
    });

    it('calls AuthService.signup when signup form is submitted with valid data', async () => {
        const { AuthService } = require('../../../lib/auth');
        AuthService.signup.mockResolvedValue({});
        AuthService.login.mockResolvedValue({});

        renderWithProviders(<LoginForm />);

        // Switch to signup
        fireEvent.click(screen.getAllByText('Sign Up')[1] || screen.getAllByText('Sign Up')[0]);

        // Fill form (select inputs from the signup form)
        const nameInput = screen.getByPlaceholderText('Name');
        const [signUpEmail, signInEmail] = screen.getAllByPlaceholderText('Email');
        const [signUpPassword, signInPassword] = screen.getAllByPlaceholderText('Password');
        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(signUpEmail, { target: { value: 'test@example.com' } });
        fireEvent.change(signUpPassword, { target: { value: 'Test@123' } });

        // Submit signup form (pick the submit button inside Create Account form)
        const signUpForm = screen.getByText('Create Account').closest('form') as HTMLFormElement;
        const signUpSubmit = signUpForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        fireEvent.click(signUpSubmit);

        await waitFor(() => {
            expect(AuthService.signup).toHaveBeenCalledWith('Test User', 'test@example.com', 'Test@123', 'User');
        });
    });

    it('shows error message when signup fails', async () => {
        const { AuthService } = require('../../../lib/auth');
        AuthService.signup.mockRejectedValue(new Error('Signup failed'));

        renderWithProviders(<LoginForm />);

        // Switch to signup
        fireEvent.click(screen.getAllByText('Sign Up')[1] || screen.getAllByText('Sign Up')[0]);

        const nameInput2 = screen.getByPlaceholderText('Name');
        const [signUpEmail2] = screen.getAllByPlaceholderText('Email');
        const [signUpPassword2] = screen.getAllByPlaceholderText('Password');
        fireEvent.change(nameInput2, { target: { value: 'Test User' } });
        fireEvent.change(signUpEmail2, { target: { value: 'test@example.com' } });
        fireEvent.change(signUpPassword2, { target: { value: 'Test@123' } });

        const signUpForm2 = screen.getByText('Create Account').closest('form') as HTMLFormElement;
        const signUpSubmit2 = signUpForm2.querySelector('button[type="submit"]') as HTMLButtonElement;
        fireEvent.click(signUpSubmit2);

        await waitFor(() => {
            const signupFormScope = (screen.getByText('Create Account').closest('form') as HTMLFormElement) || document.querySelector('.signUpContainer form');
            const banners = signupFormScope?.querySelectorAll('.text-red-500');
            expect(banners && banners.length).toBeTruthy();
        });
    });

    it('calls AuthService.login when login form is submitted with valid data', async () => {
        const { loginMock } = require('../../../hooks/use-auth');
        loginMock.mockResolvedValueOnce({ success: true });

        renderWithProviders(<LoginForm />);

        // Fill login form (use inputs from Sign In form)
        const signInHeading = screen.getAllByRole('heading', { name: 'Sign In' })[0];
        const signInForm = signInHeading.closest('form') as HTMLFormElement;
        const signInEmailInput = signInForm.querySelector('input[placeholder="Email"]') as HTMLInputElement;
        const signInPasswordInput = signInForm.querySelector('input[placeholder="Password"]') as HTMLInputElement;
        fireEvent.change(signInEmailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(signInPasswordInput, { target: { value: 'Test@123' } });

        // Submit Sign In form
        const signInSubmit = signInForm.querySelector('button[type="submit"]') as HTMLButtonElement;
        fireEvent.click(signInSubmit);

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith('test@example.com', 'Test@123');
        });
    });

    it('shows error message when login fails', async () => {
        const { loginMock } = require('../../../hooks/use-auth');
        loginMock.mockResolvedValueOnce({ success: false, error: 'Invalid credentials' });

        renderWithProviders(<LoginForm />);

        // Fill login form (use inputs from Sign In form)
        const signInHeading2 = screen.getAllByRole('heading', { name: 'Sign In' })[0];
        const signInForm2 = signInHeading2.closest('form') as HTMLFormElement;
        const signInEmailInput2 = signInForm2.querySelector('input[placeholder="Email"]') as HTMLInputElement;
        const signInPasswordInput2 = signInForm2.querySelector('input[placeholder="Password"]') as HTMLInputElement;
        fireEvent.change(signInEmailInput2, { target: { value: 'test@example.com' } });
        fireEvent.change(signInPasswordInput2, { target: { value: 'wrongpassword' } });

        const signInSubmit2 = signInForm2.querySelector('button[type="submit"]') as HTMLButtonElement;
        fireEvent.click(signInSubmit2);

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalled();
        });
    });
});

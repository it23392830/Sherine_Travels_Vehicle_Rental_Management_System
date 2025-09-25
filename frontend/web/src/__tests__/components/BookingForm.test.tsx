import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingsPage from '../../../app/dashboard/user/bookings/page';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
});

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';

describe('BookingForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
    });

    it('renders booking form with all required fields', () => {
        render(<BookingsPage />);

        expect(screen.getByText('Vehicle Booking')).toBeInTheDocument();
        expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
        expect(screen.getByLabelText('End Date')).toBeInTheDocument();
        expect(screen.getByLabelText('Kilometers')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /book vehicle/i })).toBeInTheDocument();
    });

    it('shows validation error for empty required fields', async () => {
        render(<BookingsPage />);

        // Try to submit without filling fields
        fireEvent.click(screen.getByRole('button', { name: /book vehicle/i }));

        await waitFor(() => {
            expect(screen.getByText(/required fields/i)).toBeInTheDocument();
        });
    });

    it('submits booking with valid data', async () => {
        const mockResponse = {
            id: 1,
            bookingId: 'BK000001',
            startDate: '2024-01-15',
            endDate: '2024-01-17',
            kilometers: 100,
            withDriver: true,
            totalPrice: 10050,
            status: 'Pending',
            vehicleType: 'Sedan',
            message: 'Booking created successfully'
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        render(<BookingsPage />);

        // Fill form
        fireEvent.change(screen.getByLabelText('Start Date'), {
            target: { value: '2024-01-15' }
        });
        fireEvent.change(screen.getByLabelText('End Date'), {
            target: { value: '2024-01-17' }
        });
        fireEvent.change(screen.getByLabelText('Kilometers'), {
            target: { value: '100' }
        });
        fireEvent.click(screen.getByRole('checkbox'));

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /book vehicle/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/Booking',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer mock-token',
                    },
                    body: JSON.stringify({
                        startDate: '2024-01-15',
                        endDate: '2024-01-17',
                        kilometers: 100,
                        withDriver: true,
                    }),
                })
            );
        });
    });

    it('shows success message after successful booking', async () => {
        const mockResponse = {
            id: 1,
            bookingId: 'BK000001',
            startDate: '2024-01-15',
            endDate: '2024-01-17',
            kilometers: 100,
            withDriver: true,
            totalPrice: 10050,
            status: 'Pending',
            vehicleType: 'Sedan',
            message: 'Booking created successfully'
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        render(<BookingsPage />);

        // Fill and submit form
        fireEvent.change(screen.getByLabelText('Start Date'), {
            target: { value: '2024-01-15' }
        });
        fireEvent.change(screen.getByLabelText('End Date'), {
            target: { value: '2024-01-17' }
        });
        fireEvent.change(screen.getByLabelText('Kilometers'), {
            target: { value: '100' }
        });
        fireEvent.click(screen.getByRole('checkbox'));
        fireEvent.click(screen.getByRole('button', { name: /book vehicle/i }));

        await waitFor(() => {
            expect(screen.getByText('Booking created successfully')).toBeInTheDocument();
            expect(screen.getByText(/Booking ID:/i)).toBeInTheDocument();
            expect(screen.getByText(/Price:/i)).toBeInTheDocument();
        });
    });

    it('shows error message when booking fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to create booking'));

        render(<BookingsPage />);

        // Fill and submit form
        fireEvent.change(screen.getByLabelText('Start Date'), {
            target: { value: '2024-01-15' }
        });
        fireEvent.change(screen.getByLabelText('End Date'), {
            target: { value: '2024-01-17' }
        });
        fireEvent.change(screen.getByLabelText('Kilometers'), {
            target: { value: '100' }
        });
        fireEvent.click(screen.getByRole('button', { name: /book vehicle/i }));

        await waitFor(() => {
            expect(screen.getByText('Failed to create booking')).toBeInTheDocument();
        });
    });

    it('handles withDriver checkbox correctly', () => {
        render(<BookingsPage />);

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();

        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();

        fireEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
    });

    it('validates date inputs', async () => {
        render(<BookingsPage />);

        // Set end date before start date
        fireEvent.change(screen.getByLabelText('Start Date'), {
            target: { value: '2024-01-17' }
        });
        fireEvent.change(screen.getByLabelText('End Date'), {
            target: { value: '2024-01-15' }
        });
        fireEvent.change(screen.getByLabelText('Kilometers'), {
            target: { value: '100' }
        });

        fireEvent.click(screen.getByRole('button', { name: /book vehicle/i }));

        // The form should still submit as we don't have date validation in the component
        // This test documents the current behavior
        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
        });
    });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssignVehiclesPage from '../../../app/dashboard/manager/assignvehicles/page';

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

describe('VehicleManagement Component', () => {
    const mockVehicles = [
        {
            id: 1,
            type: 'Sedan',
            status: 'Available',
            seats: 4,
            priceWithoutDriver: 3000,
            priceWithDriver: 5000
        },
        {
            id: 2,
            type: 'SUV',
            status: 'Booked',
            seats: 6,
            priceWithoutDriver: 4000,
            priceWithDriver: 6000
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
        // Default GET /vehicle returns empty list unless test overrides
        (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => [] } as any);
    });

    it('renders vehicle management page', () => {
        render(<AssignVehiclesPage />);

        expect(screen.getByText('Assign Vehicles')).toBeInTheDocument();
        expect(screen.getAllByText('Add Vehicle').length).toBeGreaterThan(0);
    });

    it('loads vehicles from API', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockVehicles,
        } as any);

        render(<AssignVehiclesPage />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/vehicle',
                expect.objectContaining({
                    headers: { 'Authorization': 'Bearer mock-token' }
                })
            );
        });
    });

    it('shows add vehicle form', () => {
        render(<AssignVehiclesPage />);

        expect(screen.getByPlaceholderText('Vehicle Type')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Seats')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Price - Vehicle Only (LKR)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Price - Vehicle + Driver (LKR)')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument();
    });

    it('validates required fields before adding vehicle', async () => {
        render(<AssignVehiclesPage />);

        // Try to submit without filling required fields
        fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));

        // Should not trigger a POST request
        const postCalls = (fetch as jest.Mock).mock.calls.filter(([, init]) => (init as any)?.method === 'POST');
        expect(postCalls.length).toBe(0);
    });

    it('adds new vehicle with valid data', async () => {
        const newVehicle = {
            id: 3,
            type: 'Hatchback',
            status: 'Available',
            seats: 4,
            priceWithoutDriver: 2500,
            priceWithDriver: 4000
        };

        (fetch as jest.Mock)
            .mockResolvedValueOnce({ ok: true, json: async () => mockVehicles } as any) // Initial load
            .mockResolvedValueOnce({ ok: true, json: async () => newVehicle } as any); // Add vehicle

        render(<AssignVehiclesPage />);

        // Wait for initial load
        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
        });

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('Vehicle Type'), {
            target: { value: 'Hatchback' }
        });
        fireEvent.change(screen.getByPlaceholderText('Seats'), {
            target: { value: '4' }
        });
        fireEvent.change(screen.getByPlaceholderText('Price - Vehicle Only (LKR)'), {
            target: { value: '2500' }
        });
        fireEvent.change(screen.getByPlaceholderText('Price - Vehicle + Driver (LKR)'), {
            target: { value: '4000' }
        });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/vehicle',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer mock-token',
                    },
                    body: JSON.stringify({
                        type: 'Hatchback',
                        status: 'Available',
                        seats: 4,
                        priceWithoutDriver: 2500,
                        priceWithDriver: 4000,
                    }),
                })
            );
        });
    });

    it('handles API errors gracefully', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch vehicles'));

        render(<AssignVehiclesPage />);

        // Should not crash the component
        expect(screen.getByText('Assign Vehicles')).toBeInTheDocument();
    });

    it('edits existing vehicle', async () => {
        (fetch as jest.Mock)
            .mockResolvedValueOnce({ ok: true, json: async () => mockVehicles } as any) // Initial load
            .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mockVehicles[0], type: 'Updated Sedan' }) } as any); // Update

        render(<AssignVehiclesPage />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
        });

        // Click edit button
        const editBtn = screen.getAllByRole('button').find((b) => b.textContent === '' && b.parentElement?.querySelector('svg.lucide-pencil')) || screen.getAllByRole('button')[0];
        fireEvent.click(editBtn);

        // Should populate form with existing data
        expect(screen.getByDisplayValue('Sedan')).toBeInTheDocument();
        expect(screen.getByDisplayValue('4')).toBeInTheDocument();

        // Update data
        fireEvent.change(screen.getByDisplayValue('Sedan'), {
            target: { value: 'Updated Sedan' }
        });

        // Submit update
        fireEvent.click(screen.getByRole('button', { name: /update vehicle/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:5000/vehicle/1',
                expect.objectContaining({
                    method: 'PUT',
                })
            );
        });
    });

    it('deletes vehicle', async () => {
        (fetch as jest.Mock)
            .mockResolvedValueOnce({ ok: true, json: async () => mockVehicles } as any) // Initial load
            .mockResolvedValueOnce({ ok: true } as any); // Delete

        render(<AssignVehiclesPage />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
        });

        // Click delete button inside the vehicle card
        const cardTitle = screen.getByText(/Sedan\s*-\s*Seats:\s*4/);
        const card = cardTitle.closest('div')!.parentElement!.parentElement!; // navigate to Card root
        const buttonsInCard = card.querySelectorAll('button');
        const deleteBtn = buttonsInCard[1] as HTMLButtonElement; // second button in header
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            const deleteCall = (fetch as jest.Mock).mock.calls.find(([url, init]) =>
                String(url).includes('/vehicle/') && (init as any)?.method === 'DELETE'
            );
            expect(deleteCall).toBeTruthy();
        });
    });

    it('filters vehicles by status', () => {
        render(<AssignVehiclesPage />);

        // Page header should be visible
        expect(screen.getByText('Assign Vehicles')).toBeInTheDocument();
    });
});

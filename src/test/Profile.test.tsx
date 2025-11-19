import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '@/pages/Profile';
import React from 'react';

// Mockeamos un usuario logueado activo 
vi.mock('@/lib/service/authenticateUser', () => ({
    getCurrentUser: () => ({
        id: 'u1',
        name: 'Usuario Prueba',
        email: 'test@duocuc.cl',
        rut: '11.111.111-1',
        birthdate: '2000-01-01',
        discountPercentage: 20,
        userType: 'Cliente' 
    }),
    login: vi.fn(),
    hasAdminAccess: () => false 
}));

// Mockeamos el storage de usuario para evitar errores con useEffect
vi.mock('@/lib/userStorage', () => ({
    updateUser: vi.fn()
}));

describe('Vista Perfil', () => {
    test('Debe mostrar la información del usuario logueado', () => {
        render(
            <BrowserRouter>
                <Profile />
            </BrowserRouter>
        );

        // Verificamos que se muestre el nombre del usuario del mock
        expect(screen.getByText('Usuario Prueba')).toBeDefined();
        expect(screen.getByText('11.111.111-1')).toBeDefined();
        
        // Verificamos que se muestre la sección de beneficios
        expect(screen.getByText('Beneficios')).toBeDefined();
        expect(screen.getByText('20% OFF')).toBeDefined();
    });
});
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '@/pages/Login';
import React from 'react';

describe('Vista Login', () => {
    test('Debe renderizar el formulario de inicio de sesión correctamente', () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Login />
            </BrowserRouter>
        );

        // Verificamos encabezado
        expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeDefined();
        
        // Verificamos campos clave por placeholder (Ajustado al HTML real)
        expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeDefined();
        expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
        
        // Verificamos botón
        expect(screen.getByRole('button', { name: /Ingresar/i })).toBeDefined();
    });
});
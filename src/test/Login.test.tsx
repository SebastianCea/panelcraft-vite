import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import React from 'react';

describe('Vista Login', () => {
    test('Debe renderizar el formulario de inicio de sesión correctamente', () => {
        // Arrange
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // Assert
        // Verificamos que el título principal esté presente
        expect(screen.getByText('Iniciar Sesión')).toBeDefined();
        
        // Verificamos que existan los campos de correo y contraseña
        // (Buscamos por el placeholder o label según corresponda en tu componente)
        expect(screen.getByPlaceholderText(/ejemplo@correo.com/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeDefined();
        
        // Verificamos que el botón de entrar exista
        expect(screen.getByRole('button', { name: /Entrar/i })).toBeDefined();
    });
});
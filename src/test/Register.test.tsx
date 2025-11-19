import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '@/pages/Register';
import React from 'react';

describe('Vista Registro', () => {
    test('Debe mostrar todos los campos requeridos para el registro', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        // Buscamos específicamente el encabezado (título) "Crear Cuenta"
        expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeDefined();
        
        // Verificamos campos clave por su placeholder
        expect(screen.getByPlaceholderText(/Ej: Juan/i)).toBeDefined(); 
        expect(screen.getByPlaceholderText(/12345678-9/i)).toBeDefined(); 
        expect(screen.getByPlaceholderText(/correo@ejemplo.com/i)).toBeDefined(); 
        
        // Buscamos específicamente el botón "Crear Cuenta"
        expect(screen.getByRole('button', { name: /Crear Cuenta/i })).toBeDefined();
    });
});
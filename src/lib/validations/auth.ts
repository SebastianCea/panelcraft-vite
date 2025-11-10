import { z } from 'zod';

// Validación de RUT chileno
const rutRegex = /^\d{7,8}-[\dkK]$/;

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'El usuario o correo es requerido')
    .max(255, 'Máximo 255 caracteres'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'Máximo 100 caracteres'),
});

export const registerSchema = z.object({
  firstName: z.string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),
  lastName: z.string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),
  username: z.string()
    .min(1, 'El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
  rut: z.string()
    .min(1, 'El RUT es requerido')
    .regex(rutRegex, 'Formato inválido. Debe ser sin puntos y con guión (ej: 12345678-9)'),
  birthDay: z.string()
    .min(1, 'El día es requerido')
    .refine((val) => {
      const num = parseInt(val);
      return num >= 1 && num <= 31;
    }, 'Día inválido (1-31)'),
  birthMonth: z.string()
    .min(1, 'El mes es requerido'),
  birthYear: z.string()
    .min(1, 'El año es requerido')
    .refine((val) => {
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= currentYear - 13;
    }, 'Debes tener al menos 13 años'),
  email: z.string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido')
    .max(255, 'Máximo 255 caracteres'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  country: z.string()
    .min(1, 'El país es requerido')
    .max(50, 'Máximo 50 caracteres'),
  region: z.string()
    .min(1, 'La región es requerida')
    .max(50, 'Máximo 50 caracteres'),
  city: z.string()
    .min(1, 'La ciudad es requerida')
    .max(50, 'Máximo 50 caracteres'),
  street: z.string()
    .min(1, 'La calle es requerida')
    .max(100, 'Máximo 100 caracteres'),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido')
    .max(255, 'Máximo 255 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

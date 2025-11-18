import { z } from 'zod';

// --- CONFIGURACIÓN DE DOMINIOS PERMITIDOS ---

// Dominios que puede usar cualquier CLIENTE nuevo al registrarse.
const CLIENT_DOMAINS = [
    'gmail\\.com', 'gmail\\.cl', 
    'outlook\\.com', 'outlook\\.cl', 
    'duocuc\\.cl'
].join('|');

// Dominios que usa el personal de la empresa (Admin/Seller).
const INTERNAL_DOMAINS = [
    'levelup\\.admin\\.cl', 
    'levelup\\.seller\\.cl'  
];

// Dominios COMPLETOS (Usado para Login/Forgot Password, ya que una vez creados son válidos)
const ALL_DOMAINS = [...CLIENT_DOMAINS.split('|'), ...INTERNAL_DOMAINS].join('|');


// Expresión regular para validar el formato completo del email
// 💡 Usaremos esta REGEX más estricta para el registro de clientes.
const CLIENT_EMAIL_REGEX = new RegExp(`^[\\w\\.-]+@(${CLIENT_DOMAINS})$`, 'i'); 
const ALL_EMAIL_REGEX = new RegExp(`^[\\w\\.-]+@(${ALL_DOMAINS})$`, 'i'); 

const CLIENT_DOMAIN_ERROR = `El correo debe ser de un dominio de cliente permitido (Ej: gmail.com, outlook.cl, duocuc.cl).`;
const ALL_DOMAIN_ERROR = `El correo debe ser de un dominio permitido.`; // Mensaje para Login/Forgot Password

// --- FUNCIONES AUXILIARES ---

// Función auxiliar para validar la lógica del RUT
const validateRutFormat = (val: string) => {
    // Ya transformado (sin puntos, mayúsculas), solo validamos la estructura final (Ej: 12345678-K)
    return /^[0-9K]{1,9}\-[0-9K]$/.test(val);
};

// --- ESQUEMAS DE VALIDACIÓN ---

export const loginSchema = z.object({
 email: z.string()
  .min(1, 'El usuario o correo es requerido')
  .max(255, 'Máximo 255 caracteres')
    .email('Correo electrónico inválido')
    .regex(ALL_EMAIL_REGEX, ALL_DOMAIN_ERROR), // Usa la regla de TODOS los dominios
 password: z.string()
  .min(1, 'La contraseña es requerida')
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'Máximo 100 caracteres'),
});


// 1. Esquema base para el formulario de registro (Cliente)
export const registerSchema = z.object({
    // --- INFORMACIÓN PERSONAL ---
 firstName: z.string()
  .min(1, 'El nombre es requerido'),
// ... (otras validaciones de nombre)
 lastName: z.string()
  .min(1, 'El apellido es requerido'),
// ... (otras validaciones de apellido)
 username: z.string() // Aunque eliminado del formulario, se mantiene en el esquema si aún lo necesitas para RHF.
  .optional(), // 💡 Lo hacemos opcional ya que no está en el formulario de tienda
    
    // RUT (limpieza y validación)
 rut: z.string()
  .min(1, 'El RUT es requerido')
    // Transformación: Elimina puntos y convierte a mayúsculas antes de validar el formato
    .transform(val => val.replace(/\./g, '').toUpperCase())
    .refine(validateRutFormat, {
        message: 'Formato inválido. Debe ser sin puntos y con guión (Ej: 12345678-K).',
    }),
    
    // --- FECHA DE NACIMIENTO ---
 birthDay: z.string().min(1, 'Día requerido'), 
 birthMonth: z.string().min(1, 'Mes requerido'),
 birthYear: z.string().min(4, 'Año requerido').max(4, 'Año inválido'),
    
    // --- CREDENCIALES ---
 email: z.string()
  .min(1, 'El correo es requerido')
  .email('Correo electrónico inválido')
  .max(255, 'Máximo 255 caracteres')
    .regex(CLIENT_EMAIL_REGEX, CLIENT_DOMAIN_ERROR), // 🟢 APLICAMOS LA REGLA ESTRICTA DE CLIENTE
 password: z.string()
  .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
    
    // Contraseña Repetida
    repassword: z.string().min(1, 'Confirmar contraseña es requerido'), 
    
    // --- DIRECCIÓN ---
 region: z.string()
  .min(1, 'La región es requerida'),
 city: z.string()
  .min(1, 'La ciudad/comuna es requerida'),
 street: z.string()
  .min(5, 'La calle es requerida y debe ser más detallada'),
})
// LÓGICA DE VALIDACIÓN CRUZADA: Contraseñas deben coincidir y Fecha de Nacimiento
.refine((data) => data.password === data.repassword, {
    message: "Las contraseñas no coinciden.",
    path: ["repassword"], 
})
.superRefine((data, ctx) => {
    // 💡 VALIDACIÓN DE EDAD Y FECHA COMPLETA (16 años)
    const year = parseInt(data.birthYear);
    const month = parseInt(data.birthMonth);
    const day = parseInt(data.birthDay);

    const dateObject = new Date(year, month - 1, day);

    if (
        isNaN(dateObject.getTime()) || 
        dateObject.getDate() !== day || 
        dateObject.getMonth() !== month - 1 || 
        dateObject.getFullYear() !== year
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La fecha combinada (Día/Mes/Año) no es válida.',
            path: ['birthDay'],
        });
        return;
    }

    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    
    if (dateObject.getTime() > minAgeDate.getTime()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Debes tener al menos 16 años para registrarte.',
            path: ['birthYear'], 
        });
    }
});

export const forgotPasswordSchema = z.object({
 email: z.string()
  .min(1, 'El correo es requerido')
  .email('Correo electrónico inválido')
  .max(255, 'Máximo 255 caracteres')
    .regex(ALL_EMAIL_REGEX, ALL_DOMAIN_ERROR), // Usa la regla de TODOS los dominios
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
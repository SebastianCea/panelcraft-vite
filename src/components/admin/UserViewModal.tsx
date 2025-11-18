import React from 'react';
import { User } from '@/types/user';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Calendar, Mail, MapPin } from 'lucide-react';

export interface UserViewModalProps {
 isOpen: boolean;
 onClose: () => void;
 user: User | null;
}

// Componente para una fila de detalle
const DetailRow: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between border-b border-border/50 py-2">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <span className="text-foreground text-right max-w-[60%]">{value}</span>
    </div>
);


export const UserViewModal = ({ isOpen, onClose, user }: UserViewModalProps) => {
 if (!user) return null;

 // Helper para la etiqueta del tipo de usuario
  const getUserTypeLabel = (type: User['userType']) => {
    let colorClass = "bg-accent/20 text-accent";
    if (type === 'Administrador') colorClass = "bg-red-600/20 text-red-400";
    if (type === 'Vendedor') colorClass = "bg-green-600/20 text-green-400";
    
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>{type}</span>;
  }
  
 return (
  <Dialog open={isOpen} onOpenChange={onClose}>
   {/* Modal Responsivo */}
   <DialogContent className="w-full max-w-md md:max-w-lg bg-card border-border flex flex-col max-h-[95vh] p-0">
    <DialogHeader className="p-6 pb-4 border-b border-border/50">
     <DialogTitle className="text-3xl font-bold text-accent">
                Detalle de Usuario
            </DialogTitle>
     <DialogDescription>
                Información completa del registro de {user.name}
            </DialogDescription>
    </DialogHeader>
        
        {/* Cuerpo con Scroll */}
        <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
            
            {/* 1. SECCIÓN PERSONAL Y CREDENCIALES */}
            <div className="space-y-3 p-4 bg-muted/10 rounded-lg">
                <h4 className="text-lg font-bold flex items-center text-yellow-400 border-b border-border pb-2 mb-3">
                    <UserIcon className="h-5 w-5 mr-2" /> Datos Personales
                </h4>
                <DetailRow label="ID de Sistema" value={user.id} />
                <DetailRow label="RUT" value={user.rut} />
                <DetailRow label="Nombre Completo" value={user.name} />
                <DetailRow label="Tipo de Usuario" value={getUserTypeLabel(user.userType)} />
                <DetailRow label="Contraseña" value={user.password} /> {/* ⚠️ Mostrar la contraseña SIN cifrado (solo para demo) */}
            </div>

            {/* 2. SECCIÓN DE CONTACTO Y FECHAS */}
            <div className="space-y-3 p-4 bg-muted/10 rounded-lg">
                <h4 className="text-lg font-bold flex items-center text-yellow-400 border-b border-border pb-2 mb-3">
                    <Mail className="h-5 w-5 mr-2" /> Contacto
                </h4>
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Fecha Nacimiento" value={user.birthdate} />
                <DetailRow label="Registro" value={new Date(user.createdAt).toLocaleDateString()} />
            </div>

            {/* 3. SECCIÓN DE DIRECCIÓN */}
            <div className="space-y-3 p-4 bg-muted/10 rounded-lg">
                <h4 className="text-lg font-bold flex items-center text-yellow-400 border-b border-border pb-2 mb-3">
                    <MapPin className="h-5 w-5 mr-2" /> Dirección Registrada
                </h4>
                <DetailRow label="Región" value={user.region} />
                <DetailRow label="Comuna" value={user.comuna} />
                <DetailRow label="Detalle (Calle/Número)" value={user.address} />
            </div>
            
        </div>
        
        {/* Footer fijo con botón de cierre */}
        <div className="p-4 border-t border-border flex justify-end">
            <Button onClick={onClose} variant="outline" className="text-foreground hover:bg-muted">
                Cerrar
            </Button>
        </div>

   </DialogContent>
  </Dialog>
 );
};
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title?: string;
  description?: string;
  showReasonSelect?: boolean; // 🟢 Nueva propiedad para activar el selector
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar eliminación",
  description = "Esta acción no se puede deshacer. Esto eliminará permanentemente los datos de nuestros servidores.",
  showReasonSelect = false,
}: DeleteConfirmDialogProps) {
  const [reason, setReason] = useState<string>("");

  // Limpiar selección cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(reason);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* 🟢 Selector de Motivos (Solo si showReasonSelect es true) */}
        {showReasonSelect && (
          <div className="py-4 border-t border-b border-border my-2">
            <Label className="text-base font-medium mb-3 block">
              ¿Por qué deseas eliminar a este vendedor?
            </Label>
            <RadioGroup value={reason} onValueChange={setReason} className="flex flex-col gap-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Despido" id="r1" />
                <Label htmlFor="r1" className="cursor-pointer">Despido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Renuncia" id="r2" />
                <Label htmlFor="r2" className="cursor-pointer">Renuncia</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Razones personales" id="r3" />
                <Label htmlFor="r3" className="cursor-pointer">Razones personales</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            // 🟢 Bloqueamos el botón si se requieren razones y no hay ninguna seleccionada
            disabled={showReasonSelect && !reason}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
import { useState } from 'react';
import { Product, ProductFormData } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

export const ProductForm = ({product, onSubmit, onCancel }: ProductFormProps) => {

  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    price: product?.price || 0,
    category: product?.category || 'accesorios', 
    description: product?.description || '',
    stock: product?.stock || 0,
    image: product?.image || '', // 💡 Debe ser cadena vacía si no hay imagen
    minStock: product?.minStock || 5, // 💡 Añadir el campo con un valor por defecto (ej. 5)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    
    setFormData((prev) => ({
        ...prev,
        [id]: type === 'number' 
            ? (value === '' ? 0 : parseFloat(value)) 
            : value,
    }));
  };

  // Definición de las categorías para el Select
  const categories: { value: ProductFormData['category']; label: string }[] = [
    { value: 'consolas', label: 'Consolas' },
    { value: 'computadores', label: 'Computadores' },
    { value: 'accesorios', label: 'Accesorios' },
    { value: 'juegos-mesa', label: 'Juegos de mesa' },
    { value: 'ropa', label: 'Ropa' },
  ];


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Nombre */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nombre del Producto *</Label>
          <Input
            id="name"
            placeholder="Ej: Consola Super X"
            value={formData.name}
            onChange={handleChange} 
            required
            className="bg-input border-border"
          />
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <Label htmlFor="price">Precio (CLP) *</Label>
          <Input
            id="price" 
            type="number" 
            placeholder="Ej: 49990"
            value={formData.price}
            onChange={handleChange}
            min=""
            required
            className="bg-input border-border"
          />
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            type="number" 
            placeholder="Ej: 25"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            required
            className="bg-input border-border"
          />
        </div>

        {/* Stock Mínimo (Mismo div que precio/stock) */}
        <div className="space-y-2">
          <Label htmlFor="minStock">Stock Mínimo de Alerta *</Label>
          <Input
            id="minStock"
            type="number" 
            placeholder="Ej: 5 (Valor de alerta)"
            value={formData.minStock}
            onChange={handleChange}
            min="0"
            required
            className="bg-input border-border"
          />
        </div>

        {/* Categoría (Select) */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria*</Label>

          <Select
            value={formData.category}
            // Simplificamos onValueChange para usar una sola función de flecha, más limpia
            onValueChange={(value) => setFormData({ ...formData, category: value as ProductFormData['category'] })}
          >

            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>

          </Select>

        </div>
        
        {/* Descripción */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Descripción detallada del producto..."
            value={formData.description}
            onChange={handleChange} 
            className="bg-input border-border"
            rows={4}
          />
        </div>
      </div> 
      
      {/* URL de Imagen */}
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="image">URL de la Imagen (Catálogo) *</Label>
        <Input
          id="image"
          placeholder="Ej: https://miservidor.com/imagen.jpg"
          value={formData.image}
          onChange={handleChange} 
          required
          className="bg-input border-border"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
          {product ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>
    </form>
  );
};

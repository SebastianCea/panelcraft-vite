import React from 'react';
import { Link } from 'react-router-dom'; 
import { Gamepad2, ShoppingBag, Cpu } from 'lucide-react';

// 💡 Componente simple con estructura básica, sin estilos complejos.
const FrontPage = () => {
  // Definición de las categorías para la sección de equipamiento
  const equipmentCategories = [
    "Periféricos", "Audio", "Video", "Monitores", "Almacenamiento", "Mobiliario"
  ];

  // Componente del Logo (Estructura simple)
  const SimpleLogo = () => (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold text-yellow-500">LEVEL UP</h1>
      <Gamepad2 className="h-12 w-12 text-purple-600 mt-2" />
    </div>
  );


  return (

    <div className="min-h-screen bg-black text-gray-900 flex flex-col justify-center items-center p-4">
      
      {/* 1. HEADER / LOGO */}
      <header className="text-center space-y-4 mb-8">
        <div className="flex justify-center">
                    <img 
                        src="/img/icono_levelup.PNG" // Ruta pública
                        alt="Logo Level-Up Gamer" 
                        className="w-64 md:w-96  h-auto neon-glow" // Clase para controlar el tamaño
                    />
                </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="w-full max-w-sm md:max-w-md space-y-6">
        
        {/* 2a. Sección de Equipamiento (Caja de Categorías) */}
        <div className="bg-purple-700 p-6 md:p-8 rounded-xl border border-purple-700/50 shadow-xl shadow-yellow-500/30">
          <h3 className="text-lg font-bold mb-3 text-yellow-500 flex items-center justify-center">
            <Cpu className="h-5 w-5 mr-2" />
            Equipamiento Gaming
          </h3>
          <p className="text-sm text-yellow-100 text-center leading-relaxed">
            {/* Lista de categorías separada por puntos */}
            {equipmentCategories.map((cat, index) => (
              <React.Fragment key={index}>
                {cat} {index < equipmentCategories.length - 1 ? '• ' : ''}
              </React.Fragment>
            ))}
          </p>
        </div>

        {/* 2b. Botón Principal */}
        <Link to="/home" className="block">
          <button 
            className="w-full py-4 text-lg md:text-xl font-bold rounded-xl 
                 bg-purple-600 text-white shadow-lg 
                 hover:bg-purple-700 transition-all duration-300"
          >
            <ShoppingBag className="inline h-6 w-3 mr-3" />
            ENTRAR A LA TIENDA
          </button>
        </Link>
        
      </main>

      {/* 3. FOOTER */}
      <footer className="mt-16 text-xs text-gray-500">
        <p>© 2025 Level-Up Gaming. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default FrontPage;
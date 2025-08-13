/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Escanea todos los archivos HTML y TypeScript en src
  ],
  theme: {
    extend: {
      // Paleta de colores personalizada para la aplicación "Campos Libres"
      colors: {
        'primary': {
          light: '#60a5fa', // Un azul más claro para hover o estados activos
          DEFAULT: '#3b82f6', // Azul principal para botones y enlaces
          dark: '#2563eb',  // Un azul más oscuro para bordes o texto
        },
        'secondary': {
          light: '#fde047',
          DEFAULT: '#facc15', // Amarillo/dorado para alertas o destaques
          dark: '#eab308',
        },
        'neutral': {
          light: '#f9fafb', // Gris muy claro para fondos de sección
          DEFAULT: '#6b7280', // Gris para texto secundario
          dark: '#1f2937',  // Gris oscuro para la barra lateral y texto principal
        },
        'success': '#10b981', // Verde para mensajes de éxito
        'danger': '#ef4444',  // Rojo para mensajes de error o botones de eliminar
        'info': '#0ea5e9',    // Cian para mensajes informativos
      },
    },
  },
  plugins: [],
};

# USS GEX — Portal de Consulta y Verificación "Gente con Experiencia"

Portal oficial y aplicativo web para la verificación y consulta en tiempo real del estado académico y de acreditación de estudiantes del programa **Gente con Experiencia (GEX)** del Centro de Informática (**CINF**) de la **Universidad Señor de Sipán**.

---

## 🏛️ Características Principales

- **Conexión en Vivo con Google Sheets**: Lee directamente el archivo publicado de Google Drive en tiempo real sin bases de datos intermedias de alumnos.
- **Respaldo Automático de Archivo Excel**: Sincroniza y respalda el binario nativo `.xlsx` en Base64 en Supabase (`tbl_gex_cargas`) cada vez que se detectan cambios en la fuente oficial.
- **Buscador Predictivo Autocomplete**: Consulta instantánea por Código Universitario, Apellidos, Nombres o Correo Institucional.
- **Vista de Detalle 1/3 y 2/3**:
  - **1/3 (Nav Izquierdo)**: Ficha de datos personales y académicos del estudiante (Apellidos, Nombres, Escuela, Ciclo, Campus, Modalidad, Correo, Teléfono).
  - **2/3 (Sección de Cursos)**: Estado de acreditación oficial con cálculo de progreso independiente.
- **Reglas Curriculares CINF USS**:
  - **Plan Tradicional (Base: 3 cursos)**: Computación I, II y III (cada uno 33.3%).
  - **Plan Rutas de Aprendizaje (Base: 4 componentes)**: Módulo Genérico, Específico y Taller de Certificación MOS (cada uno 25%).
- **Diseño Responsivo**: En escritorio la ficha cabe en una sola pantalla (`100vh`); en el celular fluye con scroll, con header fijo, pestañas por plan y modales que abren desde abajo.
- **Ilustraciones por curso**: Cada tarjeta lleva un único dibujo propio en la esquina (`CourseIllustration.tsx`), sin mosaicos repetidos de fondo.
- **Identidad Institucional USS**: Paleta de colores `#073299`, tipografías institucionales y modo de alto contraste.

---

## 🛠️ Tecnologías

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **SheetJS (xlsx)**
- **Supabase JS**
- **Lucide React**

---

## 🚀 Instalación y Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar pruebas y verificación de tipos
npm test

# Compilar para producción
npm run build
```


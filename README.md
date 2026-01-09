**Sistema de Gestion de Reservas con Pronostico de Recursos**

Sistema de Gestión y reserva de espacios y recursos académicos con módulo de pronóstico (Core) para proyectar demanda y cobertura de recursos a partir del historial de reservas.

**Caracteristicas Principales**
**Gestión académica**
- CRUD de Facultades, Carreras y Materias.
- Relación jerárquica

**Gestión de infraestructura**
- CRUD de Espacios (capacidad, tipo, ubicación, etc.).
- CRUD de Recursos (tipo, código, estado, asignación a espacios, etc.).

**Reservas**
- Registro de reservas por usuario, espacio, recurso(s) y rango de tiempo.
- Validaciones: disponibilidad / conflictos / reglas.

**Core (Pronóstico)**
- Calcula proyección de demanda usando estrategias intercambiables (Patrón Strategy).

**Tecnologias Utilizadas** 
**Backend**
Node.js
Express.js
MongoDB - Base de datos NoSQL
Mongoose - ODM para MongoDB
JWT - Autenticación basada en tokens
CORS - Manejo de políticas de origen cruzado

**Frontend** 
Vue.js 3
TypeScript 
Vue Router 
Vite (entorno de desarrollo y build)
CSS3 - Estilos modernos y responsive
Axios - consumo de la API

**Instalación y Configuración (ReserveHUB)**
Prerrequisitos
Node.js (versión 18 o superior)
MongoDB (local o MongoDB Atlas)
npm

1. Clonar el repositorio
git clone <url-del-repositorio>
cd ReserveHUB

2. Instalar dependencias

*Backend*
cd backend
npm install

*Frontend*
cd reservedhub-frontend
npm install 

3. Configurar variables de entorno
El sistema está preconfigurado para usar MongoDB Atlas.
Si deseas usar tu propia base de datos, cambia MONGO_URI en el archivo .env.

4. Ejecutar en modo desarrollo
**Backend**
Backend (Puerto 4000)
cd ../backend
npm run dev

**Frontend**
Frontend (Puerto 5173)
cd reservedhub-frontend
npm run dev

**.env example**
PORT=4000
MONGO_URI=mongodb+srv://<usuario>:<password>@reservehub.b8viire.mongodb.net/reservehub?retryWrites=true&w=majority&appName=ReserveHUB
JWT_SECRET=super_secreto_reservehub

**Credenciales Demo**
Email: Prueba@reserved.com
Contraseña: 123456

Repositorio GitHub Link: https://github.com/Leninmax27/PreservedHub.git 

Recursos de aprendizaje: https://www.youtube.com/watch?v=_7UQPve99r4&t=208s

Página deployada: Link: https://preservedhub.onrender.com 

Video explicativo: Link: https://youtu.be/gDI2Kc3BkHw 
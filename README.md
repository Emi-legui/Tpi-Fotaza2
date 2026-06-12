# TPI Fotaza 2

Trabajo Práctico Integrador de la Materia Programación Web II.

**Fotaza 2** es una plataforma web desarrollada en Node.js, Express y Sequelize que permite almacenar, buscar, calificar, comentar y vender fotografías artísticas en un entorno seguro y moderado.

---

## 🚀 Instalación y Ejecución Local

Sigue exactamente estos pasos para preparar y correr la aplicación en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Emi-legui/Tpi-Fotaza2.git
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configuración de Variables de Entorno (.env):**
   Crea un archivo `.env` en la raíz del proyecto (puedes basarte en `.env.example`) y completa los datos de tu conexión local a **PostgreSQL**:
   ```env
   DB_NAME=fotaza2
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña_aqui
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=una_frase_muy_larga_y_secreta_12345
   PORT=3000
   ```

4. **Inicializar y Sembrar la Base de Datos:**
   Ejecuta el script de inicialización para crear las tablas en 3FN e insertar todos los usuarios y datos semilla:
   ```bash
   npm run db:init
   ```

5. **Iniciar el Servidor:**
   ```bash
   npm start
   ```
   La aplicación estará accesible en: [http://localhost:3000](http://localhost:3000)

---

## 👥 Cuentas de Prueba Sembradas

Para evaluar las diferentes funcionalidades y roles del sistema, puedes iniciar sesión con las siguientes credenciales:

| Rol / Usuario | Correo Electrónico | Contraseña | Propósito |
| :--- | :--- | :--- | :--- |
| **Validador (Admin)** | `validador@fotaza.com` | `adminpassword` | Permite acceder al panel de moderación, dar de baja publicaciones y resolver denuncias. |
| **Usuario 1 (Carlos)** | `carlos@gmail.com` | `userpassword` | Subir contenido, calificar, seguir a María, comentar. |
| **Usuario 2 (María)** | `maria@gmail.com` | `userpassword` | Subir contenido con Copyright y marca de agua, colecciones. |
| **Usuario 3 (Juan)** | `juan@gmail.com` | `userpassword` | Comprar imágenes, notificar interés. |

---

## 🌟 Características Clave Implementadas

1. **Sistema de Autenticación Robustas:** Registro e inicio de sesión usando contraseñas encriptadas con `bcrypt` y sesiones controladas mediante tokens `JWT` almacenados en cookies seguras (`httpOnly`).
2. **Subida de Archivos y Marca de Agua:** Carga de fotos mediante `multer` y estampado dinámico de marca de agua de texto personalizado en fotos con Copyright utilizando la librería `Jimp`.
3. **Calificación y Votos:** Valoración de 1 a 5 estrellas para publicaciones de otros autores (restricción única de un voto por usuario, exclusión del autor).
4. **Comunidad y Seguimiento (Social):** Seguir y dejar de seguir a otros perfiles, contadores de seguidores/seguidos y feed exclusivo de publicaciones de cuentas seguidas.
5. **Comentarios Dinámicos:** Módulo de comentarios en fotos. Los autores pueden cerrar los comentarios de sus imágenes en cualquier momento.
6. **Denuncias y Moderación (Validator):**
   - Denunciar posts bloquea su edición de forma inmediata.
   - Denunciar comentarios (el autor de la foto puede eliminarlos).
   - Acumulación de 3 denuncias de distintos usuarios envía el contenido a la lista de trabajo del **Validador de Contenidos**.
   - Si un usuario acumula 3 publicaciones dadas de baja por el validador, **su cuenta se inactiva automáticamente**.
7. **Colecciones y Favoritos:** Guardar fotos rápidas en Favoritos personales y gestionar álbumes/colecciones personalizadas (evitando duplicación).
8. **Centro de Notificaciones:** Avisos automatizados al recibir valoraciones, comentarios, nuevos seguidores o compras.
9. **Mensajería de Venta Privada:** Botón "Me Interesa" que comparte perfiles de contacto y abre automáticamente una sala de chat privado para negociar la venta de la foto.
10. **Diseño de Interfaz Premium:** Vistas totalmente renderizadas en el servidor usando `PUG` con una estética moderna en modo oscuro, variables CSS, gradientes, transiciones suaves y layout responsivo.
11. **Algoritmo de Balance en Home:** Prioriza en la home imágenes altamente puntuadas con un número considerable de votos, mezclándolas equitativamente con fotos comunes para garantizar visibilidad general.
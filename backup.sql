-- Copia de seguridad / Inicialización para Fotaza 2 (PostgreSQL)

-- 1. Eliminar tablas existentes si existen
DROP TABLE IF EXISTS "mensajes" CASCADE;
DROP TABLE IF EXISTS "colecciones_publicaciones" CASCADE;
DROP TABLE IF EXISTS "colecciones" CASCADE;
DROP TABLE IF EXISTS "notificaciones" CASCADE;
DROP TABLE IF EXISTS "seguidores" CASCADE;
DROP TABLE IF EXISTS "valoraciones" CASCADE;
DROP TABLE IF EXISTS "publicaciones_etiquetas" CASCADE;
DROP TABLE IF EXISTS "etiquetas" CASCADE;
DROP TABLE IF EXISTS "denuncias" CASCADE;
DROP TABLE IF EXISTS "comentarios" CASCADE;
DROP TABLE IF EXISTS "publicaciones" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- 2. Crear tablas
CREATE TABLE "Users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "es_validador" BOOLEAN DEFAULT FALSE,
    "esta_activo" BOOLEAN DEFAULT TRUE,
    "publicaciones_bajadas" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "publicaciones" (
    "id" SERIAL PRIMARY KEY,
    "titulo" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "imagen" VARCHAR(255) NOT NULL,
    "licencia" VARCHAR(50) DEFAULT 'libre' CHECK ("licencia" IN ('copyright', 'libre')),
    "marca_agua_texto" VARCHAR(255),
    "comentarios_abiertos" BOOLEAN DEFAULT TRUE,
    "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL,
    "id_autor" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "comentarios" (
    "id" SERIAL PRIMARY KEY,
    "contenido" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL,
    "id_usuario" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "id_publicacion" INTEGER REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "denuncias" (
    "id" SERIAL PRIMARY KEY,
    "motivo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "estado" VARCHAR(50) DEFAULT 'pendiente' CHECK ("estado" IN ('pendiente', 'resuelta', 'rechazada')),
    "fecha_denuncia" TIMESTAMP WITH TIME ZONE NOT NULL,
    "id_usuario_denunciante" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "id_publicacion" INTEGER REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "id_comentario" INTEGER REFERENCES "comentarios"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "etiquetas" (
    "id" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE "publicaciones_etiquetas" (
    "id" SERIAL PRIMARY KEY,
    "id_publicacion" INTEGER REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "id_etiqueta" INTEGER REFERENCES "etiquetas"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("id_publicacion", "id_etiqueta")
);

CREATE TABLE "valoraciones" (
    "id" SERIAL PRIMARY KEY,
    "calificacion" INTEGER NOT NULL CHECK ("calificacion" >= 1 AND "calificacion" <= 5),
    "fecha_valoracion" TIMESTAMP WITH TIME ZONE NOT NULL,
    "id_usuario" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "id_publicacion" INTEGER REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("id_usuario", "id_publicacion")
);

CREATE TABLE "seguidores" (
    "id" SERIAL PRIMARY KEY,
    "fecha_seguimiento" TIMESTAMP WITH TIME ZONE NOT NULL,
    "id_seguidor" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "id_seguido" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("id_seguidor", "id_seguido")
);

CREATE TABLE "notificaciones" (
    "id" SERIAL PRIMARY KEY,
    "tipo_evento" VARCHAR(50) NOT NULL CHECK ("tipo_evento" IN ('comentario', 'valoracion', 'interes', 'seguimiento')),
    "leida" BOOLEAN DEFAULT FALSE,
    "fecha" TIMESTAMP WITH TIME ZONE NOT NULL,
    "id_usuario_destino" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "id_usuario_origen" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "id_publicacion" INTEGER REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "colecciones" (
    "id" SERIAL PRIMARY KEY,
    "nombre" VARCHAR(100) NOT NULL,
    "fecha_creacion" TIMESTAMP WITH TIME ZONE NOT NULL,
    "id_usuario" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("nombre", "id_usuario")
);

CREATE TABLE "colecciones_publicaciones" (
    "id" SERIAL PRIMARY KEY,
    "id_coleccion" INTEGER REFERENCES "colecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "id_publicacion" INTEGER REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("id_coleccion", "id_publicacion")
);

CREATE TABLE "mensajes" (
    "id" SERIAL PRIMARY KEY,
    "contenido" TEXT NOT NULL,
    "fecha_envio" TIMESTAMP WITH TIME ZONE NOT NULL,
    "id_remitente" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "id_destinatario" INTEGER REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "id_publicacion" INTEGER REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3. Insertar datos semilla
-- Contraseñas hasheadas:
INSERT INTO "Users" ("id", "username", "email", "password", "es_validador", "esta_activo", "publicaciones_bajadas", "createdAt", "updatedAt") VALUES
(1, 'admin_validador', 'validador@fotaza.com', '$2a$10$wKz0b1K2Y6s78wH4lZc6c.LqY4jD2YlY2JtN8o2.K03QpD0E296v.', TRUE, TRUE, 0, NOW(), NOW()),
(2, 'carlos_perez', 'carlos@gmail.com', '$2a$10$v4R1G7d4G6r5O9g2r4G7e.Jv7D2G1J5v3zN6g2.P03QpD0E296v.', FALSE, TRUE, 0, NOW(), NOW()),
(3, 'maria_lopez', 'maria@gmail.com', '$2a$10$v4R1G7d4G6r5O9g2r4G7e.Jv7D2G1J5v3zN6g2.P03QpD0E296v.', FALSE, TRUE, 0, NOW(), NOW()),
(4, 'juan_gomez', 'juan@gmail.com', '$2a$10$v4R1G7d4G6r5O9g2r4G7e.Jv7D2G1J5v3zN6g2.P03QpD0E296v.', FALSE, TRUE, 0, NOW(), NOW());

INSERT INTO "etiquetas" ("id", "nombre") VALUES
(1, 'paisaje'),
(2, 'naturaleza'),
(3, 'urbano'),
(4, 'arquitectura'),
(5, 'retrato');

INSERT INTO "publicaciones" ("id", "titulo", "descripcion", "imagen", "licencia", "marca_agua_texto", "comentarios_abiertos", "fecha_creacion", "id_autor") VALUES
(1, 'Atardecer en la montaña', 'Un hermoso atardecer libre de copyright para uso público.', '/uploads/atardecer.png', 'libre', NULL, TRUE, NOW(), 2),
(2, 'Rascacielos de noche', 'Fotografía nocturna protegida de la gran ciudad.', '/uploads/rascacielos.png', 'copyright', '© Maria Lopez', TRUE, NOW(), 3),
(3, 'Flores silvestres', 'Detalle macro de flores en primavera.', '/uploads/flores.png', 'libre', NULL, TRUE, NOW(), 4);

INSERT INTO "publicaciones_etiquetas" ("id_publicacion", "id_etiqueta") VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4),
(3, 2);

INSERT INTO "comentarios" ("id", "contenido", "fecha_creacion", "id_usuario", "id_publicacion") VALUES
(1, '¡Qué hermosos colores en ese cielo!', NOW(), 3, 1),
(2, 'Espectacular toma, ¿usaste un trípode?', NOW(), 4, 1),
(3, 'Increíble perspectiva y nitidez.', NOW(), 2, 2);

INSERT INTO "valoraciones" ("id", "calificacion", "fecha_valoracion", "id_usuario", "id_publicacion") VALUES
(1, 5, NOW(), 3, 1),
(2, 4, NOW(), 4, 1),
(3, 5, NOW(), 2, 2);

INSERT INTO "seguidores" ("id_seguidor", "id_seguido", "fecha_seguimiento") VALUES
(2, 3, NOW()),
(3, 2, NOW()),
(4, 2, NOW());

INSERT INTO "notificaciones" ("id", "tipo_evento", "leida", "fecha", "id_usuario_destino", "id_usuario_origen", "id_publicacion") VALUES
(1, 'comentario', FALSE, NOW(), 2, 3, 1),
(2, 'valoracion', FALSE, NOW(), 2, 4, 1),
(3, 'seguimiento', FALSE, NOW(), 3, 2, NULL);

INSERT INTO "colecciones" ("id", "nombre", "fecha_creacion", "id_usuario") VALUES
(1, 'Favoritos', NOW(), 3);

INSERT INTO "colecciones_publicaciones" ("id_coleccion", "id_publicacion") VALUES
(1, 1);

-- Ajustar los generadores de secuencia para SERIAL en PostgreSQL
SELECT setval('public."Users_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "Users"), 1), false);
SELECT setval('public."publicaciones_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "publicaciones"), 1), false);
SELECT setval('public."comentarios_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "comentarios"), 1), false);
SELECT setval('public."denuncias_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "denuncias"), 1), false);
SELECT setval('public."etiquetas_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "etiquetas"), 1), false);
SELECT setval('public."publicaciones_etiquetas_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "publicaciones_etiquetas"), 1), false);
SELECT setval('public."valoraciones_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "valoraciones"), 1), false);
SELECT setval('public."seguidores_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "seguidores"), 1), false);
SELECT setval('public."notificaciones_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "notificaciones"), 1), false);
SELECT setval('public."colecciones_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "colecciones"), 1), false);
SELECT setval('public."colecciones_publicaciones_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "colecciones_publicaciones"), 1), false);
SELECT setval('public."mensajes_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "mensajes"), 1), false);

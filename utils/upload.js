import multer from 'multer';
import path from 'path';

// Configuración del almacenamiento para multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.VERCEL ? '/tmp' : 'public/uploads/');
    },
    filename: (req, file, cb) => {
        // Nombre de archivo unico usando timestamp y numeros aleatorios
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `foto-${uniqueSuffix}${ext}`);
    }
});

// Filtro de tipos de archivos permitidos (solo imágenes)
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Solo se admiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
    }
};

// Inicializar multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
    fileFilter: fileFilter
});

export default upload;

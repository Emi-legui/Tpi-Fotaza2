import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuracion de Cloudinary 
cloudinary.config({
  cloud_name: process.env.NOMBRE_DE_LA_NUBE_CLOUDINARY,
  api_key: process.env.CLAVE_API_DE_CLOUDINARY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuracion del almacenamiento en la nube
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fotaza_uploads', // Nombre de la carpeta que se creara solo en tu cuenta
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

export default upload;
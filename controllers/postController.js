import Denuncia from '../models/denuncia.js';

//funcion para contar las denuncias
export async function verificarEstadoPublicacion(id_publicacion) {
    const cantidadDenuncias = await Denuncia.count({
        where: { 
            id_publicacion: id_publicacion, 
            estado: 'pendiente' 
        }
    });
    
    // Devuelve true si tiene 3 o mas, false si tiene menos
    return cantidadDenuncias >= 3;
}
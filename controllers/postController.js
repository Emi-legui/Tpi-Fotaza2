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

//funcion para obtener las denuncias pendientes
export async function obtenerDenunciasPendientes(req, res) {
    try {
        // Buscamos todas las denuncias con estado pendiente
        const denuncias = await Denuncia.findAll({
            where: {
                estado: 'pendiente'
            }
        });
        
        // Enviamos las denuncias encontradas al validador
        res.json(denuncias);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener denuncias pendientes', 
            message: error.message 
        });
    }
}
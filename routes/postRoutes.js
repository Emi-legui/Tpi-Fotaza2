import express from 'express';
import Post from '../models/Post.js';

//Creamos un router 
// para agrupar todas las rutas relacionadas con los posts(publicaciones)
const router = express.Router(); 

router.post('/create', async (req, res) => {
    try{
        //se obtienen los datos que envia el usuario
        const{titulo, descripcion, id_autor} = req.body;

        const nuevoPost = await Post.create({
            titulo,
            descripcion,
            id_autor //se asigna el id del autor al post(publicacion)
        });
//si la publicacion se crea con exito se responde con un mensaje de exito y los datos de la nueva publicacion
    res.status(201).json({
        message: 'Publicacion creada con exito',
        post: nuevoPost
    })
    }catch(error){
//si ocurre un error al crear la publicacion se responde con un mensaje de error y el detalle del error
        res.status(500).json({
            error: 'Error al crear la publicacion',
            message: error.message   
        });
    }
});

//Listar todas las publicaciones
router.get('/', async (req, res) => {
    try{
        //le pedios a la bd que busque rodos los registros de publicaciones
        const publicaciones = await Post.findAll();
        res.json(publicaciones);

    }catch(error){
        //si la consuta falla se responde con un mensaje de error y el detalle del error
        res.status(500).json({
            error: 'Error al obtener las publicaciones',
            message: error.message
        });
    }
});
export default router;
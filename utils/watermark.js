import Jimp from 'jimp';

/**
 * Aplica una marca de agua de texto en la esquina inferior derecha de una imagen.
 * @param {string} imagePath Ruta de la imagen en el servidor
 * @param {string} text Texto de la marca de agua (ej: "© Emiliano Leguizamon")
 */
export async function aplicarMarcaDeAgua(imagePath, text) {
    try {
        const image = await Jimp.read(imagePath);
        
        // Cargar fuente blanca estándar de Jimp
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        
        // Calcular dimensiones del texto
        const textWidth = Jimp.measureText(font, text);
        const textHeight = Jimp.measureTextHeight(font, text, image.bitmap.width);
        
        // Colocar la marca en la esquina inferior derecha con un margen de 20px
        const x = image.bitmap.width - textWidth - 20;
        const y = image.bitmap.height - textHeight - 20;
        
        // Imprimir el texto de la marca de agua en la imagen
        image.print(
            font,
            x > 10 ? x : 10, // Asegurar que no se salga del margen izquierdo si la imagen es muy angosta
            y > 10 ? y : 10,
            text
        );
        
        // Guardar la imagen procesada reemplazando la original
        await image.writeAsync(imagePath);
        console.log(`Marca de agua "${text}" aplicada correctamente a ${imagePath}`);
    } catch (error) {
        console.error('Error al aplicar la marca de agua con Jimp:', error);
        throw error;
    }
}

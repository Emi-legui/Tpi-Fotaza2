import { Jimp, loadFont, measureText, measureTextHeight } from 'jimp';
import { SANS_32_WHITE } from 'jimp/fonts';

/**
 * Aplica una marca de agua de texto en la esquina inferior derecha de una imagen.
 * @param {string} imagePath Ruta de la imagen en el servidor
 * @param {string} text Texto de la marca de agua (ej: "© Carlos Perez")
 */
export async function aplicarMarcaDeAgua(imagePath, text) {
    try {
        const image = await Jimp.read(imagePath);
        
        // Cargar fuente blanca estándar de Jimp v1
        const font = await loadFont(SANS_32_WHITE);
        
        // Calcular dimensiones del texto
        const textWidth = measureText(font, text);
        const textHeight = measureTextHeight(font, text, image.bitmap.width);
        
        // Colocar la marca en la esquina inferior derecha con un margen de 20px
        const x = image.bitmap.width - textWidth - 20;
        const y = image.bitmap.height - textHeight - 20;
        
        // Imprimir el texto de la marca de agua en la imagen (usando la API de Jimp v1)
        image.print({
            font,
            x: x > 10 ? x : 10, // Asegurar que no se salga del margen izquierdo si la imagen es muy angosta
            y: y > 10 ? y : 10,
            text
        });
        
        // Guardar la imagen procesada reemplazando la original
        await image.write(imagePath);
        console.log(`Marca de agua "${text}" aplicada correctamente a ${imagePath}`);
    } catch (error) {
        console.error('Error al aplicar la marca de agua con Jimp v1:', error);
        throw error;
    }
}

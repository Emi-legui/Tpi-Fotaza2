import 'dotenv/config';
import { Sequelize } from 'sequelize';

const connectionString = process.env.DATABASE_URL;

const sequelize = connectionString
    ? new Sequelize(connectionString, {
        dialect: 'postgres',
        logging: false, // Evita llenar la consola con logs de SQL en producción
        dialectOptions: {
            ssl: connectionString.includes('render.com')
                ? {
                    require: true,
                    rejectUnauthorized: false // Requerido por Render para conexiones seguras
                  }
                : false
        }
      })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'postgres',
            port: process.env.DB_PORT || 5432,
        }
      );
export default sequelize;
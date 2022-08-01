import { getData } from "../config/connection.config.js";
import { DataTypes, UUIDV4 } from "sequelize";

const products = getData.sequelizeClient.define(
  "cat_products",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nameProduc:{
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "ingrese una descripcion",
        },
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "ingrese una descripcion",
        },
      },
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Ingrese un precio",
        },
      },
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Ingrese cantidad",
        },
      },
    },
  },
  {
    tableName: "cat_products",
    freezeTableName: true,
  }
);

export const getProduc = { products };

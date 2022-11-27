const db = require("../database/models");
const sequelize = db.sequelize;

const genresController = {
  list: async (req, res) => {


    try {
      let { order = "id" } = req.query;
      let orders = ["id", "name", "ranking"];

      if (!orders.includes(order)) {
        throw new Error(`El Campo ${order} no existe. Campos admitidos : [name,ranking]`);
      }

      let genres = await db.Genre.findAll({
        order: [order],
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
      });
      if (genres.length) {
        return res.status(200).json({
          ok: true,
          meta: {
            total: genres.length,
          },
          data: genres,
        });
      }
      throw new Error("Ups, no hay géneros");
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        ok: false,
        msg: error.message ? error.message : "Comuníquese con el administrador del sitio",
      });
    }
  },
  detail: async (req, res) => {
    try {

        const {id} = req.params

        if(isNaN(id)){
            throw new Error('El ID debe ser un número!!')
        }

        let genre = await db.Genre.findByPk(id,{
          attributes: {
            exclude: ["created_at", "updated_at"],
          }
        });

        if (genre) {
            return res.status(200).json({
              ok: true,
              meta: {
                status: 200
              },
              data: genre,
            });
          }
          throw new Error('Ups, no se encuentra el género')

    }catch (error) {
        console.log(error);
        return res.status(500).json({
          ok: false,
          msg: error.message ? error.message : "Comuníquese con el administrador del sitio",
        });
  }
}
}

module.exports = genresController;

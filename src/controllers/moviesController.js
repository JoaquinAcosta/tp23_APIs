const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    list: async (req, res) => {

        try {
            let { order = "id" } = req.query;
            let orders = ["id","title","rating","awards","release_date","genre_id",];

            if(!orders.includes(order)) {
                throw new Error (`El campo ${order} no existe. Campos admitidos : [title,rating,awards,release_date,genre_id]`)
            }

            let movies = await db.Movie.findAll({
                include: [
                    {
                        association : 'genre',
                        attributes : ['name']
                    }
                ],
                order : [order],
                attributes: {
                  exclude: ["created_at", "updated_at"],
                },
            });
            if (movies.length) {
                return res.status(200).json({
                    ok : true,
                    meta: {
                        total: movies.length,
                    },
                    data: movies,
                });
            }
            throw new Error("Ups, no hay películas");
        } catch (error) {
            console.log(error);
            return res.status(500).json({
              ok: false,
              msg: error.message ? error.message : "Comuníquese con el administrador del sitio",
            });
          }

          
    },
    detail: async (req, res) => {
        let error;
        try {
            const {id} = req.params

            if(isNaN(id)){
                error = new Error('Ups, no se encuentra la película');
                error.status= 401;
                throw error;
            }

            let movie = await db.Movie.findByPk(id,{
                include : [{
                    all : true
                }]
            });

            if (movie) {
                return res.status(200).json({
                    ok: true,
                    meta: {
                        total : 1
                    },
                    data: movie,
                });
            };
            
            error = new Error('Ups, no se encuentra la película');
            error.status= 403;
            throw error;

        }catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg : error.message ? error.message : "Comuníquese con el administrador del sitio",
            });
        }
    },
    newest: async (req, res) => {

        try {

            let movies = await db.Movie.findAll({
                order : [
                    ['release_date', 'DESC']
                ],
                limit: +req.query.limit || 5
            });

            if(movies.length){
                return res.status(200).json({
                    ok: true,
                    meta : {
                        total : movies.length
                    },
                    data : movies
                })
            };

            error = new Error('Ups, no hay peliculas');
            error.status= 403;
            throw error;
            
        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg : error.message ? error.message : "Comuníquese con el administrador del sitio",
            });
        }
        
    },
    recomended: async (req, res) => {
        let error;
        try {
           let movies = await db.Movie.findAll({
                include: ['genre'],
                limit: +req.query.limit || 5,
                order: [
                    ['rating', 'DESC']
                ]
            })

            if(movies.length){
                return res.status(200).json({
                    ok: true,
                    meta : {
                        total : movies.length
                    },
                    data : movies
                })
            };

            error = new Error('Ups, no hay peliculas');
            error.status= 403;
            throw error;

        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg : error.message ? error.message : "Comuníquese con el administrador del sitio",
            });
            
        }
        
        
    },
    //Aqui dispongo las rutas para trabajar con el CRUD

    create: async (req,res) => {
        const {title, rating, awards, release_date, length, genre_id} = req.body;
    try {
        let newMovie = await db.Movie.create(
            {
                title: title && title.trim(),
                rating: rating,
                awards: awards,
                release_date: release_date,
                length: length,
                genre_id: genre_id
            }
        )

        if(newMovie){
            return res.status(200).json({
                ok: true,
                meta : {
                    total : 1,
                    url : `${req.protocol}://${req.get('host')}/movies/${newMovie.id}`
                },
                data : newMovie
            })
        };

    } catch (error) {
        console.log(error);
            return res.status(error.status || 500).json({
                ok: false,
                msg : error.message ? error.message : "Comuníquese con el administrador del sitio",
            });
    }

    },

    update: function (req,res) {
        let movieId = req.params.id;
        Movies
        .update(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            },
            {
                where: {id: movieId}
            })
        .then(()=> {
            return res.redirect('/movies')})            
        .catch(error => res.send(error))
    },
    destroy: function (req,res) {
        let movieId = req.params.id;
        Movies
        .destroy({where: {id: movieId}, force: true}) // force: true es para asegurar que se ejecute la acción
        .then(()=>{
            return res.redirect('/movies')})
        .catch(error => res.send(error)) 
    }
}

module.exports = moviesController;
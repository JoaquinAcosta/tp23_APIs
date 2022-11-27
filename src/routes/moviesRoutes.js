const express = require('express');
const router = express.Router();
const {list, detail, newest, recomended, create, update, destroy} = require('../controllers/moviesController');

router
    .get('/movies', list)
    .get('/movies/:id', detail)
    .get('/movies/new', newest)
    .get('/movies/recommended', recomended)
    
    .post('/movies', create)
    .put('/movies/:id', update)
    .delete('/movies/:id', destroy)

module.exports = router;
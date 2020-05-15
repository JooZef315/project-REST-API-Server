const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');
const cors = require('./cors');

var favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({User: req.user._id })
    .populate('User')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
  Favorites.findOne({User: req.user._id })
  .then((favorite) => {
    if(req.body.length > -1) {
      if (!favorite) {
        Favorites.create({User: req.user._id })
        .then((favorite) => {
          for (var i = 0; i < req.body.length; i++) {
              if (favorite.dishes.indexOf(req.body[i]._id) <0)           {favorite.dishes.push(req.body[i]);}
          }
          favorite.save()
          .then((favorite) => {
              console.log('list created!');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
          }, (err) => next(err));
        }, (err) => next(err)).catch((err) => next(err));
      }
      else{
        for (var i = 0; i < req.body.length; i++) {
            if (favorite.dishes.indexOf(req.body[i]._id) < 0) {favorite.dishes.push(req.body[i]);}
        }
        favorite.save()
        .then((favorite) => {
            console.log('dish added!');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err)).catch((err) => next(err));
      }
    }
    else {
      var err = new Error("You must choose a dish!!");
      res.statusCode = 403;
      return next(err);
    }
  },(err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser ,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser ,(req, res, next) => {
    Favorites.deleteMany({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,  authenticate.verifyUser , (req,res,next) => {
  res.statusCode = 403;
  res.end('get operation not supported on /favorites');
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
  Favorites.findOne({User: req.user._id })
  .then((favorite) => {
    if (!favorite) {
        Favorites.create({User: req.user._id })
        .then((favorite) => {
        if (!favorite.dishes.includes(req.params.dishId)) {
          favorite.dishes.push({"_id":req.params.dishId})
          favorite.save()
          .then((favorite) => {
              console.log('list created!');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
          }, (err) => next(err));
        }
        else {
          var err = new Error("dish already in your list!!");
          res.statusCode = 403;
          return next(err);
        }
      }, (err) => next(err)).catch((err) => next(err));
    }
    else {
      if (!favorite.dishes.includes(req.params.dishId)) {
        favorite.dishes.push({"_id": req.params.dishId})
        favorite.save()
        .then((favorite) => {
            console.log('dish added!');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        }, (err) => next(err)).catch((err) => next(err));
      }
      else {
        var err = new Error("dish already in your list!!");
        res.statusCode = 403;
        return next(err);
      }
    }
  },(err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites' + req.params.dishId);

})
.delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
  Favorites.findOne({User: req.user._id})
  .then((favorite) => {
    if (favorite != null) {
      for (var i = 0; i < favorite.dishes.length; i++) {
        if (favorite.dishes[i] == req.params.dishId) {
          favorite.dishes.splice(i,1);
        }
      }
      favorite.save()
      .then((favorite) => {
          // Favorites.findById(favorite._id)
          // .populate('User')
          // .populate('dishes')
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
      }, (err) => next(err))
    }
    else {
      var err = new Error("not found to delete!!");
      res.statusCode = 404;
      return next(err);
    }
  },(err) => next(err))
  .catch((err) => next(err));
});


module.exports = favoritesRouter;

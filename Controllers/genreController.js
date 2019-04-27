var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.genre_list = (req, res, next) => {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec(function(err, list_genres) {
            if(err) {return next(err);}
            res.render('genre_list', {title: 'Genre List', genre_list: list_genres});
        });
};

exports.genre_detail = (req, res, next) => {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function(callback) {
            Book.find({'genre': req.params.id})
                .exec(callback);
        },
    }, function(err, results) {
        if(err) {return next(err);}
        if(results.genre == null) {
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_detail', {title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books});
    }
    );
};
exports.genre_create_get = (req, res, next) => {res.render('genre_form', {title: 'Create Genre'});};
// Handle Genre create on POST.
exports.genre_create_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var genre = new Genre(
          { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name })
                .exec( function(err, found_genre) {
                     if (err) { return next(err); }

                     if (found_genre) {
                         // Genre exists, redirect to its detail page.
                         res.redirect(found_genre.url);
                     }
                     else {

                         genre.save(function (err) {
                           if (err) { return next(err); }
                           // Genre saved. Redirect to genre detail page.
                           res.redirect(genre.url);
                         });

                     }  

                 });
        }
    }
];
exports.genre_delete_get = (req, res, next) => {
    async.parallel({
       genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
       },
       genre_books: function(callback) {
           Book.find({'genre': req.param.id}).exec(callback);
       }
    }, function(err, results) {
        if(err) {return next(err);}
        if(results.genre_books == null) {
            res.redirect('/catalog/genres');
        }
        res.render('genre_delete', {title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books});
    });
};
exports.genre_delete_post = (req, res, next) => {
    async.parallel({
        genre: function(callback) {
             Genre.findById(req.body.id).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({'genre': req.body.id}).exec(callback);
        }
     }, function(err, results) {
        if(err) {return next(err);}
        if(results.genre_books.length > 0) {
            res.render('genre_delete', {title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books});
        }
        else {
            Genre.findByIdAndRemove(req.body.id, function deleteGenre(err) {
                if(err) {return next(err);}
                res.redirect('/catalog/genres');
            });
        }
     });
};
exports.genre_update_get = (req, res, next) => {
    res.render('genre_form', {title: 'Update Genre'});
};
exports.genre_update_post = [
    body('name').isLength({min: 1}).withMessage('name is required'),

    sanitizeBody('name').trim().escape(),

    (req, res, next) => {
        var errors = validationResult(req);
        var genre = new Genre({
            name: req.body.name,
            _id: req.params.id
        });
        if(!errors.isEmpty()) {
            res.render('genre_form', {title: 'Update Genre', genre: genre, errors: errors.array()});
        }
        else {
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err) {
                if(err) {return next(err);}
                res.redirect('/catalog/genres');
            })
        }
    }
];
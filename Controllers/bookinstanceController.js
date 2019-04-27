var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.bookinstance_list = (req, res, next) => {
    BookInstance.find()
                .populate('book')
                .exec(function(err, list_bookinstances) {
                    if(err) return next(err);
                    res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_bookinstances});
                });
};
exports.bookinstance_detail = (req, res, next) => {
    BookInstance.findById(req.params.id)
                    .populate('book')
                    .exec(function(err, bookinstance) {
                        if(err) {return next(err);}
                        if(bookinstance == null) {
                            var err = new Error('Book not found');
                            err.status = 404;
                            next(err);
                        }
                        res.render('bookinstance_detail', {title: 'Book', bookinstance: bookinstance});
                    });
};
exports.bookinstance_create_get = (req, res, next) => {
    Book.find({}, 'title')
        .exec(function(err, books) {
            if(err) {return next(err);}
            res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
        })
};
exports.bookinstance_create_post = [
    body('book', 'Book must be specified').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must be specified').isLength({min: 1}).trim(),
    body('due_back', 'Invaild date').optional({checkFalsy: true}).isISO8601(),

    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('due_back').trim().escape(),
    sanitizeBody('status').trim().escape(),

    (req, res ,next) => {
        const errors = validationResult(req);
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            due_back: req.body.due_back,
            status: req.body.status
        });
        if(!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec(function(err, books) {
                    if(err) {return next(err);}
                    res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance});
                });
            return;
        }
        else {
            bookinstance.save(function(err) {
                if(err) {return next(err);}
                res.redirect(bookinstance.url);
            });
        }
    }
];
exports.bookinstance_delete_get = (req, res) => {
    BookInstance.findById(req.params.id)
                .populate('book')
        .exec(function(err, bookinstance) {
            if(err) {return next(err);}
            res.render('bookinstance_delete', {title: 'Delete BookInstance', bookinstance: bookinstance});
        })
};
exports.bookinstance_delete_post = (req, res, next) => {
    BookInstance.findByIdAndDelete(req.body.id, function deleteBookInstance(err) {
        if(err) {return next(err);}
        res.redirect('/catalog/bookinstances');
    })
};
exports.bookinstance_update_get = (req, res, next) => {
    Book.find({}, 'title')
        .exec(function(err, books) {
            if(err) {return next(err);}
            res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
        });
};
exports.bookinstance_update_post = [
    body('book', 'Book must be specified').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must be specified').isLength({min: 1}).trim(),
    body('due_back', 'Invaild date').optional({checkFalsy: true}).isISO8601(),

    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('due_back').trim().escape(),
    sanitizeBody('status').trim().escape(),

    (req, res, next) => {
        var errors = validationResult(req);
        var bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            due_back: req.body.due_back,
            status: req.body.status,
            _id: req.params.id
        });
        if(!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec(function(err, books) {
                    if(err) {return next(err);}
                    res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance});
                });
            return;
        }
        else {
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function(err) {
                if(err) {return next(err);}
                res.redirect('/catalog/bookinstances');
            });
        }
    }
];
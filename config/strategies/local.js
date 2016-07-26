var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('User'),
    winston = require('winston');
module.exports = function () {
    passport.use('localUser', new LocalStrategy({
        usernameField: 'phone',
        passwordField: 'password'
    }, function (phone, password, done) {

        //return done(null, {name: 'abc'});
        try {
            User.findOne({
                phone: phone,
                role: 'customer'
            }).populate('referredBy').then(function (user) {
                if (!user) {
                    return done(null, false, {
                        message: 'Invalid phone number.'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid password.'
                    });
                }

                return done(null, user);
            }).catch(function (err) {
                if (err) {
                    return done(err);
                }
            });
        }
        catch (err) {
            return done(null, false, {
                message: err
            });
        }
    }));

    passport.use('localDriver', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {

        try {
            User.findOne({username: username}, function (err, user) {
                //console.log(user);
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown User'
                    });
                }
                if (!user.authenticate(password)) {
                    return done(null, false, {message: 'Invalid Password'});
                }
                if (user.role !== 'driver') {
                    return done(null, false, {message: 'invalid role'});
                }
                return done(null, user);
            });
        }
        catch (err) {
            console.log('*****passport local strategy error*****');
            console.log(err);
        }
    }));
    passport.use('localAdmin', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function (email, password, done) {
        winston.info('useremail', email);
        if (!email) {
            return done(null, false, {
                message: 'Email is required'
            });
        }
        winston.info('password', password);
        if (!password) {
            return done(null, false, {
                message: 'Password is required'
            });
        }

        try {
            User.findOne({email: email}).then(function (user) {

                if (!user) {

                    return done(null, false, {
                        message: 'Invalid Email or Password'
                    });
                }
                if (!user.authenticate(password)) {
                    winston.info('user is not authenticated');
                    return done(null, false, {message: 'Invalid Email or Password'});
                }
                if (user.role !== 'admin') {
                    return done(null, false, {message: 'unauthorized access request'});
                }
                return done(null, user);
            }).catch(function (err) {
                if (err) {
                    return done(err);
                }
            });
        }
        catch (err) {
            if (err) {
                return done(err);
            }
        }
    }));
};
var config = require('./config'),
    http = require('http'),
    socketio = require('socket.io'),
    express = require('express'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    flash = require('connect-flash'),
    passport = require('passport'),
    routes = require('./routes'),
    winston = require('./winston');


module.exports = function (db) {
    var app = express();
    var server = http.createServer(app);
    var io = socketio.listen(server);
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan('dev', {"stream": winston.stream}));
    }
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
        winston.info('NODE_ENV Configuration');
        winston.info(config);

    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
    }
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());


    var mongoStore = new MongoStore({
        mongooseConnection: db.connection
    });
    app.use(session({
        saveUninitialized: true,
        resave: false,
        secret: config.sessionSecret,
        store: mongoStore,
        rolling: true
    }));

    app.set('views', './app/views');
    app.set('view engine', 'ejs');

    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    //loading route file
    require('./routes')(app);


    app.use(express.static('./public'));
    require('./socketio')(server, io, mongoStore);
    app.use(function (req, res) {
        return res.send({
            status: 'error',
            msgInfo: 'the service you are looking for does not exist'
        });
    });
    return server;
};
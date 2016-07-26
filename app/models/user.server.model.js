/**
 * Created by waqas_noor on 05/04/2016.
 */
'use strict';//NOSONAR
var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema,
    generalHelper = require('../helpers/general.server.helper'),
    userRoles = generalHelper.userRoles;
var UserSchema = new Schema({
    fullName: String,
    email: {
        type: String,
        index: true,
        match: [/.+\@.+\..+/, "Please fill a valid e-mail address"],
        unique: true
    },
    password: {
        type: String,
        validate: [function (password) {
            return password.length >= 6;
        }, 'Password Should be longer then 6 Characters']

    }, salt: {
        type: String
    }, phone: {
        type: String,
        unique: true,
        index: true
    },
    provider: {
        type: String,
        required: 'provider is required'
    }, providerId: {
        type: String
    },
    providerData: {},
    created: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        required: 'role is required',
        enum: userRoles
    },
    stripeToken: {
        type: String
    },
    forgetToken: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    city: {
        type: String
    },
    postalCode: {
        type: String
    },
    referredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    referralCode: {
        type: String
    },
    freeOrders: {
        type: Number
    },
    pin: {
        type: Number
    },
    address: {
        type: String
    },
    license: {
        type: String
    }

});
UserSchema.methods.hashPassword = function (password) {

    var _salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, _salt, 10000, 64).toString('base64');
};
UserSchema.methods.generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

UserSchema.methods.authenticate = function (password) {
    return this.password === this.hashPassword(password);
};

UserSchema.set('toJSON', {
    getters: true, virtual: true
});
mongoose.model('User', UserSchema);

'use strict';//NOSONAR
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var stripeSchema = new Schema({
    customer: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Customer is required'
    },
    stripeCustomer: {},
    tokenInfo: {}

});
mongoose.model('Stripe', stripeSchema);
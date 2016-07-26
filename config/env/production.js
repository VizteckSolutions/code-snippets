/**
 * Created by waqas_noor on 05/04/2016.
 */

module.exports = {
//Production configuration options
    sessionSecret: '',
    db: 'your db url',
    api: '/api/v1',
    twilioSid: '',
    twilioAuth: '',
    twilioFrom: '',
    register: 'Your verification code is ',
    forgetPassword: 'Your Reset Code is ',
    geoCodingOptions: {
        provider: 'google',
        //// Optionnal depending of the providers
        //httpAdapter: 'https', // Default
        apiKey: '', // for Mapquest, OpenCage, Google Premier
        //formatter: null         // 'gpx', 'string', ...
    },
    stripeApiKey: "",
    port:4001
};
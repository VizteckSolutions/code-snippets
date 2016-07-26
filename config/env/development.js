module.exports = {
//development configuration options
    sessionSecret: 
    db: 'you db url',
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
        apiKey: '' // for Mapquest, OpenCage, Google Premier
        //formatter: null         // 'gpx', 'string', ...
    },
    stripeApiKey: "",
    port: 4000,
    test: true
};

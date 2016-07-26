module.exports = function (grunt) {

    grunt.initConfig({
        env: {
            dev: {
                NODE_ENV: 'development'
            }, pro: {
                NODE_ENV: 'production'
            }
        },
        wiredep: {
            target: {
                src: 'app/views/home.ejs'
            }
        }, nodemon: {
            dev: {
                script: 'server.js',
                ignore: ['node_modules/**', 'public/**']
            }
        },
        jshint: {
            all: ['public/app/pages/**/*.js', 'app/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            }
        }
    });
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['env:dev', 'nodemon']);
    grunt.registerTask('production', ['env:pro', 'nodemon']);
    //grunt.registerTask('wiring', ['wiredep']);
};
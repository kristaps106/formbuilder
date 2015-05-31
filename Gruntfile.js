//Gruntfile
module.exports = function(grunt) {

    //Initializing the configuration object
    grunt.initConfig({

        // Task configuration
        less: {
            development: {
                options: {
                    compress: true  //minifying the result
                },
                files: {
                    //compiling frontend.less into frontend.css
                    "./public/assets/stylesheets/frontend.css":"./app/assets/stylesheets/frontend.less",
                    "./public/assets/stylesheets/table_fix.css":"./app/assets/stylesheets/table_fix.less"
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            js_frontend: {
                src: [
                    './bower_components/html5shiv/dist/html5shiv.min.js',
                    './bower_components/respondjs/dest/respond.min.js',
                    './bower_components/jquery/dist/jquery.js',
                    './bower_components/jquery-ui/ui/jquery-ui.js',
                    './bower_components/moment/min/moment.min.js',
                    './bower_components/moment/locale/lv.js',
                    './bower_components/bootstrap/dist/js/bootstrap.js',
                    './bower_components/docs.min.js/index.js',
                    './bower_components/ie10-viewport-bug-workaround/index.js',
                    './app/assets/javascript/plugins/metisMenu/jquery.metisMenu.js',
                    './app/assets/javascript/plugins/morris/raphael-2.1.0.min.js',
                    './app/assets/javascript/plugins/morris/morris.js',
                    './app/assets/javascript/sb-admin.js',
                    './app/assets/javascript/plugins/dataTables/jquery.dataTables.js',
                    './app/assets/javascript/plugins/DropKick/dropkick.js',
                    './app/assets/javascript/plugins/DropKick/dropkick.jquery.js',
                    './bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js',
                    './bower_components/vue/dist/vue.js',
                    './bower_components/selectize/dist/js/standalone/selectize.js',
                    './bower_components/bootbox.js/bootbox.js',
                    './bower_components/jquery-file-upload/js/jquery.iframe-transport.js',
                    './bower_components/jquery-file-upload/js/jquery.fileupload.js',
                    './bower_components/jquery-file-upload/js/jquery.fileupload-process.js',
                    './bower_components/jquery-file-upload/js/jquery.fileupload-validate.js',
                    './bower_components/jquery-calx/jquery-calx-2.1.1.js',
                    './bower_components/bootstrap-multiselect/dist/js/bootstrap-multiselect.js',
                    './bower_components/jquery-download/src/Scripts/jquery.fileDownload.js',
                    './bower_components/select2/dist/js/select2.full.min.js',
                    './app/assets/javascript/select2/i18n/lv.js',
                    './app/assets/javascript/frontend.js'
                ],
                dest: './public/assets/javascript/frontend.js'
            }
        },
        uglify: {
            options: {
                mangle: false  // Use if you want the names of your functions and variables unchanged
            },
            frontend: {
                files: {
                    './public/assets/javascript/frontend.js': './public/assets/javascript/frontend.js'
                }
            }
        },
        phpunit: {
            classes: {
            },
            options: {
            }
        },
        watch: {
            js_frontend: {
                files: [
                    //watched files
                    './bower_components/jquery/dist/jquery.js',
                    './bower_components/bootstrap/dist/js/bootstrap.js',
                    './app/assets/javascript/frontend.js'
                ],
                tasks: ['concat:js_frontend'],     //tasks to run
                options: {
                    livereload: true                        //reloads the browser
                }
            },
            less: {
                files: ['./app/assets/stylesheets/*.less'],  //watched files
                tasks: ['less'],                          //tasks to run
                options: {
                    livereload: true                        //reloads the browser
                }
            },
            deploy: {
                files: ['app/**', '!app/storage/**'],
                options: {
                    livereload: true
                }
            }
        }
    });

    // Plugin loading

    // Task definition

    // // Plugin loading
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-phpunit');


    // Task definition
    grunt.registerTask('default', ['watch']);

};
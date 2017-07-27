/* eslint global-require: 0 */
/* eslint func-names: 0 */

require('path');
const webpack = require('webpack');

module.exports = function (grunt) {
  require('jit-grunt')(grunt);
  require('time-grunt')(grunt);

  grunt.initConfig({

    // ------------------------------------------------------------------------- //
    // Dev work
    // ------------------------------------------------------------------------- //

    // compile sass
    sass: {
      options: {
        sourceMap: true
      },
      dev: {
        options: {
          outputStyle: 'expanded'
        },
        files: {
          'css/frontend.css': 'scss/frontend.scss',
        }
      },
      prod: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          'css/frontend.css': 'scss/frontend.scss',
        }
      }
    },

    postcss: {
      options: {
        map: true, // inline sourcemaps
        processors: [
          require('autoprefixer')({
            browsers: [
              'last 2 versions',
            ]
          })
        ]
      },
      frontend: {
        src: [
          'css/frontend.css'
        ]
      },
    },

    // watch files
    watch: {
      // Styling
      //
      sass: {
        options: {
          // don't livereload sass because we livereload the css
          livereload: false
        },
        files: [
          'scss/**/*.scss'
        ],
        // compile on change
        tasks: ['sass:dev', 'postcss']
      }
    },

    browserSync: {
      bsFiles: {
        src : [
          'css/*.css',
          'index.html',
          './js/bundles/*.js',
        ]
      },
      options: {
        watchTask: true,
        server: {
          baseDir: "./"
        }
      }
    },

    // ------------------------------------------------------------------------- //
    // Build-related tasks
    // ------------------------------------------------------------------------- //

    // rev the assets
    filerev: {
      options: {
        // defaults
        // encoding: 'utf8',
        // algorithm: 'md5',
        // length: 8
      },
      assets: {
        files: [{
          src: [
            // css
            'css/frontend.css',
            // js
            './js/bundles/*.js',
            // imgs
            'images/**/*.{png,jpeg,jpg,gif,svg}',
          ]
        }]
      }
    },

    // this looks at files to see if a hashed version exists, and rewrites urls
    usemin: {
      html: [
        './index.html'
      ],
      css: [
        'css/*.css'
      ],
      js: [
        'js/**/*.js'
      ],
      options: {
        root: '',
        // this file globbing is problamatic, but this currently works for all patterns
        assetsDirs: [
          '',
        ],
        patterns: {
          // usemin doesn't check js files on its own. use a regex to find /images/** strings
          js: [
            [
              /(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm,
              'Update the JS to reference our revved images']
          ]
        }
      }
    },

    webpack: {
      options: require('./webpack.config.js'),
      dev: {
        keepalive: false
      },
      prod: {
        watch: false,
        cache: false,
        plugins: [
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: false,
              drop_console: true,
              drop_debugger: true
            }
          })
        ]
      }
    }

  });

  // ------------------------------------------------------------------------- //
  // Tasks
  // ------------------------------------------------------------------------- //

  // Default task(s).
  grunt.registerTask('default', [
    'compile:dev',
    'postcss',
    'browserSync',
    'watch'
  ]);

  grunt.registerTask('compile:dev', [
    'webpack:dev',
    'sass:dev'
  ]);

  grunt.registerTask('compile:prod', [
    'webpack:prod',
    'sass:prod'
  ]);

  grunt.registerTask('build', [
    'compile:prod',
    'postcss',
    // 'filerev',
    // 'usemin'
  ]);
};

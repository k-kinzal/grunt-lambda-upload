'use strict';
/*
 * lambda upload
 * https://github.com/k-kinzal/grunt-lambda-upload
 *
 * Copyright (c) 2012-2015 k-kinzal
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {
  // configuration
  var config = grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: true,
        reporter: require('jshint-stylish')
      },
      all: [
        'src/*.js',
        'Gruntfile.js'
      ]
    }
  });
  // tasks
  grunt.registerTask('test', function() {
    grunt.loadNpmTasks('grunt-contrib-jshint'); 
    grunt.task.run([
      'jshint'
    ]);
  });
};





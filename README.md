# grunt-lambda-upload

[![Build Status](https://travis-ci.org/k-kinzal/grunt-lambda-upload.svg)](https://travis-ci.org/k-kinzal/grunt-lambda-upload)
[![Dependency Status](https://david-dm.org/k-kinzal/grunt-lambda-upload.svg)](https://david-dm.org/k-kinzal/grunt-lambda-upload)
[![devDependency Status](https://david-dm.org/k-kinzal/grunt-lambda-upload/dev-status.svg)](https://david-dm.org/k-kinzal/grunt-lambda-upload#info=devDependencies)

> Upload AWS Lambda functions for grunt task

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-lambda-upload --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-lambda-upload');
```

## The "lambda_upload" task

### Overview
In your project's Gruntfile, add a section named `lambda_upload` to the data object passed into `grunt.initConfig()`.


```js
// upload with dependencies modules
var nodeModules = Object.keys(require('../package.json')['dependencies']);
var nodeModulePaths = nodeModules.map(function(name) {
  return './node_modules/' + name + '/**'
});

grunt.initConfig({
  lambda_upload: {
    options: {
      functionName: 'functionname',
      handler: 'src/index.handler', // modules.handler in /src/index.js
      role: 'arn:aws:iam::125043710018:role/lambda_exec_role', // IAM role for execute lambda function
      runtime: 'nodejs',
      description: 'test function',
      memorySize: 128,
      timeout: 3
    },
    debug: {
      options: {
        role: 'arn:aws:iam::125043710017:role/lambda_exec_role'
      },
      files: [{
        src: nodeModulePaths.concat([
          'src/*.js',
          'config/default.json'
        ])
      }]
    }
  },
})
```

Or config of load remote package.

```js
grunt.initConfig({
  lambda_upload: {
    options: {
      functionName: 'functionname',
      handler: 'src/index.handler', // modules.handler in /src/index.js
      mode: 'event',
      role: 'arn:aws:iam::125043710018:role/lambda_exec_role', // IAM role for execute lambda function
      runtime: 'nodejs',
      description: 'test function',
      memorySize: 128,
      timeout: 3
    },
    debug: {
      options: {
        url: 'https://github.com/k-kinzal/lambda-dummy-function/archive/0.0.1.zip',
        configFileName: 'local.json',
        config: {
          // set config to config/local.json
        }
      }
    }
  },
})
```

## License
Copyright (c) 2012-2015 k-kinzal. Licensed under the MIT license.

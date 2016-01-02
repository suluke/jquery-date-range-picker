# jQuery Date Range Picker Plugin#

v1.0.0

jQuery Date Range Picker is a jQuery plugin that allows user to select a date range.

Requires [jQuery](https://jquery.com/) and [Moment](http://momentjs.com/).
Based on [jquery.date-range-picker](https://github.com/longbill/jquery-date-range-picker) written by Chunlong ( [jszen.com](http://jszen.com) )

## Features
* **Runs everywhere:** Supports IE8+, Firefox, Chrome, Safari and other standard HTML5 browsers. Powered by [Babel](https://babeljs.io/)
* **Fully international:** Built-in support for many languages - or just [add your own](lib/locales.js)!
* **Easily customizable:** Fully CSS styled, using [SASS](http://sass-lang.com/) for development
* **Easily hackable:** Code divided into [modules](http://browserify.org/), with quality ensured by [JSHint](http://jshint.com/about/) and [JSCS](http://jscs.info/) 
* **Ready for the future:** Source code written in [ECMA Script 2015](https://babeljs.io/docs/learn-es2015/)


## Build instructions
To get started with development, you should first install all dependendencies:
```
npm install
```
This project is built using [Broccoli](http://broccolijs.com/).
Install it globally using 
```sudo npm install -g broccoli-cli```
After that, you can build sass, javascript and also a minified version by running
```
broccoli build dist
```
The compiled scripts can be found in the newly created `dist` directory.

To make development more convenient, this repository also includes a `Gruntfile` to automate tasks using [Grunt](http://gruntjs.com/).
As you did with `Broccoli`, you should install the global `grunt` command using
```
sudo npm install -g grunt-cli
```
The following tasks are currently available:
* `grunt watch`: A watcher task that automatically rebuilds javascript and sass when you save your changes
* `grunt jscs`: Runs a codestyle checker to maintain code quality
* `grunt jshint`: Runs a linter on the project to detect general problems with the code
* `grunt broccoli:dist:build`: Builds the project in release mode (also known as *production*)
* `grunt broccoli:dev:build`: Builds the project in development mode

## Demo
For a demo page, just open `demo/index.html` in your browser

## License
This date range picker plugin is under MIT LICENSE

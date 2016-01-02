'use strict'
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const Sass = require('broccoli-sass');
const Browserify = require('broccoli-browserify');
const UglifyJS = require('broccoli-uglify-sourcemap');

const css = new Sass(['sass'], 'styles.scss', 'daterangepicker.css');
const js = Browserify('lib', {
	entries: ['./main.js'],
	outputFile: 'jquery.daterangepicker.js',
	bundle: {
		external: ['jquery', 'moment']
		//standalone: 'daterangepicker'
	}
});
// copy jquery.daterangepicker.js to put it through uglify
let minJs = Funnel(js, {
	include: ['*'],
	getDestinationPath: (path) => {
		if (path === 'jquery.daterangepicker.js') {
			return 'jquery.daterangepicker.min.js';
		}
		return path;
	}
});
minJs = UglifyJS(minJs);

module.exports = new MergeTrees([js, minJs, css]);

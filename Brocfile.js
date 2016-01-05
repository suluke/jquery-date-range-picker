'use strict'
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const Sass = require('broccoli-sass');
const Browserify = require('broccolify');
const UglifyJS = require('broccoli-uglify-sourcemap');
const TranspileJs = require('broccoli-babel-transpiler');


// Uncomment locales from this list which you do not want to include in
// your build
const ignoredLocales = [
	//'az',
	//'cn',
	//'cz',
	//'de',
	//'en',
	//'es',
	//'fr',
	//'hu',
	//'it',
	//'no',
	//'nl',
	//'pl',
	//'ru'
];
for (let i = 0; i < ignoredLocales.length; ++i) {
	ignoredLocales[i] = './lib/locales/' + ignoredLocales[i] + '.js';
	console.log(ignoredLocales[i]);
}

const css = new Sass(['sass'], 'styles.scss', 'daterangepicker.css');
let js = Browserify('lib', {
	entries: ['./main.js'],
	outputFile: 'jquery.daterangepicker.js',
	ignore: ['jquery', 'moment'].concat(ignoredLocales),
	bundle: {
		//standalone: 'daterangepicker'
	}
});
js = TranspileJs(js);
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

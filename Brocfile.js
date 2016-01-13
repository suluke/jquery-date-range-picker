'use strict'
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const Sass = require('broccoli-sass');
const Browserify = require('broccolify');
const UglifyJS = require('broccoli-uglify-sourcemap');
const TranspileJs = require('broccoli-babel-transpiler');


// Uncomment locales from this list which you do not want to include in
// your build
const disabledLocales = [
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
// Uncomment features to be disabled in your custom build
const disabledFeatures = [
	//'daytime-selection-controls', // 2.4kb
	//'shortcuts',                  // 3kb
	//'week-numbers'                // 1.7kb
];



for (let i = 0; i < disabledLocales.length; ++i) {
	disabledLocales[i] = './lib/locales/' + disabledLocales[i] + '.js';
}
const featureModuleMap = {
	'daytime-selection-controls': './lib/daytime-selection.js',
	'shortcuts': './lib/shortcuts.js',
	'week-numbers': './lib/week-numbers.js'
}
for (let i = 0; i < disabledFeatures.length; ++i) {
	disabledFeatures[i] = featureModuleMap[disabledFeatures[i]];
}

const css = new Sass(['sass'], 'styles.scss', 'daterangepicker.css');
let js = Browserify('lib', {
	entries: ['./main.js'],
	outputFile: 'jquery.daterangepicker.js',
	ignore: ['jquery', 'moment'].concat(disabledLocales).concat(disabledFeatures),
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

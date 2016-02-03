'use strict'
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const Sass = require('broccoli-sass');
const Browserify = require('broccolify');
const UglifyJS = require('broccoli-uglify-sourcemap');
const TranspileJs = require('broccoli-babel-transpiler');

const buildConfig = {
	// Uncomment locales from this list which you do not want to include in
	// your build
	disabledLocales: [
		//'az',
		//'zh-cn',
		//'cs',
		//'de',
		//'en',
		//'es',
		//'fr',
		//'hu',
		//'it',
		//'no',
		//'nl',
		//'pl',
		//'ru',
		//'se'
	],
	// Uncomment features to be disabled in your custom build
	disabledFeatures: [
		//'all',
		//'daytime-selection-controls', // 2.4kb
		//'shortcuts',                  // 3kb
		//'week-numbers',               // 1.7kb
		//'custom-buttons',
		//'directional-selection',
		//'mousewheel-month-scroll',
		//'days-tooltip',               // 1.9kb
		//'jquery-plugin'
	]
}

const buildConfigCore = {
	disabledLocales: [
		'az',
		'cn',
		'cz',
		'de',
		//'en',
		'es',
		'fr',
		'hu',
		'it',
		'no',
		'nl',
		'pl',
		'ru',
		'se'
	],
	disabledFeatures: [
		'all',
		'jquery-plugin'
	]
}

const makeJsTree = config => {
	const disabledLocales = [];
	const disabledFeatures = [];
	for (let i = 0; i < config.disabledLocales.length; ++i) {
		disabledLocales.push('./lib/locales/' + config.disabledLocales[i] + '.js');
	}
	const featureModuleMap = {
		'all': './lib/plugins.js',
		'daytime-selection-controls': './lib/plugins/daytime-selection.js',
		'shortcuts': './lib/plugins/shortcuts.js',
		'week-numbers': './lib/plugins/week-numbers.js',
		'days-tooltip': './lib/day-tooltip.js',
		'jquery-plugin': './lib/plugins/jquery-plugin.js',
		'custom-buttons': './lib/plugins/custom-buttons.js',
		'directional-selection': './lib/plugins/directional-selection.js',
		'mousewheel-month-scroll': './lib/plugins/mousewheel-month-scroll.js'
	};
	for (let i = 0; i < config.disabledFeatures.length; ++i) {
		disabledFeatures.push(featureModuleMap[config.disabledFeatures[i]]);
	}
	return Browserify('lib', {
		entries: ['./main.js'],
		outputFile: 'jquery.daterangepicker.js',
		ignore: ['jquery', 'moment'].concat(disabledLocales).concat(disabledFeatures),
		bundle: {
			//standalone: 'daterangepicker'
		}
	});
}


const makeTree = () => {
	const css = new Sass(['sass'], 'styles.scss', 'daterangepicker.css');
	let js = makeJsTree(buildConfig);
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
	return new MergeTrees([js, minJs, css]);
}

module.exports = makeTree();

const config = require('../config');

const locales = {
	'az': require('./az'),
	'zh-cn': require('./zh-cn'),
	'cs': require('./cs'),
	'de': require('./de'),
	'en': require('./en'),
	'es': require('./es'),
	'fr': require('./fr'),
	'hu': require('./hu'),
	'it': require('./it'),
	'nn': require('./nn'),
	'nl': require('./nl'),
	'pl': require('./pl'),
	'ru': require('./ru'),
	'se': require('./se')
};

for (let locale in locales) {
	// Browserify will return empty objects if a module (here: locale file)
	// is in the ignore list
	if (Object.keys(locales[locale]).length > 0) {
		module.exports[locale] = locales[locale];
	}
}

module.exports.default = module.exports[config['default-locale'].id];

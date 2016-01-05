const config = require('./config');

const locales = {
	'az': require('./locales/az'),
	'cn': require('./locales/cn'),
	'cz': require('./locales/cz'),
	'de': require('./locales/de'),
	'en': require('./locales/en'),
	'es': require('./locales/es'),
	'fr': require('./locales/fr'),
	'hu': require('./locales/hu'),
	'it': require('./locales/it'),
	'no': require('./locales/no'),
	'nl': require('./locales/nl'),
	'pl': require('./locales/pl'),
	'ru': require('./locales/ru')
};

for (let locale in locales) {
	// Browserify will return empty objects if a module (here: locale file)
	// is in the ignore list
	if (Object.keys(locales[locale]).length > 0) {
		module.exports[locale] = locales[locale];
	}
}

module.exports.default = module.exports[config['default-locale']];

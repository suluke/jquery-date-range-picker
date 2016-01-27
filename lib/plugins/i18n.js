require('jquery');
const $ = window.jQuery;

const locales = require('../locales/locales');

const getLanguageStrings = (lang, picker) => {
	const localeStore = picker.locales;
	if (lang && lang in localeStore) {
		return localeStore[lang];
	} else {
		for (let key in localeStore) {
			if (lang.indexOf(key) !== -1) {
				console.warn('Locale ' + lang + ' not available. Falling back to ' + key);
				return localeStore[key];
			}
		}
		console.warn('Locale ' + lang + ' not available. Falling back to default');
		return localeStore['default'];
	}
};

class I18nSupport {
	constructor(picker) {
		this.picker = picker;
		picker.locales = $.extend(true, locales, picker.constructor.locales);
		picker.getString = s => this.translate(s);
	}
	translate(t) {
		const lang = this.picker.getOptions().language;
		if (!lang) {
			throw new Error('No language specified');
		}
		var langs = getLanguageStrings(lang, this.picker);
		var _t = t.toLowerCase();
		var re = (t in langs) ? langs[t] : (_t in langs) ? langs[_t] : null;
		var defaultLanguage = getLanguageStrings('default', this.picker);
		if (re === null) {
			if (t in defaultLanguage) {
				re = defaultLanguage[t];
			} else if (_t in defaultLanguage) {
				re = defaultLanguage[_t];
			} else {
				re = '';
			}
		}
		return re;
	}
}

module.exports = {
	addOptionDefaults: opt => {
		opt.language = 'auto';
	},
	addToPicker: picker => {
		return new I18nSupport(picker);
	}
};

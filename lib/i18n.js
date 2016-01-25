require('jquery');
const $ = window.jQuery;

const locales = require('../locales/locales');

const getLanguageStrings = (lang, picker) => {
	const localeStore = picker.locales;
	if (lang === 'auto') {
		var language = navigator.language ? navigator.language : navigator.browserLanguage;
		if (!language) {
			return localeStore['default'];
		}
		language = language.toLowerCase();
		for (var key in localeStore) {
			if (language.indexOf(key) != -1) {
				return localeStore[key];
			}
		}
		return localeStore['default'];
	} else if (lang && lang in localeStore) {
		return localeStore[lang];
	} else {
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

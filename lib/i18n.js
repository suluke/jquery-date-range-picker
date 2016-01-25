require('jquery');
const $ = window.jQuery;

const getLanguageStrings = (lang) => {
	if (lang === 'auto') {
		var language = navigator.language ? navigator.language : navigator.browserLanguage;
		if (!language) {
			return $.dateRangePickerLanguages['default'];
		}
		language = language.toLowerCase();
		for (var key in $.dateRangePickerLanguages) {
			if (language.indexOf(key) != -1) {
				return $.dateRangePickerLanguages[key];
			}
		}
		return $.dateRangePickerLanguages['default'];
	} else if (lang && lang in $.dateRangePickerLanguages) {
		return $.dateRangePickerLanguages[lang];
	} else {
		return $.dateRangePickerLanguages['default'];
	}
};

module.exports = {
	/**
	 * Translate language string
	 */
	lang: function(t, lang) {
		if (!lang) {
			throw new Error('No language specified');
		}
		var langs = getLanguageStrings(lang);
		var _t = t.toLowerCase();
		var re = (t in langs) ? langs[t] : (_t in langs) ? langs[_t] : null;
		var defaultLanguage = $.dateRangePickerLanguages['default'];
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
	},
	nameMonth: function(m, lang) {
		return module.exports.lang('month-name', lang)[m];
	}
};

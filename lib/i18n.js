require('jquery');
const $ = window.jQuery;

require('moment');
const moment = window.moment;

module.exports = {
	toLocalTimestamp: function(t) {
		if (moment.isMoment(t)) {
			t = t.toDate().getTime();
		}
		if (typeof t === 'object' && t.getTime) {
			t = t.getTime();
		}
		if (typeof t === 'string' && !t.match(/\d{13}/)) {
			// t = moment(t, opt.format).toDate().getTime();
			throw new Error('Parsing strings in calendar.toLocalTimestamp has been removed');
		}
		t = parseInt(t, 10) - new Date().getTimezoneOffset() * 60 * 1000;
		return t;
	},
	getLanguageStrings: function(lang) {
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
	},
	/**
	 * Translate language string
	 */
	lang: function(t, lang) {
		if (!lang) {
			throw new Error('No language specified');
		}
		var langs = module.exports.getLanguageStrings(lang);
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

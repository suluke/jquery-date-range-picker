require('jquery');
var $ = window.jQuery;

module.exports = {
	toLocalTimestamp: function(t) {
		if (moment.isMoment(t)) t = t.toDate().getTime();
		if (typeof t == 'object' && t.getTime) t = t.getTime();
		if (typeof t == 'string' && !t.match(/\d{13}/)) t = moment(t,opt.format).toDate().getTime();
		t = parseInt(t, 10) - new Date().getTimezoneOffset()*60*1000;
		return t;
	},
	getLanguageStrings: function(lang) {
		if (lang == 'auto') {
			var language = navigator.language? navigator.language : navigator.browserLanguage;
			if (!language) return $.dateRangePickerLanguages['default'];
			var language = language.toLowerCase();
			for(var key in $.dateRangePickerLanguages) {
				if (language.indexOf(key) != -1) {
					return $.dateRangePickerLanguages[key];
				}
			}
			return $.dateRangePickerLanguages['default'];
		} else if ( lang && lang in $.dateRangePickerLanguages) {
			return $.dateRangePickerLanguages[lang];
		} else {
			return $.dateRangePickerLanguages['default'];
		}
	},
	/**
	 * translate language string
	 */
	lang: function(t, lang) {
		if (!lang) {
			throw new Error('No language specified');
		}
		var langs = module.exports.getLanguageStrings(lang);
		var _t = t.toLowerCase();
		var re = (t in langs) ? langs[t] : ( _t in langs) ? langs[_t] : null;
		var defaultLanguage = $.dateRangePickerLanguages['default'];
		if (re == null) re = (t in defaultLanguage) ? defaultLanguage[t] : ( _t in defaultLanguage) ? defaultLanguage[_t] : '';
		return re;
	},
	nameMonth: function(m, lang) {
		return module.exports.lang('month-name', lang)[m];
	}
};

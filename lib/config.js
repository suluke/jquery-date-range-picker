/**
 * Constants that configure the behavior of the build.
 * These are not meant to be altered during runtime.
 */
require('moment');
const i18n = require('./i18n');
 
module.exports = {
	'default-locale': 'en',
	'eventChangesOpenStateTag': 'daterangepicker_openStateChange',
	export: DateRangePicker => {
		window.DateRangePicker = DateRangePicker;
	},
	'option-defaults': {
		autoClose: false,
		format: 'YYYY-MM-DD',
		separator: ' to ',
		language: 'auto',
		startOfWeek: 'monday',// Or sunday
		startDate: false,
		endDate: false,
		extraClass: false, //Or string
		minDays: 0,
		maxDays: 0,
		inline: false,
		container: 'body',
		alwaysOpen: false,
		singleDate: false,
		lookBehind: false,
		batchMode: false,
		duration: 200,
		stickyMonths: false,
		dayDivAttrs: [],
		dayTdAttrs: [],
		singleMonth: 'auto',
		tooltip: {
			enabled: true,
			getText: (days, startTime, hoveringTime, lang) => {
				return days > 1 ? days + ' ' + i18n.lang('days', lang) : '';
			}
		},
		swapTime: false,
		defaultTime: new Date()
	}
};

/**
 * Constants that configure the behavior of the build.
 * These are not meant to be altered during runtime.
 */
require('moment');
const moment = window.moment;
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
		time: {
			enabled: false,
			hours: {
				enabled: true,
				min: 0,
				max: 23,
				step: 1
			},
			minutes: {
				enabled: true,
				min: 0,
				max: 59,
				step: 1
			}
		},
		minDays: 0,
		maxDays: 0,
		showShortcuts: false,
		shortcuts:
		{
			//'prev-days': [1,3,5,7],
			// 'next-days': [3,5,7],
			//'prev' : ['week','month','year'],
			// 'next' : ['week','month','year']
		},
		customShortcuts: [],
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
		selectForward: false,
		selectBackward: false,
		applyBtnClass: '',
		singleMonth: 'auto',
		topBar: {
			enabled: true,
			customText: false
		},
		tooltip: {
			enabled: true,
			getText: (days, startTime, hoveringTime, lang) => {
				return days > 1 ? days + ' ' + i18n.lang('days', lang) : '';
			}
		},
		swapTime: false,
		weekNumbers: {
			enabled: false,
			getWeekName: function(date) /* date will be the first day of a week */ {
				return moment(date).format('w');
			}
		},
		defaultTime: new Date(),
		openListeners: null, // example: [{ target: $elm, event: 'click', filter: (evt) => {return true} }]
		closeListeners: null, // example: [{ target: document, event: 'click', filter: (evt) => {return true} }]
		preventDoubleClicks: false,
		draggableRangeBounds: false,
		scrollThroughMonths: {
			enabled: false
		}
	}
};

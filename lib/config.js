/**
 * Constants that configure the behavior of the build.
 * These are not meant to be altered during runtime.
 */
module.exports = {
	'default-locale': 'en',
	'eventChangesOpenStateTag': 'daterangepicker_openStateChange',
	'option-defaults': {
		autoClose: false,
		format: 'YYYY-MM-DD',
		separator: ' to ',
		language: 'auto',
		startOfWeek: 'monday',// Or sunday
		startDate: false,
		endDate: false,
		time: {
			enabled: false
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
		showTopbar: true,
		showTooltip: true,
		swapTime: false,
		showWeekNumbers: false,
		defaultTime: new Date(),
		openListeners: [{target: 'self', event: 'click'}],
		closeListeners: [{target: document, event: 'click'}]
	}
};

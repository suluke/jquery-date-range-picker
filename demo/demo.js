var optionTypes = {
	alwaysOpen: 'bool',
	autoClose: 'bool',
	batchMode: 'string',
	beforeShowDay: 'function',
	closeListeners: {
		event: 'string',
		target: 'dom',
		filter: 'function'
	},
	container: 'dom',
	customShortcuts: [
		{
			name: 'string',
			dates: 'function'
		}
	],
	customValues: [
		{
			value: 'string',
			name: 'string'
		}
	],
	dayDivAttrs: 'array',
	dayTdAttrs: 'array',
	defaultTime: 'date',
	draggableRangeBounds: 'bool',
	duration: 'int',
	endDate: 'date',
	extraClass: 'string',
	format: 'string',
	functions: 'object',
	inline: 'bool',
	language: 'string',
	lookBehind: 'bool',
	maxDays: 'int',
	minDays: 'int',
	openListeners: {
		event: 'string',
		target: 'dom',
		filter: 'function'
	},
	preventDoubleClicks: 'bool',
	scrollThroughMonths: {
		enabled: 'bool'
	},
	selectForward: 'bool',
	selectBackward: 'bool',
	separator: 'string',
	shortcuts: {
		'prev-days': '[int]',
		'next-days': '[int]',
		prev: ['week','month','year'],
		next: ['week','month','year']
	},
	showDateFilter: 'function',
	showShortcuts: 'bool',
	singleDate: 'bool',
	singleMonth: 'bool',
	startDate: 'date',
	startOfWeek: ['monday', 'sunday'],
	stickyMonths: 'bool',
	swapTime: 'bool',
	time: {
		enabled: 'bool'
	},
	tooltip: {
		enabled: 'bool',
		getText: 'string|function'
	},
	topBar: {
		applyBtnClass: 'string',
		customText: 'string|function',
		enabled: 'bool'
	},
	weekNumbers: {
		enabled: 'bool',
		getWeekName: 'function'
	}
};

var options = DateRangePicker.getDefaultOptions();

// Validate
for (key in options) {
	if (!options.hasOwnProperty(key)) {
		continue;
	}
	if (!optionTypes.hasOwnProperty(key)) {
		console.warn('No type available for option "' + key + '".');
		continue;
	}
}

function createPicker() {
	console.log('create picker');
}

$optionsForm = $('#options');
ConfigFormBuilder(optionTypes, options, createPicker, $optionsForm);
$optionsForm.children('button').first().appendTo($optionsForm);

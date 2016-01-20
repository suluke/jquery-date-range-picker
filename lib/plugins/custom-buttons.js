require('jquery');
const $ = window.jQuery;

const i18n = require('../i18n');

module.exports = {
	addOptionDefaults: opts => {
		opts.customValues = {
			enabled: false,
			values: [],
			label: false
		};
	},
	
	addToPicker: picker => {
		const opt = picker.getOptions();
		if (!opt.customValues.enabled) {
			return;
		}
		const range = picker.getDateRange();
		
		let html = '<div class="customValues"><b>' + (opt.customValues.label || i18n.lang('custom-values', opt.language)) + '</b>';
		for (let i = 0; i < opt.customValues.values.length; i++) {
			var val = opt.customValues.values[i];
			html += '&nbsp;<span class="custom-value"><a href="javascript:;" data-custom="' + val.value + '">' + val.name + '</a></span>';
		}
		
		picker.getDom()
			.find('.footer').append(html)
			.on('click', '[data-custom]', function() {
				var value = $(this).attr('data-custom');
				range.start = false;
				range.end = false;
				picker.getDom().find('.day.checked').removeClass('checked');
				picker.getDom().find('.day.first-date-selected').removeClass('first-date-selected');
				picker.getDom().find('.day.last-date-selected').removeClass('last-date-selected');
				picker.getEventEmitter().trigger('datepicker-change', {value: value});
			});
	}
};

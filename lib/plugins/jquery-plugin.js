require('jquery');
const $ = window.jQuery;

require('moment');
const moment = window.moment;

const calendar = require('../calendar');
const locales = require('../locales');

class JqueryDaterangePicker {
	constructor($this, options, DatePicker) {
		this.$elm = $this;
		this.options = this.normalizeOptions(options);
		const picker = new DatePicker(this.options);
		this.picker = picker;
		
		const api = picker.getApi();
		const destroy = api.destroy;
		api.destroy = () => {
			destroy();
			$this.off('.datepicker');
			$this.data('dateRangePicker', false);
		};
		
		const eventEmitter = picker.getEventEmitter();
		eventEmitter.addEventListener('datepicker-open', () => {
			this.loadDatesExternally();
		});
		eventEmitter.addEventListener('datepicker-change', () => {
			this.storeDatesExternally();
		});
		
		$this.data('dateRangePicker', api);
	}
	
	normalizeOptions(options) {
		options = $.extend({}, this.createDefaultOptions(), options, true);
		return options;
	}
	
	createDefaultOptions() {
		const $this = this.$elm;
		return {
			getValue: () => {
				return $this.val();
			},
			/* jshint ignore:start */
			/* jshint -W098 */
			setValue: (s, s1, s2) => {
			/* jshint +W098 */
				if (!$this.attr('readonly') && !$this.is(':disabled') && s != $this.val()) {
					$this.val(s);
				}
			},
			/* jshint ignore:end */
			openListeners: [{ target: $this, event: 'click' }],
			closeListeners: [{ target: document, event: 'click' }],
			functions: {
				calcPosition: (box, opt) => {
					var offset = $this.offset();
					if ($(opt.container).css('position') === 'relative') {
						var containerOffset = $(opt.container).offset();
						return {
							top: offset.top - containerOffset.top + $this.outerHeight() + 4,
							left: offset.left - containerOffset.left
						};
					} else {
						if (offset.left < 460) /* left to right */ {
							return {
								top: offset.top + $this.outerHeight() + parseInt($('body').css('border-top') || 0, 10),
								left: offset.left
							};
						} else {
							return {
								top: offset.top + $this.outerHeight() + parseInt($('body').css('border-top') || 0, 10),
								left: offset.left + $this.width() - box.width() - 16
							};
						}
					}
				}
			}
		};
	}
	
	loadDatesExternally() {
		const opt = this.options;
		const datesString = opt.getValue();
		const dates = datesString ? datesString.split(opt.separator) : [];

		if (dates.length >= 1) {
			if (opt.format.match(/Do/)) {

				opt.format = opt.format.replace(/Do/, 'D');
				dates[0] = dates[0].replace(/(\d+)(th|nd|st)/, '$1');
				if (dates.length >= 2) {
					dates[1] = dates[1].replace(/(\d+)(th|nd|st)/, '$1');
				}
			}

			// Set initiated  to avoid triggerring datepicker-change event
			this.picker.initiated = false;
			if (dates.length >= 2) {
				this.picker.setDateRange(
					moment(dates[0], opt.format, moment.locale(opt.language)).toDate(),
					moment(dates[1], opt.format, moment.locale(opt.language)).toDate(),
					true
				);
			} else if (dates.length === 1) {
				this.picker.setSingleDate(moment(dates[0], opt.format, moment.locale(opt.language)).toDate(), true);
			}
			this.picker.initiated = true;
		} else {
			this.picker.clearSelection();
		}
	}
	
	storeDatesExternally() {
		const picker = this.picker;
		const opt = picker.getOptions();
		const range = picker.getDateRange();
		var startStr = range.start ? calendar.getDateString(new Date(range.start), opt.format) : '';
		var endStr = range.end ? calendar.getDateString(new Date(range.end), opt.format) : '';
		var dateRange = startStr;
		if (range.start && range.end) {
			 dateRange += opt.separator + endStr;
		}
		this.options.setValue(dateRange, startStr, endStr);
	}
}


module.exports = {
	register(DatePicker) {
		$.dateRangePickerLanguages = locales;
		
		$.fn.dateRangePicker = function(options) {
			if (!options) {
				options = {};
			}
			
			return this.each((idx, elm) => {
				const $this = $(elm);
				if ($this.is(':not(input, span)')) {
					console.warn('Using the jquery plugin on non-inputs or spans is deprecated, ' +
						'for it is assumed that it is used with multiple input-elements.\n' +
						'If you need multiple input elements, use the non-jquery version instead');
				}
				
				// Prevent multple date pickers on the same element
				if ($this.data('dateRangePicker')) {
					return;
				}
				
				new JqueryDaterangePicker($this, options, DatePicker);
			});
		};
	}
};

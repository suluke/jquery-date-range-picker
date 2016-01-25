require('jquery');
const $ = window.jQuery;

require('moment');
const moment = window.moment;

class JqueryDaterangePicker {
	constructor($this, options, DatePicker) {
		this.$elm = $this;
		this.options = this.normalizeOptions(options);
		const picker = new DatePicker(this.options);
		this.picker = picker;
		
		const eventEmitter = picker.getEventEmitter();
		eventEmitter.addEventListener('datepicker-open', () => {
			this.loadDatesExternally();
		});
		eventEmitter.addEventListener('datepicker-change', data => {
			this.storeDatesExternally(data);
		});
		eventEmitter.addEventListener('datepicker-change-incomplete', data => {
			this.storeDatesExternally(data);
		});
		this.registerEventForwarders();
		this.registerListeners();
		this.createApi();
	}
	
	registerEventForwarders() {
		const eventEmitter = this.picker.getEventEmitter();
		const events = ['datepicker-change', 'datepicker-apply', 'datepicker-close', 'datepicker-closed', 'datepicker-open', 'datepicker-opened'];
		for (let i = 0; i < events.length; ++i) {
			eventEmitter.on(events[i], data => {
				this.$elm.trigger(events[i], data);
			});
		}
	}
	
	registerListeners() {
		this.$elm.on('click.datepicker', 
			() => {
				this.picker.openDatePicker();
				return false;
			}
		);
		$(document).on('click.datepicker', () => this.picker.closeDatePicker());
	}
	
	normalizeOptions(options) {
		options = $.extend(true, {}, this.createDefaultOptions(), options);
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
		const opt = this.picker.getOptions();
		let fmt = opt.format;
		const loc = moment.locale(opt.language);
		const datesString = opt.getValue();
		const dates = datesString ? datesString.split(opt.separator) : [];

		if (dates.length >= 1) {
			if (fmt.match(/Do/)) {

				fmt = fmt.replace(/Do/, 'D');
				dates[0] = dates[0].replace(/(\d+)(th|nd|st)/, '$1');
				if (dates.length >= 2) {
					dates[1] = dates[1].replace(/(\d+)(th|nd|st)/, '$1');
				}
			}

			if (dates.length >= 2) {
				this.picker.setDateRange(
					moment(dates[0], fmt, loc).toDate(),
					moment(dates[1], fmt, loc).toDate(),
					true
				);
			} else if (dates.length === 1) {
				this.picker.setSingleDate(moment(dates[0], fmt, loc).toDate(), true);
			}
		} else {
			this.picker.clearSelection();
		}
	}
	
	storeDatesExternally(dates) {
		if (!dates.date1) {
			this.options.setValue(dates.value, '', '');
		} else {
			const picker = this.picker;
			const opt = picker.getOptions();
			const range = picker.getDateRange();
			var startStr = range.start ? moment(range.start).format(opt.format) : '';
			var endStr = range.end ? moment(range.end).format(opt.format) : '';
			var dateRange = startStr;
			if (range.start && range.end) {
				 dateRange += opt.separator + endStr;
			}
			this.options.setValue(dateRange, startStr, endStr);
		}
	}
	
	createApi() {
		const picker = this.picker;
		const fmt = picker.getOptions().format;
		const $this = this.$elm;
		// Expose some api
		const api = {
			setDateRange: (d1, d2, silent) => {
				if (typeof d1 === 'string' && typeof d2 === 'string') {
					d1 = moment(d1, fmt).toDate();
					d2 = moment(d2, fmt).toDate();
					console.warn('Setting dates by strings is deprecated since some format specifiers cannot be used for parsing and formatting at the same time');
				}
				picker.setDateRange(d1, d2, silent);
			},
			clear: () => picker.clearSelection(),
			clearEnd: () => picker.clearEnd(),
			close: () => picker.closeDatePicker(),
			open: () => picker.openDatePicker(),
			getDatePicker: () => picker.getDom(),
			destroy: () => {
				$this.off('.datepicker');
				$this.data('dateRangePicker', false);
				picker.destroy();
			}
		};
		$this.data('dateRangePicker', api);
	}
}


module.exports = {
	register(DatePicker) {
		$.dateRangePickerLanguages = DatePicker.locales;
		
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

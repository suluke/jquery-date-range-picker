// TODO remove window access
require('jquery');
const $ = window.jQuery;
require('moment');
const moment = window.moment;

const config = require('./config');
const overrideableFunctions = require('./overrideable-functions');
// Merge overrideable functions into options default
config['option-defaults'].functions = overrideableFunctions;

const i18n = require('./i18n');
const templates = require('./templates');
const calendar = require('./calendar');
const EventEmitter = require('./event-emitter');

// Not-quite plugins (still considered core features)
const Tooltip = require('./day-tooltip');
const Gap = require('./gap');

// Plugins
const plugins = require('./plugins');

class DaterangePicker {
	constructor(opt) {
		if (!opt) {
			opt = {};
		}
		const pluginDefaults = plugins.mergeAllOptionDefaults ? plugins.mergeAllOptionDefaults() : {};
		opt = $.extend(true, pluginDefaults, config['option-defaults'], opt);

		// member declarations
		this.opt = opt;
		this.eventEmitter = new EventEmitter();
		this.box = null;
		this.gap = null;
		this.tooltip = null;
		this.resizeListener = () => this.calcPosition();

		$(window).on('resize.datepicker', this.resizeListener);
		this.eventEmitter.on('datepicker-change', () => this.autoclose());

		this.normalizeOptions();
		this.initDatepicker();

		if (opt.alwaysOpen) {
			this.openDatePicker(0);
		}
	}
	
	initDatepicker() {
		const opt = this.opt;
		const box = templates.createDom(opt).hide();
		this.box = box;
		const self = this;
		$(opt.container).append(box);
		
		if (!opt.inline) {
			this.calcPosition();
		} else {
			box.addClass('inline-wrapper');
		}

		// Initializes the month views
		var defaultTime = opt.defaultTime;
		if (opt.lookBehind) {
			// defaultTime < startDate => defaultTime = startTime + 1 month
			if (opt.startDate && calendar.compareMonth(defaultTime, opt.startDate) < 0) {
				defaultTime = calendar.nextMonth(moment(opt.startDate).toDate());
			}
			// defaultTime > endDate => defaultTime = endDate
			if (opt.endDate && calendar.compareMonth(defaultTime, opt.endDate) > 0) {
				defaultTime = moment(opt.endDate).toDate();
			}

			// display defaultTime on the right side of the two months
			// or don't display it if there is no right side
			this.showMonth(calendar.prevMonth(defaultTime), 'month1');
			this.showMonth(defaultTime, 'month2');

		} else {
			// defaultTime < startDate => defaultTime = startTime
			if (opt.startDate && calendar.compareMonth(defaultTime, opt.startDate) < 0) {
				defaultTime = moment(opt.startDate).toDate();
			}
			// defaultTime > endDate - 1 month => defaultTime = endDate - 1 month
			if (opt.endDate && calendar.compareMonth(calendar.nextMonth(defaultTime), opt.endDate) > 0) {
				defaultTime = calendar.prevMonth(moment(opt.endDate).toDate());
			}

			// show defaultTime in the left month panel
			this.showMonth(defaultTime, 'month1');
			this.showMonth(calendar.nextMonth(defaultTime), 'month2');
		}

		if (opt.singleDate) {
			if (opt.startDate && calendar.compareMonth(defaultTime, opt.startDate) < 0) {
				defaultTime = moment(opt.startDate).toDate();
			}
			if (opt.endDate && calendar.compareMonth(defaultTime, opt.endDate) > 0) {
				defaultTime = moment(opt.endDate).toDate();
			}

			this.showMonth(defaultTime, 'month1');
		}
		
		// Plugin initializations
		// must be after showMonths to give plugins a complete picker
		if (plugins.initializeAll) {
			plugins.initializeAll(this);
		}
		if (!opt.singleMonth) {
			this.gap = Gap.addToPicker(this);
		}
		if (opt.tooltip.enabled) {
			this.tooltip = Tooltip.addToPicker(this);
		}
		// end of plugin initialization

		if (opt.singleMonth) {
			box.addClass('single-month');
		} else {
			box.addClass('two-months');
		}
		
		box.click(function(evt) {
			evt.stopPropagation();
		});
		
		box.on('click', '.day', function() {
			self.dayClicked($(this));
		});

		box.find('.next').click(function() {self.showNextMonth(this);});
		box.find('.prev').click(function() {self.showPrevMonth(this);});
	}
	
	showNextMonth(monthview) {
		const self = this;
		const opt = this.opt;
		if (!opt.stickyMonths) {
			gotoNextMonth(monthview);
		} else {
			gotoNextMonthStickily();
		}
		
		function gotoNextMonth(elm) {
			const isMonth2 = $(elm).parents('table').hasClass('month2');
			var month = isMonth2 ? opt.month2 : opt.month1;
			month = calendar.nextMonth(month);
			if (!opt.singleMonth && !opt.singleDate &&
				!isMonth2 && calendar.compareMonth(month, opt.month2) >= 0 ||
				calendar.isMonthOutOfBounds(month, opt.startDate, opt.EndDate)
			) {
				return;
			}
			self.showMonth(month, isMonth2 ? 'month2' : 'month1');
			self.showGap();
		}

		function gotoNextMonthStickily() {
			var nextMonth1 = calendar.nextMonth(opt.month1);
			var nextMonth2 = calendar.nextMonth(opt.month2);
			if (calendar.isMonthOutOfBounds(nextMonth2, opt.startDate, opt.EndDate)) {
				return;
			}
			if (!opt.singleDate && calendar.compareMonth(nextMonth1, nextMonth2) >= 0) {
				return;
			}
			self.showMonth(nextMonth1, 'month1');
			self.showMonth(nextMonth2, 'month2');
			self.showSelectedDays();
		}
	}
	
	showPrevMonth(monthview) {
		const self = this;
		const opt = this.opt;
		if (!opt.stickyMonths) {
			gotoPrevMonth(monthview);
		} else {
			gotoPrevMonthStickily();
		}
		
		function gotoPrevMonth(elm) {
			var isMonth2 = $(elm).parents('table').hasClass('month2');
			var month = isMonth2 ? opt.month2 : opt.month1;
			month = calendar.prevMonth(month);
			if (isMonth2 && calendar.compareMonth(month, opt.month1) <= 0 || calendar.isMonthOutOfBounds(month, opt.startDate, opt.EndDate)) {
				return;
			}
			self.showMonth(month, isMonth2 ? 'month2' : 'month1');
			self.showGap();
		}

		function gotoPrevMonthStickily() {
			var prevMonth1 = calendar.prevMonth(opt.month1);
			var prevMonth2 = calendar.prevMonth(opt.month2);
			if (calendar.isMonthOutOfBounds(prevMonth1, opt.startDate, opt.EndDate)) {
				return;
			}
			if (!opt.singleDate && calendar.compareMonth(prevMonth2, prevMonth1) <= 0) {
				return;
			}
			self.showMonth(prevMonth1, 'month1');
			self.showMonth(prevMonth2, 'month2');
			self.showSelectedDays();
		}
	}
	
	normalizeOptions() {
		const opt = this.opt;
		// TODO why does this live in opt?
		opt.start = false;
		opt.end = false;

		opt.startWeek = false;

		//Detect a touch device
		opt.isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;

		//If it is a touch device, hide hovering tooltip
		if (opt.isTouchDevice) {
			opt.showTooltip = false;
		}

		//Show one month on mobile devices
		if (opt.singleMonth === 'auto') {
			opt.singleMonth = $(window).width() < 480;
		}
		if (opt.singleMonth) {
			opt.stickyMonths = false;
		}

		if (opt.singleDate) {
			opt.singleMonth = true;
			opt.draggableRangeBounds = false;
		}

		if (!opt.topBar.enabled) {
			opt.autoClose = true;
		}

		if (opt.startDate && typeof opt.startDate === 'string') {
			opt.startDate = moment(opt.startDate, opt.format).toDate();
		}
		if (opt.endDate && typeof opt.endDate === 'string') {
			opt.endDate = moment(opt.endDate, opt.format).toDate();
		}
	}

	invalidate() {
		this.checkSelectionValid();
		this.triggerHasChanged(false);
		this.showSelectedDays();
	}

	calcPosition(evt) {
		if (!this.opt.inline) {
			var positionCss = this.opt.functions.calcPosition(this.box, this.opt, evt);
			this.box.css(positionCss);
		}
	}

	openDatePicker(animationTime, evt) {
		const box = this.box;
		this.calcPosition(evt);
		box.slideDown(animationTime, () => {
			this.eventEmitter.trigger('datepicker-opened', { relatedTarget: box });
		});
		this.eventEmitter.trigger('datepicker-open', { relatedTarget: box });
		this.showGap();
		this.updateCalendarWidth();
	}

	closeDatePicker() {
		if (this.opt.alwaysOpen) {
			return;
		}
		const box = this.box;
		box.slideUp(this.opt.duration, () => {
			this.eventEmitter.trigger('datepicker-closed', { relatedTarget: box });
		});

		this.eventEmitter.trigger('datepicker-close', { relatedTarget: box });
	}

	updateCalendarWidth() {
		const box = this.box;
		let w = 0;
		w += box.find('.month1').width();
		if (!this.opt.singleMonth) {
			w += this.gap.getDisplayWidth();
			w += box.find('.month2').width();
		}
		box.find('.month-wrapper').width(w);
	}

	clearEnd() {
		if (!this.opt.start) {
			return;
		}
		this.opt.end = false;
		this.box.find('.day.checked').removeClass('checked');
		this.box.find('.day.last-date-selected').removeClass('last-date-selected');

		//StoreDatesExternally();
		this.invalidate();
	}
	clearSelection() {
		const box = this.box;
		this.opt.start = false;
		this.opt.end = false;
		box.find('.day.checked').removeClass('checked');
		box.find('.day.last-date-selected').removeClass('last-date-selected');
		box.find('.day.first-date-selected').removeClass('first-date-selected');

		//StoreDatesExternally();
		this.invalidate();
	}

	handleStart(time) {
		const opt = this.opt;
		var r = time;
		if (opt.batchMode === 'week-range') {
			if (opt.startOfWeek === 'monday') {
				r = moment(parseInt(time)).startOf('isoweek').valueOf();
			} else {
				r = moment(parseInt(time)).startOf('week').valueOf();
			}
		} else if (opt.batchMode === 'month-range') {
			r = moment(parseInt(time)).startOf('month').valueOf();
		}
		return r;
	}

	handleEnd(time) {
		const opt = this.opt;
		var r = time;
		if (opt.batchMode === 'week-range') {
			if (opt.startOfWeek === 'monday') {
				r = moment(parseInt(time)).endOf('isoweek').valueOf();
			} else {
				r = moment(parseInt(time)).endOf('week').valueOf();
			}
		} else if (opt.batchMode === 'month') {
			r = moment(parseInt(time)).endOf('month').valueOf();
		}
		return r;
	}

	dayClicked(day) {
		if (day.hasClass('invalid')) {
			return;
		}
		const opt = this.opt;
		var time = day.attr('time');
		day.addClass('checked');
		if (opt.singleDate) {
			opt.start = time;
			opt.end = false;
		} else if (opt.batchMode === 'week') {
			if (opt.startOfWeek === 'monday') {
				opt.start = moment(parseInt(time)).startOf('isoweek').valueOf();
				opt.end = moment(parseInt(time)).endOf('isoweek').valueOf();
			} else {
				opt.end = moment(parseInt(time)).endOf('week').valueOf();
				opt.start = moment(parseInt(time)).startOf('week').valueOf();
			}
		} else if (opt.batchMode === 'workweek') {
			opt.start = moment(parseInt(time)).day(1).valueOf();
			opt.end = moment(parseInt(time)).day(5).valueOf();
		} else if (opt.batchMode === 'weekend') {
			opt.start = moment(parseInt(time)).day(6).valueOf();
			opt.end = moment(parseInt(time)).day(7).valueOf();
		} else if (opt.batchMode === 'month') {
			opt.start = moment(parseInt(time)).startOf('month').valueOf();
			opt.end = moment(parseInt(time)).endOf('month').valueOf();
		} else if ((opt.start && opt.end) || (!opt.start && !opt.end)) {
			opt.start = this.handleStart(time);
			opt.end = false;
		} else if (opt.start) {
			opt.end = this.handleEnd(time);
			if (opt.time.enabled) {
				opt.end = this.addTimeToDate(opt.endTime, opt.end);
			}
		}

		//Update time in case it is enabled and timestamps are available
		if (opt.time.enabled) {
			if (opt.start) {
				opt.start = this.addTimeToDate(opt.startTime, opt.start);
			}
			if (opt.end) {
				opt.end = this.addTimeToDate(opt.endTime, opt.end);
			}
		}

		//In case the start is after the end, swap the timestamps
		if (!opt.singleDate && opt.start && opt.end && opt.start > opt.end) {
			var tmp = opt.end;
			opt.end = this.handleEnd(opt.start);
			opt.start = this.handleStart(tmp);
			this.eventEmitter.trigger('datepicker-time-change');
		}

		opt.start = parseInt(opt.start);
		opt.end = parseInt(opt.end);

		if (opt.tooltip.enabled) {
			this.tooltip.hide();
		}
		if (opt.start && !opt.end) {
			this.eventEmitter.trigger('datepicker-first-date-selected', {
				'date1': new Date(opt.start)
			});
			if (opt.tooltip.enabled) {
				this.tooltip.dayHovering(day);
			}
		}
		this.updateSelectableRange(time);

		this.invalidate();
	}

	updateSelectableRange() {
		const opt = this.opt;
		this.box.find('.day.invalid.tmp').removeClass('tmp invalid').addClass('valid');
		if (opt.start && !opt.end) {
			this.box.find('.day.this-month.valid').each(function() {
				var time = parseInt($(this).attr('time'), 10);
				if (!calendar.isValidTime(time, opt, opt)) {
					$(this).addClass('invalid tmp').removeClass('valid');
				} else {
					$(this).addClass('valid tmp').removeClass('invalid');
				}
			});
		}

		return true;
	}

	autoclose() {
		const opt = this.opt;
		if (opt.autoClose) {
			if (opt.singleDate === true && opt.start) {
				this.closeDatePicker();
			} else if (opt.start && opt.end) {
				this.closeDatePicker();
			}
		}
	}

	checkSelectionValid() {
		const opt = this.opt;
		const box = this.box;
		var days = Math.ceil((opt.end - opt.start) / 86400000) + 1;
		if (opt.singleDate) { // Validate if only start is there
			if (opt.start && !opt.end) {
				box.find('.drp_top-bar').removeClass('error').addClass('normal');
			} else {
				box.find('.drp_top-bar').removeClass('error').removeClass('normal');
			}
		} else if (opt.maxDays && days > opt.maxDays) {
			opt.start = false;
			opt.end = false;
			box.find('.day').removeClass('checked');
			box.find('.drp_top-bar').removeClass('normal').addClass('error')
				.find('.error-top').html(i18n.lang('less-than', opt.language).replace('%d', opt.maxDays));
		} else if (opt.minDays && days < opt.minDays) {
			opt.start = false;
			opt.end = false;
			box.find('.day').removeClass('checked');
			box.find('.drp_top-bar').removeClass('normal').addClass('error')
				.find('.error-top').html(i18n.lang('more-than', opt.language).replace('%d', opt.minDays));
		} else {
			if (opt.start || opt.end) {
				box.find('.drp_top-bar').removeClass('error').addClass('normal');
			} else {
				box.find('.drp_top-bar').removeClass('error').removeClass('normal');
			}
		}

		const valid = (opt.singleDate && opt.start && !opt.end) || (!opt.singleDate && opt.start && opt.end);
		this.eventEmitter.trigger('datepicker-update-validity', valid);

		if (opt.batchMode) {
			if (
				(opt.start && opt.startDate && calendar.compareDay(opt.start, opt.startDate) < 0) ||
				(opt.end && opt.endDate && calendar.compareDay(opt.end, opt.endDate) > 0)
			) {
				opt.start = false;
				opt.end = false;
				box.find('.day').removeClass('checked');
			}
		}
	}

	/**
	 * This method is called to notify (e.g. trigger events) when the date-picker
	 * state has changed
	 */
	triggerHasChanged(forceValid) {
		const opt = this.opt;
		
		// Prevent sending events without change
		if (this._lastChangedRange) {
			if (this._lastChangedRange.start === opt.start && this._lastChangedRange.end === opt.end) {
				return;
			}
		}
		
		let startText = '...';
		let endText = '...';
		let selectedText = '';
		let valid = forceValid;

		// Is date range selected? (or just date in singleDate mode)
		if ((opt.start && opt.singleDate) || (opt.start && opt.end)) {
			valid = true;
			startText = calendar.getDateString(new Date(parseInt(opt.start)), opt.format);

			// Trigger events
			let event = {
				'value': startText,
				'date1': new Date(opt.start)
			};
			if (opt.end) {
				endText = calendar.getDateString(new Date(parseInt(opt.end)), opt.format);
				selectedText = '' + calendar.countDays(opt.end, opt.start);
				event.value += opt.separator + endText;
				event.date2 = new Date(opt.end);
			}
			this.eventEmitter.trigger('datepicker-change', event);
		} else {
			this.eventEmitter.trigger('datepicker-change-incomplete', {
				startText: startText,
				endText: endText,
				selectedText: selectedText,
				valid: valid
			});
		}
		this._lastChangedRange = {start: opt.start, end: opt.end};
	}

	/**
	 * 
	 * @param {Date} date1 An instance of `Date` describing one delimiter of the date range
	 * @param {Date} date2 An instance of `Date` describing one delimiter of the date range
	 * @param {boolean} silent Whether or not events should be emitted
	 * @param {boolean} keepMonthPositions Whether or not the view should re-focus onto the given date range
	 */
	setDateRange(date1, date2, silent, keepMonthPositions) {
		const opt = this.opt;
		// Swap dates if in wrong order
		if (date1.getTime() > date2.getTime()) {
			var tmp = date2;
			date2 = date1;
			date1 = tmp;
			tmp = null;
		}
		
		var valid = true;

		// Date1 too early?
		if (opt.startDate && calendar.compareDay(date1, opt.startDate) < 0) {
			valid = false;
		}

		// Date2 too late?
		if (opt.endDate && calendar.compareDay(date2, opt.endDate) > 0) {
			valid = false;
		}

		// Reset to default date limits
		if (!valid) {
			this.showMonth(opt.startDate, 'month1');
			this.showMonth(calendar.nextMonth(opt.startDate), 'month2');
			this.showGap();
			return;
		}
		
		opt.start = date1.getTime();
		opt.end = date2.getTime();

		this.eventEmitter.trigger('datepicker-time-change');

		if (opt.stickyMonths || (calendar.compareDay(date1, date2) > 0 && calendar.compareMonth(date1, date2) === 0)) {
			if (opt.lookBehind) {
				date1 = calendar.prevMonth(date2);
			} else {
				date2 = calendar.nextMonth(date1);
			}
		}

		if (opt.stickyMonths && calendar.compareMonth(date2, opt.endDate) > 0) {
			date1 = calendar.prevMonth(date1);
			date2 = calendar.prevMonth(date2);
		}

		if (!opt.stickyMonths) {
			if (calendar.compareMonth(date1, date2) === 0) {
				if (opt.lookBehind) {
					date1 = calendar.prevMonth(date2);
				} else {
					date2 = calendar.nextMonth(date1);
				}
			}
		}

		if (!keepMonthPositions) {
			this.showMonth(date1, 'month1');
			this.showMonth(date2, 'month2');
		}
		this.checkSelectionValid();
		this.showGap();
		if (!silent) {
			this.triggerHasChanged(false);
		}
	}

	setSingleDate(date1, silent) {
		const opt = this.opt;
		var valid = true;
		if (opt.startDate && calendar.compareDay(date1, opt.startDate) < 0) {
			valid = false;
		}
		if (opt.endDate && calendar.compareDay(date1, opt.endDate) > 0) {
			valid = false;
		}
		if (!valid) {
			this.showMonth(opt.startDate, 'month1');
			return;
		}

		opt.start = date1.getTime();
		opt.end = false;

		this.showMonth(date1, 'month1');

		//ShowMonth(date2,'month2');
		this.showGap();
		if (!silent) {
			this.triggerHasChanged(false);
		}
	}

	/**
	 * 
	 * @param {Date} date
	 * @param {string} month
	 */
	showMonth(date, month) {
		const opt = this.opt;
		if (date) {
			date = moment(date).toDate();
		} else {
			date = moment().toDate();
		}
		const $month = this.box.find('.' + month);
		
		// prevent unnecessary re-render
		const monthId = moment(date).startOf('month').valueOf();
		if ($month.attr('data-time') === '' + monthId) {
			return;
		} else {
			$month.attr('data-time', monthId);
		}
		
		var monthName = i18n.nameMonth(date.getMonth(), opt.language);
		$month.find('.month-name').html(monthName + ' ' + date.getFullYear());
		$month.find('tbody').html(templates.createMonthHTML(date, opt));
		this.eventEmitter.trigger('datepicker-show-month', $month);
		opt[month] = date;
		this.updateSelectableRange();
	}

	showGap() {
		const gap = this.gap;
		this.showSelectedDays();
		if (!gap) {
			return;
		}
		var m1 = parseInt(moment(this.opt.month1).format('YYYYMM'));
		var m2 = parseInt(moment(this.opt.month2).format('YYYYMM'));
		var p = Math.abs(m1 - m2);
		var shouldShow = (p > 1 && p !== 89);
		if (shouldShow) {
			gap.show();
		} else {
			gap.hide();
		}
	}
	showSelectedDays() {
		const opt = this.opt;
		if (!opt.start && !opt.end) {
			return;
		}
		this.box.find('.day').each(function() {
			var time = parseInt($(this).attr('time')),
				start = opt.start,
				end = opt.end;
			if (opt.time.enabled) {
				time = moment(time).startOf('day').valueOf();
				start = moment(start || moment().valueOf()).startOf('day').valueOf();
				end = moment(end || moment().valueOf()).startOf('day').valueOf();
			}
			if (
				(opt.start && opt.end && end >= time && start <= time) ||
				(opt.start && !opt.end && moment(start).format('YYYY-MM-DD') === moment(time).format('YYYY-MM-DD'))
			) {
				$(this).addClass('checked');
			} else {
				$(this).removeClass('checked');
			}

			//Add first-date-selected class name to the first date selected
			if (opt.start && moment(start).format('YYYY-MM-DD') === moment(time).format('YYYY-MM-DD')) {
				$(this).addClass('first-date-selected');
			} else {
				$(this).removeClass('first-date-selected');
			}

			//Add last-date-selected
			if (opt.end && moment(end).format('YYYY-MM-DD') === moment(time).format('YYYY-MM-DD')) {
				$(this).addClass('last-date-selected');
			} else {
				$(this).removeClass('last-date-selected');
			}
		});

		this.eventEmitter.trigger('datepicker-show-selected-range', opt);
	}
	
	getEventEmitter() {
		return this.eventEmitter;
	}
	
	getOptions() {
		return this.opt;
	}
	getDateRange() {
		return this.opt;
	}
	getDom() {
		return this.box;
	}
	
	destroy() {
		this.box.remove();
		this.eventEmitter.trigger('datepicker-destroy');
		$(window).off('resize.datepicker', this.resizeListener);
	}
	
	addTimeToDate(time, date) {
		return moment(parseInt(date))
			.startOf('day')
			.add(moment(time).format('HH'), 'h')
			.add(moment(time).format('mm'), 'm').valueOf();
	}
}

module.exports = DaterangePicker;

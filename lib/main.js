/**
 * Daterangepicker.js
 * version : 1.0.0
 * author : mindscreen GmbH
 * original author : Chunlong Liu
 * last updated at: 2016-1-2
 * license : MIT
 * www.mindscreen.de
 */

require('jquery');
require('moment');

// FIXME This is a workaround for undefined 'module' variable (strict mode)
// when calling moment.loadLocale/moment.locale
if (!window.module) {
	window.module = undefined;
}

// TODO remove window access
const $ = window.jQuery;
const moment = window.moment;

$.dateRangePickerLanguages = require('./locales');
const i18n = require('./i18n');
const templates = require('./templates');
const calendar = require('./calendar');
const config = require('./config');
const shortcuts = require('./shortcuts');
const overrideableFunctions = require('./overrideable-functions');

// Merge overrideable functions into options default
config['option-defaults'].functions = overrideableFunctions;

const DaytimeSelect = require('./daytime-selection');
const TopBar = require('./top-bar');
const WeekNumbers = require('./week-numbers');
const Gap = require('./gap');
const Tooltip = require('./day-tooltip');
const DoubleClickPrevent = require('./plugins/double-click-prevent');
const Unselectable = require('./plugins/unselectable');
const DraggableRangeBounds = require('./plugins/draggable-range-bounds');

$.fn.dateRangePicker = function(opt) {
	'use strict';
	// Prevent multple date pickers on the same element
	if ($(this).data('date-picker-opened')) {
		return;
	}
	$(this).data('date-picker-opened', true);

	if (!opt) {
		opt = {};
	}
	opt = $.extend(true, {}, config['option-defaults'], opt);
	normalizeOptions(opt);

	const self = this;
	const selfDom = this.get(0);
	const func = opt.functions;

	let box;
	let initiated = false;
	let domChangeTimer;
	let daytime1 = null;
	let daytime2 = null;
	let topBar = null;
	let weekNumbers = [];
	let gap = null;
	let tooltip = null;

	$(this).off('.datepicker');

	const eventChangesOpenStateTag = config.eventChangesOpenStateTag;
	const isOpenStateChangedBy = function(evt) {
		if (evt.originalEvent) {
			evt = evt.originalEvent;
		}
		return evt[eventChangesOpenStateTag] && evt[eventChangesOpenStateTag].indexOf(selfDom) >= 0;
	};
	const markAsChangingOpenState = function(evt) {
		if (evt.originalEvent) {
			evt = evt.originalEvent;
		}
		if (!evt[eventChangesOpenStateTag]) {
			evt[eventChangesOpenStateTag] = [];
		}
		evt[eventChangesOpenStateTag].push(selfDom);
	};
	registerListeners(opt.openListeners, (evt) => {
		if (!box.is(':visible') && !isOpenStateChangedBy(evt)) {
			markAsChangingOpenState(evt);
			openDatePicker(opt.duration, evt);
		}
	});
	registerListeners(opt.closeListeners, function(evt) {
		if (box.is(':visible') && !isOpenStateChangedBy(evt)) {
			markAsChangingOpenState(evt);
			closeDatePicker(evt);
		}
	});
	$(window).on('resize.datepicker', calcPosition);

	initDatepicker(self);

	if (opt.alwaysOpen) {
		openDatePicker(0);
	}

	// Expose some api
	$(this).data('dateRangePicker', {
		setDateRange: function(d1, d2, silent) {
			if (typeof d1 === 'string' && typeof d2 === 'string') {
				d1 = moment(d1, opt.format).toDate();
				d2 = moment(d2, opt.format).toDate();
			}
			setDateRange(d1, d2, silent);
		},
		clear: clearSelection,
		clearEnd: clearEnd,
		close: closeDatePicker,
		open: openDatePicker,
		getDatePicker: () => box,
		destroy: function() {
			unregisterListeners(opt.openListeners);
			unregisterListeners(opt.closeListeners);
			$(self).off('.datepicker');
			$(self).data('dateRangePicker', false);
			$(self).data('date-picker-opened', null);
			box.remove();
			$(window).off('resize.datepicker', calcPosition);
		}
	});

	return this;

	function initDatepicker(element) {
		box = templates.createDom(opt).hide();
		$(opt.container).append(box);
		
		if (opt.showTopbar) {
			topBar = TopBar.addToPicker(box, opt, () => {
				closeDatePicker();
				var dateRange = (
					calendar.getDateString(new Date(opt.start), opt.format) +
					opt.separator +
					calendar.getDateString(new Date(opt.end), opt.format)
				);
				$(self).trigger('datepicker-apply', {
					'value': dateRange,
					'date1': new Date(opt.start),
					'date2': new Date(opt.end)
				});
			});
		}
		if (!opt.singleMonth) {
			gap = Gap.addToPicker(box);
		}
		if (opt.showTooltip) {
			tooltip = Tooltip.addToPicker(box, opt, opt.language, opt.singleDate, func.hoveringTooltip);
		}
		if (opt.preventDoubleClicks) {
			DoubleClickPrevent.addToPicker(box);
		}
		if (opt.draggableRangeBounds) {
			DraggableRangeBounds.addToPicker(box, setDateRange);
		}

		if (!opt.inline) {
			calcPosition();
		} else {
			box.addClass('inline-wrapper');
		}

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
			showMonth(calendar.prevMonth(defaultTime), 'month1');
			showMonth(defaultTime, 'month2');

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
			showMonth(defaultTime, 'month1');
			showMonth(calendar.nextMonth(defaultTime), 'month2');
		}

		if (opt.singleDate) {
			if (opt.startDate && calendar.compareMonth(defaultTime, opt.startDate) < 0) {
				defaultTime = moment(opt.startDate).toDate();
			}
			if (opt.endDate && calendar.compareMonth(defaultTime, opt.endDate) > 0) {
				defaultTime = moment(opt.endDate).toDate();
			}

			showMonth(defaultTime, 'month1');
		}

		if (opt.time.enabled) {
			const daytimes = DaytimeSelect.addToPicker(opt, opt.language, opt.singleDate, opt.defaultTime, box, invalidate);
			daytime1 = daytimes[0];
			daytime2 = daytimes[1];
		}

		if (opt.showWeekNumbers) {
			weekNumbers = WeekNumbers.addToPicker(opt, box, updateSelectableRange, invalidate, autoclose);
		}

		//ShowSelectedInfo();

		if (opt.singleMonth) {
			box.addClass('single-month');
		} else {
			box.addClass('two-months');
		}

		setTimeout(function() {
			updateCalendarWidth();
			initiated = true;
		}, 0);

		box.click(function(evt) {
			evt.stopPropagation();
		});

		box.find('.next').click(function() {
			if (!opt.stickyMonths) {
				gotoNextMonth(this);
			} else {
				gotoNextMonthStickily(this);
			}
		});

		function gotoNextMonth(self) {
			var isMonth2 = $(self).parents('table').hasClass('month2');
			var month = isMonth2 ? opt.month2 : opt.month1;
			month = calendar.nextMonth(month);
			if (!opt.singleMonth && !opt.singleDate &&
				!isMonth2 && calendar.compareMonth(month, opt.month2) >= 0 ||
				calendar.isMonthOutOfBounds(month, opt.startDate, opt.EndDate)
			) {
				return;
			}
			showMonth(month, isMonth2 ? 'month2' : 'month1');
			showGap(opt);
		}

		function gotoNextMonthStickily(self) {
			var nextMonth1 = calendar.nextMonth(opt.month1);
			var nextMonth2 = calendar.nextMonth(opt.month2);
			if (calendar.isMonthOutOfBounds(nextMonth2, opt.startDate, opt.EndDate)) {
				return;
			}
			if (!opt.singleDate && calendar.compareMonth(nextMonth1, nextMonth2) >= 0) {
				return;
			}
			showMonth(nextMonth1, 'month1');
			showMonth(nextMonth2, 'month2');
			showSelectedDays(opt);
		}

		box.find('.prev').click(function() {
			if (!opt.stickyMonths) {
				gotoPrevMonth(this);
			} else {
				gotoPrevMonthStickily(this);
			}
		});

		function gotoPrevMonth(self) {
			var isMonth2 = $(self).parents('table').hasClass('month2');
			var month = isMonth2 ? opt.month2 : opt.month1;
			month = calendar.prevMonth(month);
			if (isMonth2 && calendar.compareMonth(month, opt.month1) <= 0 || calendar.isMonthOutOfBounds(month, opt.startDate, opt.EndDate)) {
				return;
			}
			showMonth(month, isMonth2 ? 'month2' : 'month1');
			showGap(opt);
		}

		function gotoPrevMonthStickily(self) {
			var prevMonth1 = calendar.prevMonth(opt.month1);
			var prevMonth2 = calendar.prevMonth(opt.month2);
			if (calendar.isMonthOutOfBounds(prevMonth1, opt.startDate, opt.EndDate)) {
				return;
			}
			if (!opt.singleDate && calendar.compareMonth(prevMonth2, prevMonth1) <= 0) {
				return;
			}
			showMonth(prevMonth1, 'month1');
			showMonth(prevMonth2, 'month2');
			showSelectedDays(opt);
		}

		box.on('click', '.day', function(evt) {
			dayClicked($(this));
		});
		
		Unselectable.addToPicker(box);

		box.find('[custom]').click(function() {
			var valueName = $(this).attr('custom');
			opt.start = false;
			opt.end = false;
			box.find('.day.checked').removeClass('checked');
			func.setValue.call(selfDom, valueName);
			checkSelectionValid();
			showSelectedInfo(true);
			showSelectedDays(opt);
			if (opt.autoClose) {
				closeDatePicker();
			}
		});

		if (opt.showShortcuts) {
			shortcuts.addToPicker(box, opt.shortcuts, opt.customShortcuts, opt.language, opt.startOfWeek,
				(date) => {
					showMonth(date, 'month1');
					showMonth(calendar.nextMonth(date), 'month2');
					showGap(opt);
				},
				(start, end) => {
					setDateRange(start, end);
					checkSelectionValid();
				}
			);
		}
	}
	
	function normalizeOptions(opt) {
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

		if (!opt.showTopbar) {
			opt.autoClose = true;
		}

		if (opt.startDate && typeof opt.startDate === 'string') {
			opt.startDate = moment(opt.startDate, opt.format).toDate();
		}
		if (opt.endDate && typeof opt.endDate === 'string') {
			opt.endDate = moment(opt.endDate, opt.format).toDate();
		}
	}

	function registerListeners(listeners, callback) {
		const makeFilteredListener = filter => {
			return function(evt) {
				if (filter(evt)) {
					callback.call(this, evt);
				}
			};
		};
		for (let i = 0; i < listeners.length; ++i) {
			const listener = listeners[i];
			const evtName = listener.event + '.datepicker';
			const $elm = listener.target === 'self' ? self : $(listener.target);
			if (typeof listener.filter === 'function') {
				$elm.on(evtName, makeFilteredListener(listener.filter));
			} else if (typeof listener.filter === 'string') {
				$elm.on(evtName, listener.filter, callback);
			} else {
				$elm.on(evtName, callback);
			}
		}
	}
	function unregisterListeners(listeners) {
		for (let i = 0; i < listeners.length; ++i) {
			const listener = listeners[i];
			const evtName = listener.event + '.datepicker';
			const $elm = listener.target === 'self' ? self : $(listener.target);
			$elm.off(evtName);
		}
	}

	function invalidate() {
		checkSelectionValid();
		showSelectedInfo();
		showSelectedDays(opt);
	}

	function calcPosition(evt) {
		if (!opt.inline) {
			var positionCss = func.calcPosition(self, box, opt, evt);
			box.css(positionCss);
		}
	}

	function openDatePicker(animationTime, evt) {
		calcPosition(evt);
		loadDatesExternally();
		box.slideDown(animationTime, function() {
			$(self).trigger('datepicker-opened', { relatedTarget: box });
		});
		$(self).trigger('datepicker-open', { relatedTarget: box });
		showGap(opt);
		updateCalendarWidth();
	}

	function closeDatePicker() {
		if (opt.alwaysOpen) {
			return;
		}
		$(box).slideUp(opt.duration, function() {
			$(self).data('date-picker-opened', false);
			$(self).trigger('datepicker-closed', { relatedTarget: box });
		});

		$(self).trigger('datepicker-close', { relatedTarget: box });
	}

	function storeDatesExternally() {
		var startStr = opt.start ? calendar.getDateString(new Date(opt.start), opt.format) : '';
		var endStr = opt.end ? calendar.getDateString(new Date(opt.end), opt.format) : '';
		var dateRange = startStr;
		if (opt.start && opt.end) {
			 dateRange += opt.separator + endStr;
		}
		func.setValue.call(selfDom, dateRange, startStr, endStr);
	}

	function loadDatesExternally() {
		var datesString = func.getValue.call(selfDom);
		var dates = datesString ? datesString.split(opt.separator) : [];

		if (dates.length >= 1) {
			if (opt.format.match(/Do/)) {

				opt.format = opt.format.replace(/Do/, 'D');
				dates[0] = dates[0].replace(/(\d+)(th|nd|st)/, '$1');
				if (dates.length >= 2) {
					dates[1] = dates[1].replace(/(\d+)(th|nd|st)/, '$1');
				}
			}

			// Set initiated  to avoid triggerring datepicker-change event
			initiated = false;
			if (dates.length >= 2) {
				setDateRange(
					moment(dates[0], opt.format, moment.locale(opt.language)).toDate(),
					moment(dates[1], opt.format, moment.locale(opt.language)).toDate(),
					true
				);
			} else if (dates.length === 1) {
				setSingleDate(moment(dates[0], opt.format, moment.locale(opt.language)).toDate(), true);
			}
			initiated = true;
		} else {
			clearSelection();
		}
	}

	function updateCalendarWidth() {
		let w = 0;
		w += box.find('.month1').width();
		if (!opt.singleMonth) {
			w += gap.getDisplayWidth();
			w += box.find('.month2').width();
		}
		box.find('.month-wrapper').width(w);
	}

	function clearEnd() {
		if (!opt.start) {
			return;
		}
		opt.end = false;
		box.find('.day.checked').removeClass('checked');
		box.find('.day.last-date-selected').removeClass('last-date-selected');

		//StoreDatesExternally();
		invalidate();
	}
	function clearSelection() {
		opt.start = false;
		opt.end = false;
		box.find('.day.checked').removeClass('checked');
		box.find('.day.last-date-selected').removeClass('last-date-selected');
		box.find('.day.first-date-selected').removeClass('first-date-selected');

		//StoreDatesExternally();
		invalidate();
	}

	function handleStart(time) {
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

	function handleEnd(time) {
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

	function dayClicked(day) {
		if (day.hasClass('invalid')) {
			return;
		}
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
			opt.start = handleStart(time);
			opt.end = false;
		} else if (opt.start) {
			opt.end = handleEnd(time);
			if (opt.time.enabled) {
				DaytimeSelect.changeTime(opt, 'end', opt.end);
			}
		}

		//Update time in case it is enabled and timestamps are available
		if (opt.time.enabled) {
			if (opt.start) {
				DaytimeSelect.changeTime(opt, 'start', opt.start);
			}
			if (opt.end) {
				DaytimeSelect.changeTime(opt, 'end', opt.end);
			}
		}

		//In case the start is after the end, swap the timestamps
		if (!opt.singleDate && opt.start && opt.end && opt.start > opt.end) {
			var tmp = opt.end;
			opt.end = handleEnd(opt.start);
			opt.start = handleStart(tmp);
			if (opt.time.enabled) {
				daytime1.renderTime(opt.start);
				daytime2.renderTime(opt.end);
			}
		}

		opt.start = parseInt(opt.start);
		opt.end = parseInt(opt.end);

		if (opt.showTooltip) {
			tooltip.hide();
		}
		if (opt.start && !opt.end) {
			$(self).trigger('datepicker-first-date-selected', {
				'date1': new Date(opt.start)
			});
			if (opt.showTooltip) {
				tooltip.dayHovering(day);
			}
		}
		updateSelectableRange(time);

		invalidate();
		autoclose();
	}

	function updateSelectableRange() {
		box.find('.day.invalid.tmp').removeClass('tmp invalid').addClass('valid');
		if (opt.start && !opt.end) {
			box.find('.day.toMonth.valid').each(function() {
				var time = parseInt($(this).attr('time'), 10);
				if (!calendar.isValidTime(time, opt)) {
					$(this).addClass('invalid tmp').removeClass('valid');
				} else {
					$(this).addClass('valid tmp').removeClass('invalid');
				}
			});
		}

		return true;
	}

	function autoclose () {
		if (opt.singleDate === true) {
			if (initiated && opt.start) {
				if (opt.autoClose) {
					closeDatePicker();
				}
			}
		} else {
			if (initiated && opt.start && opt.end) {
				if (opt.autoClose) {
					closeDatePicker();
				}
			}
		}
	}

	function checkSelectionValid() {
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

		if (topBar) {
			if ((opt.singleDate && opt.start && !opt.end) || (!opt.singleDate && opt.start && opt.end)) {
				topBar.enableCloseBtn();
			} else {
				topBar.disableCloseBtn();
			}
		}

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

	function showSelectedInfo(forceValid, silent) {
		// TODO at least some of this code belongs in top-bar.js
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
			if (initiated && !silent) {
				$(self).trigger('datepicker-change', event);
			}

			storeDatesExternally();
		}

		if (topBar) {
			topBar.setState(startText, endText, selectedText, valid);
		}
	}

	/**
	 * 
	 * @param {Date} date1 An instance of `Date` describing one delimiter of the date range
	 * @param {Date} date2 An instance of `Date` describing one delimiter of the date range
	 * @param {boolean} silent Whether or not
	 */
	function setDateRange(date1, date2, silent) {
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
			showMonth(opt.startDate, 'month1');
			showMonth(calendar.nextMonth(opt.startDate), 'month2');
			showGap(opt);
			return;
		}

		opt.start = date1.getTime();
		opt.end = date2.getTime();

		if (opt.time.enabled) {
			daytime1.renderTime(date1);
			daytime2.renderTime(date2);
		}

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

		showMonth(date1, 'month1');
		showMonth(date2, 'month2');
		showGap(opt);
		checkSelectionValid();
		showSelectedInfo(false, silent);
		autoclose();
	}

	function setSingleDate(date1, silent) {
		var valid = true;
		if (opt.startDate && calendar.compareDay(date1, opt.startDate) < 0) {
			valid = false;
		}
		if (opt.endDate && calendar.compareDay(date1, opt.endDate) > 0) {
			valid = false;
		}
		if (!valid) {
			showMonth(opt.startDate, 'month1');
			return;
		}

		opt.start = date1.getTime();
		opt.end = false;

		if (opt.time.enabled) {
			daytime1.renderTime('time1', date1);
		}
		showMonth(date1, 'month1');

		//ShowMonth(date2,'month2');
		showGap(opt);
		showSelectedInfo();
		autoclose();
	}

	/**
	 * 
	 * @param {Date} date
	 * @param {string} month
	 */
	function showMonth(date, month) {
		if (date) {
			date = moment(date).toDate();
		} else {
			date = moment().toDate();
		}
		const $month = box.find('.' + month);
		
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
		for (let i = 0; i < weekNumbers.length; ++i) {
			weekNumbers[i].update();
		}
		opt[month] = date;
		updateSelectableRange();
	}

	function showGap() {
		showSelectedDays();
		if (!gap) {
			return;
		}
		var m1 = parseInt(moment(opt.month1).format('YYYYMM'));
		var m2 = parseInt(moment(opt.month2).format('YYYYMM'));
		var p = Math.abs(m1 - m2);
		var shouldShow = (p > 1 && p !== 89);
		if (shouldShow) {
			gap.show();
		} else {
			gap.hide();
		}
	}
	function showSelectedDays() {
		if (!opt.start && !opt.end) {
			return;
		}
		box.find('.day').each(function() {
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

		for (let i = 0; i < weekNumbers.length; ++i) {
			weekNumbers[i].markStartWeek(opt.startWeek);
		}
	}
};

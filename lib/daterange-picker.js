// TODO remove window access
require('jquery');
const $ = window.jQuery;
require('moment');
const moment = window.moment;

const config = require('./config');
const overrideableFunctions = require('./overrideable-functions');
// Merge overrideable functions into options default
config['option-defaults'].functions = overrideableFunctions;

const templates = require('./templates');
const calendar = require('./calendar');
const utils = require('./utils');
const EventEmitter = require('./event-emitter');

// Not-quite plugins (still considered core features)
const Gap = require('./gap');

// Plugins
const plugins = require('./plugins/plugins');

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
		this.resizeListener = () => this.calcPosition();

		$(window).on('resize.datepicker', this.resizeListener);
		this.eventEmitter.on('datepicker-user-select-complete', () => this.autoclose());

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
			Gap.addToPicker(this);
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
		this.registerMonthButtonListeners();
	}
	
	registerMonthButtonListeners() {
		const box = this.getDom();
		const self = this;
		
		box.find('.next').click(function() {self.showNextMonth(this);});
		box.find('.prev').click(function() {self.showPrevMonth(this);});
		// This adds classes to say whether going to next or previous month is illegal
		this.eventEmitter.on('datepicker-change-month-view', evt => this.checkIllegalMonthMovement(evt.view));
		this.checkIllegalMonthMovement('month1');
		this.checkIllegalMonthMovement('month2');
	}
	
	checkIllegalMonthMovement(view) {
		const opt = this.getOptions();
		const box = this.getDom();
		
		const isMonth2 = view === 'month2';
		const $view = box.find('.' + view);
		const otherView = isMonth2 ? 'month1' : 'month2';
		const $otherView = box.find('.' + otherView);
		
		const m = moment(opt[view]).startOf('month');
		const prevM = m.clone().add(-1, 'M');
		const nextM = m.clone().add(1, 'M');
		
		const setLegal = ($elm, dir) => {
			$elm.removeClass('illegal-' + dir);
			$elm.find('.' + dir).prop('disabled', false);
		};
		const setIllegal = ($elm, dir) => {
			$elm.addClass('illegal-' + dir);
			$elm.find('.' + dir).prop('disabled', true);
		};
		
		$view.removeClass('illegal-prev illegal-next');
		$view.find('.prev,.next').prop('disabled', false);
		if (!opt.singleDate) {
			if (!isMonth2) {
				if (opt.startDate && moment(opt.startDate).startOf('month').isAfter(prevM)) {
					setIllegal($view, 'prev');
				}
				setLegal($otherView, 'prev');
				if (moment(opt.month2).startOf('month').isSame(nextM)) {
					setIllegal($view, 'next');
					setIllegal($otherView, 'prev');
				}
			} else {
				if (opt.endDate && moment(opt.endDate).startOf('month').isBefore(nextM)) {
					setIllegal($view, 'next');
				}
				setLegal($otherView, 'next');
				if (moment(opt.month1).startOf('month').isSame(prevM)) {
					setIllegal($view, 'prev');
					setIllegal($otherView, 'next');
				}
			}
		} else {
			if (opt.startDate && moment(opt.startDate).startOf('month').isAfter(prevM)) {
				setIllegal($view, 'prev');
			}
			if (opt.endDate && moment(opt.endDate).startOf('month').isBefore(nextM)) {
				setIllegal($view, 'next');
			}
		}
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
			let month = isMonth2 ? opt.month2 : opt.month1;
			month = calendar.nextMonth(month);
			if ((
					!opt.singleMonth && 
					!isMonth2 && 
					calendar.compareMonth(month, opt.month2) >= 0
				) ||
				calendar.isMonthOutOfBounds(month, opt.startDate, opt.endDate)
			) {
				return;
			}
			self.showMonth(month, isMonth2 ? 'month2' : 'month1');
		}

		function gotoNextMonthStickily() {
			var nextMonth1 = calendar.nextMonth(opt.month1);
			var nextMonth2 = calendar.nextMonth(opt.month2);
			if (calendar.isMonthOutOfBounds(nextMonth2, opt.startDate, opt.endDate)) {
				return;
			}
			if (!opt.singleDate && calendar.compareMonth(nextMonth1, nextMonth2) >= 0) {
				return;
			}
			self.showMonth(nextMonth1, 'month1');
			self.showMonth(nextMonth2, 'month2');
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
			if ((
					isMonth2 && 
					calendar.compareMonth(month, opt.month1) <= 0
				) || 
				calendar.isMonthOutOfBounds(month, opt.startDate, opt.endDate)
			) {
				return;
			}
			self.showMonth(month, isMonth2 ? 'month2' : 'month1');
		}

		function gotoPrevMonthStickily() {
			var prevMonth1 = calendar.prevMonth(opt.month1);
			var prevMonth2 = calendar.prevMonth(opt.month2);
			if (calendar.isMonthOutOfBounds(prevMonth1, opt.startDate, opt.endDate)) {
				return;
			}
			if (!opt.singleDate && calendar.compareMonth(prevMonth2, prevMonth1) <= 0) {
				return;
			}
			self.showMonth(prevMonth1, 'month1');
			self.showMonth(prevMonth2, 'month2');
		}
	}
	
	normalizeOptions() {
		const opt = this.opt;
		const range = this._getWritableRange();
		// TODO why does this live in opt?
		range.start = false;
		range.end = false;

		opt.startWeek = false;

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
		
		opt.language = utils.normalizeLocale(opt.language);
	}

	calcPosition(evt) {
		if (!this.opt.inline) {
			var positionCss = this.opt.functions.calcPosition(this.box, this.opt, evt);
			this.box.css(positionCss);
		}
	}

	openDatePicker(animationTime, evt) {
		const box = this.box;
		const openEvt = { relatedTarget: box };
		this.calcPosition(evt);
		this.eventEmitter.trigger('datepicker-open', openEvt);
		this.opt.functions.animateOpen(box, animationTime, () => {
			this.eventEmitter.trigger('datepicker-opened', openEvt);
		});
	}

	closeDatePicker() {
		if (this.opt.alwaysOpen) {
			return;
		}
		const box = this.box;
		const closeEvt = { relatedTarget: box };
		this.eventEmitter.trigger('datepicker-close', closeEvt);
		this.opt.functions.animateClose(box, this.opt.duration, () => {
			this.eventEmitter.trigger('datepicker-closed', closeEvt);
		});
	}

	clearEnd() {
		if (!this.getDateRange().start) {
			return;
		}
		this.setDateRange(this.getDateRange().start, false, false, true);
	}
	clearSelection() {
		if (this.opt.singleDate) {
			this.setSingleDate(false, false, true);
		} else {
			this.setDateRange(false, false, false, true);
		}
	}

	dayClicked(day) {
		if (day.hasClass('invalid')) {
			return;
		}
		const opt = this.opt;
		const range = this.getDateRange();
		var time = moment(parseInt(day.attr('time'))).toDate();
		day.addClass('checked');
		let start = false;
		let end = false;
		if (opt.singleDate || (range.start && range.end) || (!range.start && !range.end)) {
			start = time;
		} else if (range.start) {
			start = range.start;
			end = time;
		}

		//Update time in case it is enabled and timestamps are available
		if (opt.time && opt.time.enabled) {
			if (start) {
				start = this.addTimeToDate(opt.startTime, start);
			}
			if (end) {
				end = this.addTimeToDate(opt.endTime, end);
			}
		}

		//In case the start is after the end, swap the timestamps
		if (!opt.singleDate && start && end && start > end) {
			var tmp = end;
			end = start;
			start = tmp;
		}
		if ((opt.singleDate && start) || (start && end)) {
			this.eventEmitter.trigger('datepicker-user-select-complete', this.getDateRange());
		}
		if (opt.singleDate) {
			this.setSingleDate(start, false, true);
		} else {
			this.setDateRange(start, end, false, true);
		}
	}

	updateSelectableRange() {
		const opt = this.opt;
		const range = this.getDateRange();
		this.box.find('.day.invalid.tmp').removeClass('tmp invalid').addClass('valid');
		if (range.start && !range.end) {
			this.box.find('.day.this-month.valid').each(function() {
				var time = parseInt($(this).attr('time'), 10);
				if (!calendar.isValidTime(time, range, opt)) {
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
		const range = this.getDateRange();
		if (opt.autoClose) {
			if (opt.singleDate === true && range.start) {
				this.closeDatePicker();
			} else if (range.start && range.end) {
				this.closeDatePicker();
			}
		}
	}

	/**
	 * This method is called to notify (e.g. trigger events) when the date-picker
	 * state has changed
	 */
	triggerHasChanged() {
		const opt = this.opt;
		const range = this.getDateRange();
		
		// Prevent sending events without change
		if (this._lastChangedRange) {
			if (this._lastChangedRange.start === range.start && this._lastChangedRange.end === range.end) {
				return;
			}
		}
		
		const event = {
			date1: range.start ? new Date(range.start) : null,
			date2: range.end ? new Date(range.end) : null,
			valid: false,
			length: 0
		};

		// Is date range selected? (or just date in singleDate mode)
		if ((range.start && opt.singleDate) || (range.start && range.end) || (!range.start && !range.end)) {
			// Trigger change event
			event.valid = (range.start || range.end) ? true : false; // without ? valid would become a number
			if (range.start && range.end) {
				event.length = calendar.countDays(range.end, range.start);
			}
			this.eventEmitter.trigger('datepicker-change', event);
		} else {
			this.eventEmitter.trigger('datepicker-first-date-selected', {
				'date1': new Date(range.start)
			});
		}
		this._lastChangedRange = {start: range.start, end: range.end};
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
		let start = false;
		let end = false;
		if (date1 || date2) {
			if (typeof date1 === 'number') {
				date1 = moment(date1).toDate();
			}
			if (typeof date2 === 'number') {
				date2 = moment(date2).toDate();
			}
		
			// Swap dates if in wrong order
			if ((date2 && !date1) || (date1 && date2 && date1.valueOf() > date2.valueOf())) {
				var tmp = date2;
				date2 = date1;
				date1 = tmp;
			}
		
			if (
				// Date1 too early?
				(opt.startDate && calendar.compareDay(date1, opt.startDate) < 0) ||
				// Date2 too late?
				(date2 && opt.endDate && calendar.compareDay(date2, opt.endDate) > 0)
			) {
				// Keep previous date range as is and show default view
				if (!keepMonthPositions) {
					this.showMonth(opt.startDate, 'month1');
					this.showMonth(calendar.nextMonth(opt.startDate), 'month2');
				}
				return;
			}
			start = date1.valueOf();
			end = date2 ? date2.valueOf() : false;
		}
		if (opt.singleDate) {
			console.warn('Using setDateRange in single date mode. Consider using setSingleDate instead');
			this.setSingleDate(date1, silent, keepMonthPositions);
			return;
		}
		const range = this._getWritableRange();
		range.start = start;
		range.end = end;
		this.eventEmitter.trigger('datepicker-time-change');
		
		if (!keepMonthPositions) {
			// Now determine what should be displayed now
			if (date2 && (opt.stickyMonths || calendar.compareMonth(date1, date2) === 0)) {
				if (opt.lookBehind) {
					date1 = calendar.prevMonth(date2);
				} else {
					date2 = calendar.nextMonth(date1);
				}
			}
			this.showMonth(date1, 'month1');
			if (date2) {
				this.showMonth(date2, 'month2');
			}
		}
		
		this.showSelectedDays();
		if (!silent) {
			this.triggerHasChanged();
		}
	}

	setSingleDate(date1, silent, keepMonthPositions) {
		const opt = this.opt;
		if (!opt.singleDate) {
			console.warn('setSingleDate should only be used in single date mode');
			this.setDateRange(date1, false, silent, false);
			return;
		}
		let start = false;
		if (date1) {
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
			start = date1.valueOf();
		}
		const range = this._getWritableRange();
		range.start = start;
		range.end = false;
		if (date1 && !keepMonthPositions) {
			this.showMonth(date1, 'month1');
		}

		this.showSelectedDays();
		if (!silent) {
			this.triggerHasChanged();
		}
	}

	/**
	 * 
	 * @param {Date} date
	 * @param {string} view
	 */
	showMonth(date, view) {
		const opt = this.opt;
		if (date) {
			date = moment(date).toDate();
		} else {
			date = moment().toDate();
		}
		const $view = this.box.find('.' + view);
		
		// prevent unnecessary re-render
		const monthId = moment(date).startOf('month').valueOf();
		if ($view.attr('data-time') === '' + monthId) {
			return;
		} else {
			$view.attr('data-time', monthId);
		}
		
		const monthName = moment(date).locale(opt.language).format('MMMM');
		$view.find('.month-name').html(monthName + ' ' + date.getFullYear());
		$view.find('tbody').html(templates.createMonthHTML(date, opt));
		opt[view] = date; // TODO document this
		this.updateSelectableRange();
		this.eventEmitter.trigger('datepicker-change-month-view', {view: view, month: date, $view: $view});
		this.showSelectedDays();
	}
	showSelectedDays() {
		const opt = this.opt;
		const range = this.getDateRange();
		const box = this.box;
		box.find('.first-date-selected').removeClass('first-date-selected');
		box.find('.last-date-selected').removeClass('last-date-selected');
		box.find('.checked').removeClass('checked');
		if (!range.start && !range.end) {
			return;
		}
		box.find('.day').each(function() {
			var time = parseInt($(this).attr('time')),
				start = range.start,
				end = range.end;
			if (opt.time && opt.time.enabled) {
				time = moment(time).startOf('day').valueOf();
				start = moment(start || moment().valueOf()).startOf('day').valueOf();
				end = moment(end || moment().valueOf()).startOf('day').valueOf();
			}
			if (
				(range.start && range.end && end >= time && start <= time) ||
				(range.start && !range.end && moment(start).isSame(moment(time), 'day'))
			) {
				$(this).addClass('checked');
			} else {
				$(this).removeClass('checked');
			}

			//Add first-date-selected class name to the first date selected
			if (range.start && moment(start).format('YYYY-MM-DD') === moment(time).format('YYYY-MM-DD')) {
				$(this).addClass('first-date-selected');
			} else {
				$(this).removeClass('first-date-selected');
			}

			//Add last-date-selected
			if (range.end && moment(end).format('YYYY-MM-DD') === moment(time).format('YYYY-MM-DD')) {
				$(this).addClass('last-date-selected');
			} else {
				$(this).removeClass('last-date-selected');
			}
		});

		this.eventEmitter.trigger('datepicker-show-selected-range', this.getDateRange());
	}
	
	getEventEmitter() {
		return this.eventEmitter;
	}
	
	getOptions() {
		return this.opt;
	}
	getDateRange() {
		return {start: this.opt.start, end: this.opt.end};
	}
	_getWritableRange() {
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
	
	/**
	 * This method is used for looking up strings that are displayed to the user.
	 * The basic implementation only looks into the default locale.
	 * This method will be replaced by the i18n plugin, though, to enable
	 * richer internationalization features.
	 * 
	 * @param {string} s A string identifier to be looked up
	 * @return {string}
	 */
	getString(s) {
		s = s.toLowerCase();
		if (s in config['default-locale']) {
			return config['default-locale'][s];
		} else {
			console.warn('String ' + s + ' not found in default locale');
			return '';
		}
	}
}

module.exports = DaterangePicker;

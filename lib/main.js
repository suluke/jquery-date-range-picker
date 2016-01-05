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

// TODO remove window access
var $ = window.jQuery;
var moment = window.moment;

$.dateRangePickerLanguages = require('./locales');
var i18n = require('./i18n');
var templates = require('./templates');
var calendar = require('./calendar');
var DaytimeRange = require('./daytime-range');

$.fn.dateRangePicker = function(opt) {
	'use strict';

	if (!opt) {
		opt = {};
	}
	var func = {
		getValue: function() {
			return $(this).val();
		},
		setValue: function(s, s1, s2) {
			if (!$(this).attr('readonly') && !$(this).is(':disabled') && s != $(this).val()) {
				$(this).val(s);
			}
		},
		hoveringTooltip: function(days, startTime, hoveringTime) {
			return days > 1 ? days + ' ' + i18n.lang('days', opt.language) : '';
		},
		calcPosition: function(self, box, opt, evt) {
			var offset = $(self).offset();
			if ($(opt.container).css('position') === 'relative') {
				var containerOffset = $(opt.container).offset();
				return {
					top: offset.top - containerOffset.top + $(self).outerHeight() + 4,
					left: offset.left - containerOffset.left
				};
			} else {
				if (offset.left < 460) /* left to right */ {
					return {
						top: offset.top + $(self).outerHeight() + parseInt($('body').css('border-top') || 0, 10),
						left: offset.left
					};
				} else {
					return {
						top: offset.top + $(self).outerHeight() + parseInt($('body').css('border-top') || 0, 10),
						left: offset.left + $(self).width() - box.width() - 16
					};
				}
			}
		},
		registerOpenListeners: function(self, callback) {
			$(self).on('click.datepicker', callback);
		},
		registerCloseListeners: function(self, callback) {
			$(document).on('click.datepicker', function(evt) {
				//If (evt.target !== self && $(self).find(evt.target).length === 0) {
					callback(evt);

				//}
			});
		}
	};
	opt = $.extend(true, {
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
		inline:false,
		container:'body',
		alwaysOpen:false,
		singleDate:false,
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
		swapTime: false,
		showWeekNumbers: false,
		functions: func,
		defaultTime: new Date()
	}, opt);
	func = opt.functions;
	opt.start = false;
	opt.end = false;

	opt.startWeek = false;

	//Detect a touch device
	opt.isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;

	//If it is a touch device, hide hovering tooltip
	if (opt.isTouchDevice) {
		func.hoveringTooltip = false;
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

	var box;
	var initiated = false;
	var self = this;
	var selfDom = this.get(0);
	var domChangeTimer;

	$(this).off('.datepicker');
	const eventChangesOpenStateTag = 'daterangepicker_openStateChange';
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
	func.registerOpenListeners(selfDom, function(evt) {
		var isOpen = box.is(':visible');
		if (!isOpen && !isOpenStateChangedBy(evt)) {
			markAsChangingOpenState(evt);
			open(opt.duration, evt);
		}
	});
	/* If autoClose is enabled, changes to the input field cannot
	 * affect the date display, except if it is set (condradictingly)
	 *  to alwaysOpen */
	if (!opt.autoClose || opt.alwaysOpen) {
		/* TODO automatically pulling current value on change
		 * can introduce all sorts of inconsistencies depending
		 * what the developer does */
		$(this).on('change.datepicker', function(evt) {
			loadDatesExternally();
		}).on('keyup.datepicker', function() {
			try {clearTimeout(domChangeTimer);} catch (e) {}
			domChangeTimer = setTimeout(function() {
				loadDatesExternally();
			}, 2000);
		});
	}

	initDatepicker(self);

	if (opt.alwaysOpen) {
		open(0);
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
		open: open,
		getDatePicker: () => box,
		destroy: function() {
			$(self).off('.datepicker');
			$(self).data('dateRangePicker', '');
			$(self).data('date-picker-opened', null);
			box.remove();
			$(window).off('resize.datepicker', calcPosition);
			$(document).off('click.datepicker', closeDatePicker);
		}
	});

	$(window).on('resize.datepicker', calcPosition);
	
	// TODO find a home for this lonely variable
	let daytimeRange;
	
	return this;

	function initDatepicker(element) {
		if ($(element).data('date-picker-opened')) {
			closeDatePicker();
			return;
		}
		$(element).data('date-picker-opened', true);

		box = templates.createDom(opt).hide();
		box.append('<div class="date-range-length-tip"></div>');
		box.on('mouseleave', '.day', function() {
			box.find('.date-range-length-tip').hide();
		});

		$(opt.container).append(box);

		if (!opt.inline) {
			calcPosition();
		} else {
			box.addClass('inline-wrapper');
		}

		if (opt.alwaysOpen) {
			box.find('.apply-btn').hide();
		}

		var defaultTime = opt.defaultTime;
		if (opt.lookBehind) {
			if (opt.startDate && calendar.compareMonth(defaultTime, opt.startDate) < 0) {
				defaultTime = calendar.nextMonth(moment(opt.startDate).toDate());
			}
			if (opt.endDate && calendar.compareMonth(defaultTime, opt.endDate) > 0) {
				defaultTime = moment(opt.endDate).toDate();
			}

			showMonth(calendar.prevMonth(defaultTime), 'month1');
			showMonth(defaultTime, 'month2');

		} else {
			if (opt.startDate && calendar.compareMonth(defaultTime, opt.startDate) < 0) {
				defaultTime = moment(opt.startDate).toDate();
			}
			if (opt.endDate && calendar.compareMonth(calendar.nextMonth(defaultTime), opt.endDate) > 0) {
				defaultTime = calendar.prevMonth(moment(opt.endDate).toDate());
			}

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
			if ((opt.startDate && opt.endDate) || (opt.start && opt.end)) {
				daytimeRange = new DaytimeRange(box,
					opt,
					invalidate,
					moment(opt.start || opt.startDate).toDate(),
					moment(opt.end || opt.endDate).toDate(),
					opt.language
				);
			} else {
				daytimeRange = new DaytimeRange(box,
					opt,
					invalidate,
					defaultTime,
					defaultTime,
					opt.language
				);
			}
		}

		//ShowSelectedInfo();

		var defaultTopText = '';
		if (opt.singleDate) {
			defaultTopText = i18n.lang('default-single', opt.language);
		} else if (opt.minDays && opt.maxDays) {
			defaultTopText = i18n.lang('default-range', opt.language).replace(/\%d/, opt.minDays).replace(/\%d/, opt.maxDays);
		} else if (opt.minDays) {
			defaultTopText = i18n.lang('default-more', opt.language).replace(/\%d/, opt.minDays);
		} else if (opt.maxDays) {
			defaultTopText = i18n.lang('default-less', opt.language).replace(/\%d/, opt.maxDays);
		} else {
			defaultTopText = i18n.lang('default-default', opt.language);
		}

		box.find('.default-top').html(defaultTopText);
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

		//If user click other place of the webpage, close date range picker window
		func.registerCloseListeners(selfDom, function(evt) {
			if (box.is(':visible') && !isOpenStateChangedBy(evt)) {
				markAsChangingOpenState(evt);
				closeDatePicker(evt);
			}
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
			showMonth(prevMonth2, 'month2');
			showMonth(prevMonth1, 'month1');
			showSelectedDays(opt);
		}

		box.on('click', '.day', function(evt) {
			dayClicked($(this));
		});

		box.on('mouseenter', '.day', function(evt) {
			dayHovering($(this));
		});

		box.on('click', '.week-number', function(evt) {
			weekNumberClicked($(this));
		});

		box.attr('unselectable', 'on')
		.css('user-select', 'none')
		.on('selectstart', function(e) {
			e.preventDefault(); return false;
		});

		box.find('.apply-btn').click(function() {
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

		box.find('[shortcut]').click(function() {
			var shortcut = $(this).attr('shortcut');
			var end = new Date(), start = false;
			var dir;
			if (shortcut.indexOf('day') != -1) {
				var day = parseInt(shortcut.split(',', 2)[1], 10);
				start = new Date(new Date().getTime() + 86400000 * day);
				end = new Date(end.getTime() + 86400000 * (day > 0 ? 1 : -1));
			} else if (shortcut.indexOf('week') != -1) {
				dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;

				var stopDay;
				if (dir === 1) {
					stopDay = opt.startOfWeek === 'monday' ? 1 : 0;
				} else {
					stopDay = opt.startOfWeek === 'monday' ? 0 : 6;
				}

				end = new Date(end.getTime() - 86400000);
				while (end.getDay() != stopDay) {
					end = new Date(end.getTime() + dir * 86400000);
				}
				start = new Date(end.getTime() + dir * 86400000 * 6);
			} else if (shortcut.indexOf('month') != -1) {
				dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;
				if (dir === 1) {
					start = calendar.nextMonth(end);
				} else {
					start = calendar.prevMonth(end);
				}
				start.setDate(1);
				end = calendar.nextMonth(start);
				end.setDate(1);
				end = new Date(end.getTime() - 86400000);
			} else if (shortcut.indexOf('year') != -1) {
				dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;
				start = new Date();
				start.setFullYear(end.getFullYear() + dir);
				start.setMonth(0);
				start.setDate(1);
				end.setFullYear(end.getFullYear() + dir);
				end.setMonth(11);
				end.setDate(31);
			} else if (shortcut === 'custom') {
				var name = $(this).html();
				if (opt.customShortcuts && opt.customShortcuts.length > 0) {
					for (var i = 0; i < opt.customShortcuts.length; i++) {
						var sh = opt.customShortcuts[i];
						if (sh.name === name) {
							var data = sh.dates();
							if (data && data.length === 2) {
								start = data[0];
								end = data[1];
							}

							// If only one date is specified then just move calendars there
							// move calendars to show this date's month and next months
							if (data && data.length === 1) {
								var movetodate = data[0];
								showMonth(movetodate, 'month1');
								showMonth(calendar.nextMonth(movetodate), 'month2');
								showGap(opt);
							}

							break;
						}
					}
				}
			}
			if (start && end) {
				setDateRange(start, end);
				checkSelectionValid();
			}
		});
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

	function open(animationTime, evt) {
		calcPosition(evt);
		loadDatesExternally();
		box.slideDown(animationTime, function() {
			$(self).trigger('datepicker-opened', { relatedTarget: box });
		});
		$(self).trigger('datepicker-open', { relatedTarget: box });
		showGap(opt);
		updateCalendarWidth();
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
					moment(dates[1], opt.format, moment.locale(opt.language)).toDate()
				);
			} else if (dates.length === 1) {
				setSingleDate(moment(dates[0], opt.format, moment.locale(opt.language)).toDate());
			}

			initiated = true;
		} else {
			clearSelection();
		}
	}

	function updateCalendarWidth() {
		var gapMargin = box.find('.gap').css('margin-left');
		if (gapMargin) {
			gapMargin = parseInt(gapMargin);
		}
		var w1 = box.find('.month1').width();
		var w2 = box.find('.gap').width() + (gapMargin ? gapMargin * 2 : 0);
		var w3 = box.find('.month2').width();
		box.find('.month-wrapper').width(w1 + w2 + w3);
	}

	function clearEnd() {
		if (!opt.start) {
			return;
		}
		opt.end = false;
		box.find('.day.checked').removeClass('checked');
		box.find('.day.last-date-selected').removeClass('last-date-selected');

		//StoreDatesExternally();
		checkSelectionValid();
		showSelectedInfo();
		showSelectedDays(opt);
	}
	function clearSelection() {
		opt.start = false;
		opt.end = false;
		box.find('.day.checked').removeClass('checked');
		box.find('.day.last-date-selected').removeClass('last-date-selected');
		box.find('.day.first-date-selected').removeClass('first-date-selected');

		//StoreDatesExternally();
		checkSelectionValid();
		showSelectedInfo();
		showSelectedDays(opt);
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
				DaytimeRange.changeTime(opt, 'end', opt.end);
			}
		}

		//Update time in case it is enabled and timestamps are available
		if (opt.time.enabled) {
			if (opt.start) {
				DaytimeRange.changeTime(opt, 'start', opt.start);
			}
			if (opt.end) {
				DaytimeRange.changeTime(opt, 'end', opt.end);
			}
		}

		//In case the start is after the end, swap the timestamps
		if (!opt.singleDate && opt.start && opt.end && opt.start > opt.end) {
			var tmp = opt.end;
			opt.end = handleEnd(opt.start);
			opt.start = handleStart(tmp);
			if (opt.time.enabled && opt.swapTime) {
				daytimeRange.swapTime(opt.start, opt.end);
			}
		}

		opt.start = parseInt(opt.start);
		opt.end = parseInt(opt.end);

		clearHovering();
		if (opt.start && !opt.end) {
			$(self).trigger('datepicker-first-date-selected', {
				'date1': new Date(opt.start)
			});
			dayHovering(day);
		}
		updateSelectableRange(time);

		checkSelectionValid();
		showSelectedInfo();
		showSelectedDays(opt);
		autoclose();
	}

	function weekNumberClicked(weekNumberDom) {
		var thisTime = parseInt(weekNumberDom.attr('data-start-time'), 10);
		var date1;
		if (!opt.startWeek) {
			opt.startWeek = thisTime;
			weekNumberDom.addClass('week-number-selected');
			date1 = new Date(thisTime);
			opt.start = moment(date1).day(opt.startOfWeek === 'monday' ? 1 : 0).toDate();
			opt.end = moment(date1).day(opt.startOfWeek === 'monday' ? 7 : 6).toDate();
		} else {
			box.find('.week-number-selected').removeClass('week-number-selected');
			date1 = new Date(thisTime < opt.startWeek ? thisTime : opt.startWeek);
			var date2 = new Date(thisTime < opt.startWeek ? opt.startWeek : thisTime);
			opt.startWeek = false;
			opt.start = moment(date1).day(opt.startOfWeek === 'monday' ? 1 : 0).toDate();
			opt.end = moment(date2).day(opt.startOfWeek === 'monday' ? 7 : 6).toDate();
		}
		updateSelectableRange();
		checkSelectionValid();
		showSelectedInfo();
		showSelectedDays(opt);
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

	function dayHovering(day) {
		var hoverTime = parseInt(day.attr('time'));
		var tooltip = null;

		if (day.hasClass('has-tooltip') && day.attr('data-tooltip')) {
			tooltip = '<span style="white-space:nowrap">' + day.attr('data-tooltip') + '</span>';
		} else if (!day.hasClass('invalid')) {
			if (opt.singleDate) {
				box.find('.day.hovering').removeClass('hovering');
				day.addClass('hovering');
			} else {
				box.find('.day').each(function() {
					var time = parseInt($(this).attr('time')),
						start = opt.start,
						end = opt.end;

					if (time === hoverTime) {
						$(this).addClass('hovering');
					} else {
						$(this).removeClass('hovering');
					}

					if (
						(opt.start && !opt.end) &&
						((opt.start < time && hoverTime >= time) ||
							(opt.start > time && hoverTime <= time))
					) {
						$(this).addClass('hovering');
					} else {
						$(this).removeClass('hovering');
					}
				});

				if (opt.start && !opt.end) {
					var days = calendar.countDays(hoverTime, opt.start);
					if (func.hoveringTooltip) {
						if (typeof func.hoveringTooltip === 'function') {
							tooltip = func.hoveringTooltip(days, opt.start, hoverTime);
						} else if (func.hoveringTooltip === true && days > 1) {
							tooltip = days + ' ' + i18n.lang('days', opt.language);
						}
					}
				}
			}
		}

		if (tooltip) {
			var posDay = day.offset();
			var posBox = box.offset();

			var _left = posDay.left - posBox.left;
			var _top = posDay.top - posBox.top;
			_left += day.width() / 2;

			var $tip = box.find('.date-range-length-tip');
			var w = $tip.css({ 'visibility':'hidden', 'display':'none' }).html(tooltip).width();
			var h = $tip.height();
			_left -= w / 2;
			_top -= h;
			setTimeout(function() {
				$tip.css({ left:_left, top:_top, display:'block', 'visibility':'visible' });
			}, 10);
		} else {
			box.find('.date-range-length-tip').hide();
		}
	}

	function clearHovering() {
		box.find('.day.hovering').removeClass('hovering');
		box.find('.date-range-length-tip').hide();
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

		if ((opt.singleDate && opt.start && !opt.end) || (!opt.singleDate && opt.start && opt.end)) {
			box.find('.apply-btn').removeClass('disabled');
		} else {
			box.find('.apply-btn').addClass('disabled');
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
		box.find('.start-day').html('...');
		box.find('.end-day').html('...');
		box.find('.selected-days').hide();
		if (opt.start) {
			var startText = calendar.getDateString(new Date(parseInt(opt.start)), opt.format);
			box.find('.start-day').html(startText);
		}
		if (opt.end) {
			var endText = calendar.getDateString(new Date(parseInt(opt.end)), opt.format);
			box.find('.end-day').html(endText);
		}

		var dateRange;
		if (opt.start && opt.singleDate) {
			box.find('.apply-btn').removeClass('disabled');
			dateRange = calendar.getDateString(new Date(opt.start), opt.format);
			storeDatesExternally();

			if (initiated && !silent) {
				$(self).trigger('datepicker-change', {
					'value': dateRange,
					'date1': new Date(opt.start)
				});
			}
		} else if (opt.start && opt.end) {
			box.find('.selected-days').show().find('.selected-days-num').html(calendar.countDays(opt.end, opt.start));
			box.find('.apply-btn').removeClass('disabled');
			dateRange = calendar.getDateString(new Date(opt.start), opt.format) + opt.separator + calendar.getDateString(new Date(opt.end), opt.format);
			storeDatesExternally();
			if (initiated && !silent) {
				$(self).trigger('datepicker-change', {
					'value': dateRange,
					'date1': new Date(opt.start),
					'date2': new Date(opt.end)
				});
			}
		} else if (forceValid) {
			box.find('.apply-btn').removeClass('disabled');
		} else {
			box.find('.apply-btn').addClass('disabled');
		}
	}

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
			daytimeRange.renderTime('time1', date1);
			daytimeRange.renderTime('time2', date2);
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

	function setSingleDate(date1) {
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
			daytimeRange.renderTime('time1', date1);
		}
		showMonth(date1, 'month1');

		//ShowMonth(date2,'month2');
		showGap(opt);
		showSelectedInfo();
		autoclose();
	}

	function showMonth(date, month) {
		if (date) {
			date = moment(date).toDate();
		} else {
			date = moment().toDate();
		}

		var monthName = i18n.nameMonth(date.getMonth(), opt.language);
		box.find('.' + month + ' .month-name').html(monthName + ' ' + date.getFullYear());
		box.find('.' + month + ' tbody').html(templates.createMonthHTML(date, opt));
		opt[month] = date;
		updateSelectableRange();
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

	function showGap() {
		showSelectedDays();
		var m1 = parseInt(moment(opt.month1).format('YYYYMM'));
		var m2 = parseInt(moment(opt.month2).format('YYYYMM'));
		var p = Math.abs(m1 - m2);
		var shouldShow = (p > 1 && p != 89);
		if (shouldShow) {
			box.addClass('has-gap').removeClass('no-gap').find('.gap').css('visibility', 'visible');
		} else {
			box.removeClass('has-gap').addClass('no-gap').find('.gap').css('visibility', 'hidden');
		}
		var h1 = box.find('table.month1').height();
		var h2 = box.find('table.month2').height();
		box.find('.gap').height(Math.max(h1, h2) + 10);
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

		box.find('.week-number').each(function() {
			if ($(this).attr('data-start-time') === opt.startWeek) {
				$(this).addClass('week-number-selected');
			}
		});
	}
};

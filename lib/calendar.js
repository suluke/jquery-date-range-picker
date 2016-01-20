/**
 * Utilities for dealing with date/time.
 * E.g. formating, navigation in time and validation of intervals.
 *
 */

require('moment');

var moment = window.moment;
var i18n = require('./i18n');

module.exports = {
	isValidTime: function(time, range, opt) {
		time = parseInt(time, 10);
		if (opt.startDate && module.exports.compareDay(time, opt.startDate) < 0) {
			return false;
		}
		if (opt.endDate && module.exports.compareDay(time, opt.endDate) > 0) {
			return false;
		}

		var countDays = module.exports.countDays;
		if (range.start && !range.end && !opt.singleDate) {
			//Check maxDays and minDays setting
			if (opt.maxDays > 0 && countDays(time, range.start) > opt.maxDays) {
				return false;
			}
			if (opt.minDays > 0 && countDays(time, range.start) < opt.minDays) {
				return false;
			}

			//Check selectForward and selectBackward
			if (opt.selectForward && time < range.start) {
				return false;
			}
			if (opt.selectBackward && time > range.start) {
				return false;
			}

			//Check disabled days
			if (opt.beforeShowDay && typeof opt.beforeShowDay === 'function') {
				var valid = true;
				var timeTmp = time;
				while (countDays(timeTmp, range.start) > 1) {
					var arr = opt.beforeShowDay(new Date(timeTmp));
					if (!arr[0]) {
						valid = false;
						break;
					}
					if (Math.abs(timeTmp - range.start) < 86400000) {
						break;
					}
					if (timeTmp > range.start) {
						timeTmp -= 86400000;
					}
					if (timeTmp < range.start) {
						timeTmp += 86400000;
					}
				}
				if (!valid) {
					return false;
				}
			}
		}
		return true;
	},
	daysFrom1970: function(t) {
		return Math.floor(i18n.toLocalTimestamp(t) / 86400000);
	},
	compareMonth: function(m1, m2) {
		var p = parseInt(moment(m1).format('YYYYMM')) - parseInt(moment(m2).format('YYYYMM'));
		if (p > 0) {
			return 1;
		}
		if (p === 0) {
			return 0;
		}
		return -1;
	},

	compareDay: function(m1, m2) {
		var p = parseInt(moment(m1).format('YYYYMMDD')) - parseInt(moment(m2).format('YYYYMMDD'));
		if (p > 0) {
			return 1;
		}
		if (p === 0) {
			return 0;
		}
		return -1;
	},

	nextMonth: function(month) {
		return moment(month).add(1, 'months').toDate();
	},

	prevMonth: function(month) {
		return moment(month).add(-1, 'months').toDate();
	},

	isMonthOutOfBounds: function(month, startDate, endDate) {
		month = moment(month);
		if (startDate && month.endOf('month').isBefore(startDate)) {
			return true;
		}
		if (endDate && month.startOf('month').isAfter(endDate)) {
			return true;
		}
		return false;
	},
	getDateString: function(d, format) {
		return moment(d).format(format);
	},
	countDays: function(start, end) {
		return Math.abs(module.exports.daysFrom1970(start) - module.exports.daysFrom1970(end)) + 1;
	}
};

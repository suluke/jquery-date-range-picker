/**
 * Utilities for dealing with date/time.
 * E.g. formating, navigation in time and validation of intervals.
 *
 */

require('moment');

const moment = window.moment;

const toLocalTimestamp = t => {
	if (moment.isMoment(t) || moment.isDate(t)) {
		t = t.valueOf();
	} else if (typeof t === 'string' && !t.match(/\d{13}/)) {
		// t = moment(t, opt.format).toDate().valueOf();
		throw new Error('Parsing strings in calendar.toLocalTimestamp has been removed');
	}
	t = parseInt(t, 10) - new Date().getTimezoneOffset() * 60 * 1000;
	return t;
};
const daysFrom1970 = t => {
	return Math.floor(toLocalTimestamp(t) / 86400000);
};
/**
 * Compares a place (e.g. day, year, month) of two given dates and returns
 * 1: place of m1 > place of m2, 2: place of m1 < place of m2
 * If both places are equal, this method will fall back on comparing the next higher places.
 * Only if both dates are equal after clamping all places smaller than the specified one, -0 is returned
 */
const compareDatePlaces = (d1, d2, place) => {
	d1 = moment(d1).startOf(place);
	d2 = moment(d2).startOf(place);
	
	if (d1.isSame(d2)) {
		return 0;
	} else {
		return d1.isAfter(d2) ? 1 : -1;
	}
};

module.exports = {
	/**
	 * @param {int} time A timestamp (like in Date.valueOf())
	 * @param {Object} range A date range, i.e. an object with properties 'start' and 'end' (both integer timestamps)
	 * @param {Object} opt The datepicker options object
	 */
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

			//Check disabled days
			// TODO basically, this code is a nice feature to have,
			// but opt.beforeShowDay is simply not the correct place to decide
			// whether there is a reason for a date to block all dates after 
			// a certain point in time
			/*
			if (opt.beforeShowDay && typeof opt.beforeShowDay === 'function') {
				var valid = true;
				var timeTmp = time;
				const dayMilliSeconds = 86400000;
				while (countDays(timeTmp, range.start) > 1) {
					var arr = opt.beforeShowDay(new Date(timeTmp));
					if (!arr[0]) {
						valid = false;
						break;
					}
					if (Math.abs(timeTmp - range.start) < dayMilliSeconds) {
						break;
					}
					if (timeTmp > range.start) {
						timeTmp -= dayMilliSeconds;
					}
					if (timeTmp < range.start) {
						timeTmp += dayMilliSeconds;
					}
				}
				if (!valid) {
					return false;
				}
			}
			*/
		}
		return true;
	},
	compareMonth: (m1, m2) => compareDatePlaces(m1, m2, 'month'),

	/**
	 * @param {Date|moment} m1
	 * @param {Date|moment} m2
	 * @return {int} 0 if days are equal, 1 if m1.day > m2.day, -1 if m1.day < m2.day
	 */
	compareDay: (m1, m2) => compareDatePlaces(m1, m2, 'date'),

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
	countDays: function(start, end) {
		return Math.abs(daysFrom1970(start) - daysFrom1970(end)) + 1;
	}
};

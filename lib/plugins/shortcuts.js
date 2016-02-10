require('jquery');
const $ = window.jQuery;

const calendar = require('../calendar');

class Shortcuts {
	constructor(container, data, customShortcuts, stringProvider, startOfWeek, moveToDate, setDateRange) {
		this.customShortcuts = customShortcuts;
		const html = this.createMarkup(data, customShortcuts, stringProvider);
		this.$dom = $(html);
		container.find('.footer').prepend(this.$dom);
		this.$dom.find('[shortcut]').click(this.createClickListener(startOfWeek, moveToDate, setDateRange));
	}

	createMarkup(data, customShortcuts, stringProvider) {
		let html = '<div class="shortcuts"><b>' + stringProvider('shortcuts') + '</b>';

		if (data) {
			if (data['prev-days'] && data['prev-days'].length > 0) {
				html += '&nbsp;<span class="prev-days">' + stringProvider('past');
				for (let i = 0; i < data['prev-days'].length; i++) {
					let name = data['prev-days'][i];
					name += (data['prev-days'][i] > 1) ? stringProvider('days') : stringProvider('day');
					html += ' <a href="javascript:;" shortcut="day,-' + data['prev-days'][i] + '">' + name + '</a>';
				}
				html += '</span>';
			}

			if (data['next-days'] && data['next-days'].length > 0) {
				html += '&nbsp;<span class="next-days">' + stringProvider('following');
				for (let i = 0; i < data['next-days'].length; i++) {
					let name = data['next-days'][i];
					name += (data['next-days'][i] > 1) ? stringProvider('days') : stringProvider('day');
					html += ' <a href="javascript:;" shortcut="day,' + data['next-days'][i] + '">' + name + '</a>';
				}
				html += '</span>';
			}

			if (data.prev && data.prev.length > 0) {
				html += '&nbsp;<span class="prev-buttons">' + stringProvider('previous');
				for (let i = 0; i < data.prev.length; i++) {
					let name = stringProvider('prev-' + data.prev[i]);
					html += ' <a href="javascript:;" shortcut="prev,' + data.prev[i] + '">' + name + '</a>';
				}
				html += '</span>';
			}

			if (data.next && data.next.length > 0) {
				html += '&nbsp;<span class="next-buttons">' + stringProvider('next');
				for (let i = 0; i < data.next.length; i++) {
					let name = stringProvider('next-' + data.next[i]);
					html += ' <a href="javascript:;" shortcut="next,' + data.next[i] + '">' + name + '</a>';
				}
				html += '</span>';
			}
		}

		if (customShortcuts) {
			for (let i = 0; i < customShortcuts.length; i++) {
				var sh = customShortcuts[i];
				html += '&nbsp;<span class="custom-shortcut"><a href="javascript:;" shortcut="custom">' + sh.name + '</a></span>';
			}
		}
		html += '</div>';
		return html;
	}

	createClickListener(startOfWeek, moveToDate, setDateRange) {
		const self = this;
		const msOfDay = 86400000;

		// This cannot be an arrow function since "this" should be bound
		// to the dom element by jQuery
		const clickListener = function() {
			var shortcut = $(this).attr('shortcut');
			var end = new Date(), start = false;
			var dir;
			if (shortcut.indexOf('day') != -1) {
				var day = parseInt(shortcut.split(',', 2)[1], 10);
				start = new Date(new Date().valueOf() + msOfDay * day);
				end = new Date(end.valueOf() + msOfDay * (day > 0 ? 1 : -1));
			} else if (shortcut.indexOf('week') != -1) {
				dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;

				var stopDay;
				if (dir === 1) {
					stopDay = startOfWeek === 'monday' ? 1 : 0;
				} else {
					stopDay = startOfWeek === 'monday' ? 0 : 6;
				}

				end = new Date(end.valueOf() - msOfDay);
				while (end.getDay() != stopDay) {
					end = new Date(end.valueOf() + dir * msOfDay);
				}
				start = new Date(end.valueOf() + dir * msOfDay * 6);
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
				end = new Date(end.valueOf() - msOfDay);
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
				if (self.customShortcuts && self.customShortcuts.length > 0) {
					for (var i = 0; i < self.customShortcuts.length; i++) {
						var sh = self.customShortcuts[i];
						if (sh.name === name) {
							var data = sh.dates();
							if (data && data.length === 2) {
								start = data[0];
								end = data[1];
							}

							// If only one date is specified then just move calendars there
							// move calendars to show this date's month and next months
							if (data && data.length === 1) {
								moveToDate(data[0]);
							}

							break;
						}
					}
				}
			}
			if (start && end) {
				setDateRange(start, end);
			}
		};
		return clickListener;
	}

	static addToPicker(picker) {
		const opt = picker.getOptions();
		if (!opt.showShortcuts) {
			return;
		}
		new Shortcuts(picker.getDom(), opt.shortcuts, opt.customShortcuts, picker.getString, opt.startOfWeek,
			(date) => {
				picker.showMonth(date, 'month1');
				picker.showMonth(calendar.nextMonth(date), 'month2');
				picker.showGap();
			},
			(start, end) => {
				if (opt.singleDate) {
					picker.setSingleDate(start);
				} else {
					picker.setDateRange(start, end);
				}
			}
		);
	}
	
	static addOptionDefaults(opt) {
		opt.showShortcuts = false;
		opt.shortcuts =	{
			//'prev-days': [1,3,5,7],
			// 'next-days': [3,5,7],
			//'prev' : ['week','month','year'],
			// 'next' : ['week','month','year']
		};
		opt.customShortcuts = [];
	}
}

module.exports = Shortcuts;

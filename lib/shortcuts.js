const i18n = require('./i18n');
const calendar = require('./calendar');

class Shortcuts {
	constructor(container, data, customShortcuts, lang, startOfWeek, moveToDate, setDateRange) {
		this.customShortcuts = customShortcuts;
		const html = this.createMarkup(data, customShortcuts, lang);
		this.$dom = $(html);
		container.find('.footer').prepend(this.$dom);
		this.$dom.find('[shortcut]').click(this.createClickListener(startOfWeek, moveToDate, setDateRange));
	}

	createMarkup(data, customShortcuts, lang) {
		let html = '<div class="shortcuts"><b>' + i18n.lang('shortcuts', lang) + '</b>';

		if (data) {
			if (data['prev-days'] && data['prev-days'].length > 0) {
				html += '&nbsp;<span class="prev-days">' + i18n.lang('past', lang);
				for (let i = 0; i < data['prev-days'].length; i++) {
					let name = data['prev-days'][i];
					name += (data['prev-days'][i] > 1) ? i18n.lang('days', lang) : i18n.lang('day', lang);
					html += ' <a href="javascript:;" shortcut="day,-' + data['prev-days'][i] + '">' + name + '</a>';
				}
				html += '</span>';
			}

			if (data['next-days'] && data['next-days'].length > 0) {
				html += '&nbsp;<span class="next-days">' + i18n.lang('following', lang);
				for (let i = 0; i < data['next-days'].length; i++) {
					let name = data['next-days'][i];
					name += (data['next-days'][i] > 1) ? i18n.lang('days', lang) : i18n.lang('day', lang);
					html += ' <a href="javascript:;" shortcut="day,' + data['next-days'][i] + '">' + name + '</a>';
				}
				html += '</span>';
			}

			if (data.prev && data.prev.length > 0) {
				html += '&nbsp;<span class="prev-buttons">' + i18n.lang('previous', lang);
				for (let i = 0; i < data.prev.length; i++) {
					let name = i18n.lang('prev-' + data.prev[i], lang);
					html += ' <a href="javascript:;" shortcut="prev,' + data.prev[i] + '">' + name + '</a>';
				}
				html += '</span>';
			}

			if (data.next && data.next.length > 0) {
				html += '&nbsp;<span class="next-buttons">' + i18n.lang('next', lang);
				for (let i = 0; i < data.next.length; i++) {
					let name = i18n.lang('next-' + data.next[i], lang);
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

		// This cannot be an arrow function since "this" should be bound
		// to the dom element by jQuery
		const clickListener = function() {
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
					stopDay = startOfWeek === 'monday' ? 1 : 0;
				} else {
					stopDay = startOfWeek === 'monday' ? 0 : 6;
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

	static addToPicker(pickerDom, data, customShortcuts, lang, startOfWeek, moveToDate, setDateRange) {
		new Shortcuts(pickerDom, data, customShortcuts, lang, startOfWeek, moveToDate, setDateRange);
	}
}

module.exports = Shortcuts;

require('moment');
var moment = window.moment;

var i18n = require('./i18n');
var calendar = require('./calendar');

/**
 * A function to determine whether the calendar widget displays two
 * months simultaneously and side by side or whether only one month is
 * displayed at a time.
 */
var showSecondMonth = function(opt) {
	return opt.singleDate || opt.singleMonth;
};
/**
 * Calls the functions in callbacksArray and concatenates the return values.
 * This is used by createMonthHTML to add additional attributes to the
 * generated html.
 */
var attributesCallbacks = function(initialObject, callbacksArray, today) {
	var resultObject = jQuery.extend(true, {}, initialObject);

	jQuery.each(callbacksArray, function(cbAttrIndex, cbAttr) {
		var addAttributes = cbAttr(today);
		for (var attr in addAttributes) {
			if (resultObject.hasOwnProperty(attr)) {
				resultObject[attr] += addAttributes[attr];
			} else {
				resultObject[attr] = addAttributes[attr];
			}
		}
	});

	var attrString = '';

	for (var attr in resultObject) {
		if (resultObject.hasOwnProperty(attr)) {
			attrString += attr + '="' + resultObject[attr] + '" ';
		}
	}

	return attrString;
};

module.exports = {
	getTimeHTML: function(lang) {
		return `<div>
					<span>${i18n.lang('Time', lang)}: <span class="hour-val">00</span>:<span class="minute-val">00</span></span>
				</div>
				<div class="hour">
					<label>${i18n.lang('Hour', lang)}: <input type="range" class="hour-range" name="hour" min="0" max="23"></label>
				</div>
				<div class="minute">
					<label>${i18n.lang('Minute', lang)}: <input type="range" class="minute-range" name="minute" min="0" max="59"></label>
				</div>`;
	},
	createDom: function(opt) {
		var html = '<div class="date-picker-wrapper';
		if (opt.extraClass) {
			html += ' ' + opt.extraClass + ' ';
		}
		if (opt.singleDate) {
			html += ' single-date ';
		}
		if (!opt.showShortcuts) {
			html += ' no-shortcuts ';
		}
		if (!opt.showTopbar) {
			html += ' no-topbar ';
		}
		if (opt.customTopBar) {
			html += ' custom-topbar ';
		}
		html += '">';

		if (opt.showTopbar) {
			html += '<div class="drp_top-bar">';

			if (opt.customTopBar) {
				if (typeof opt.customTopBar == 'function') {
					opt.customTopBar = opt.customTopBar();
				}
				html += '<div class="custom-top">' + opt.customTopBar + '</div>';
			} else {
				html += `<div class="normal-top">
						<span style="color:#333">$
							{i18n.lang('selected', opt.language)}
						</span><b class="start-day">...</b>`;
				if (!opt.singleDate) {
					html += `<span class="separator-day">
						${opt.separator}
					</span>
					<b class="end-day">...</b>
					<i class="selected-days">
						(<span class="selected-days-num">3</span>${i18n.lang('days', opt.language)})
					</i>`;
				}
				html += '</div>';
				html += `<div class="error-top">error</div>
					<div class="default-top">default</div>`;
			}

			html += '<input type="button" ' +
						'class="apply-btn disabled ' + module.exports.getApplyBtnClass(opt.autoClose, opt.applyBtnClass) + '" ' +
						'value="' + i18n.lang('apply', opt.language) + '"' +
					'/>';
			html += '</div>';
		}

		var colspan = opt.showWeekNumbers ? 6 : 5;
		html += `<div class="month-wrapper">
					<table class="month1" cellspacing="0" border="0" cellpadding="0">
						<thead>
							<tr class="caption">
								<th style="width:27px;">
									<span class="prev">&lt;</span>
								</th>
								<th colspan="${colspan}" class="month-name"></th>
								<th style="width:27px;">
									${(opt.singleDate || !opt.stickyMonths ? '<span class="next">&gt;</span>' : '')}
								</th>
							</tr>
							<tr class="week-name">${module.exports.getWeekHead(opt.startOfWeek, opt.showWeekNumbers, opt.language)}</tr>
						</thead>
						<tbody></tbody>
					</table>`;

		if (showSecondMonth(opt)) {
			html += `<div class="gap">
						${module.exports.getGapHTML()}
					</div>
					<table class="month2" cellspacing="0" border="0" cellpadding="0">
						<thead>
							<tr class="caption">
								<th style="width:27px;">
									${(!opt.stickyMonths ? '<span class="prev">&lt;</span>' : '')}
								</th>
								<th colspan="${colspan}" class="month-name"></th>
								<th style="width:27px;">
									<span class="next">&gt;</span>
								</th>
							</tr>
							<tr class="week-name">
								${module.exports.getWeekHead(opt.startOfWeek, opt.showWeekNumbers, opt.language)}
							</tr>
						</thead>
						<tbody></tbody>
					</table>`;
		}

			//+'</div>'
		html +=	'<div style="clear:both;height:0;font-size:0;"></div>' + '<div class="time">' + '<div class="time1"></div>';
		if (!opt.singleDate) {
			html += '<div class="time2"></div>';
		}
		html += '</div>' + '<div style="clear:both;height:0;font-size:0;"></div>' + '</div>';

		html += '<div class="footer">';
		if (opt.showShortcuts) {
			html += '<div class="shortcuts"><b>' + i18n.lang('shortcuts', opt.language) + '</b>';

			var data = opt.shortcuts;
			if (data) {
				if (data['prev-days'] && data['prev-days'].length > 0) {
					html += '&nbsp;<span class="prev-days">' + i18n.lang('past', opt.language);
					for (var i = 0; i < data['prev-days'].length; i++) {
						var name = data['prev-days'][i];
						name += (data['prev-days'][i] > 1) ? i18n.lang('days', opt.language) : i18n.lang('day', opt.language);
						html += ' <a href="javascript:;" shortcut="day,-' + data['prev-days'][i] + '">' + name + '</a>';
					}
					html += '</span>';
				}

				if (data['next-days'] && data['next-days'].length > 0) {
					html += '&nbsp;<span class="next-days">' + i18n.lang('following', opt.language);
					for (var i = 0; i < data['next-days'].length; i++) {
						var name = data['next-days'][i];
						name += (data['next-days'][i] > 1) ? i18n.lang('days', opt.language) : i18n.lang('day', opt.language);
						html += ' <a href="javascript:;" shortcut="day,' + data['next-days'][i] + '">' + name + '</a>';
					}
					html += '</span>';
				}

				if (data.prev && data.prev.length > 0) {
					html += '&nbsp;<span class="prev-buttons">' + i18n.lang('previous', opt.language);
					for (var i = 0; i < data.prev.length; i++) {
						var name = i18n.lang('prev-' + data.prev[i], opt.language);
						html += ' <a href="javascript:;" shortcut="prev,' + data.prev[i] + '">' + name + '</a>';
					}
					html += '</span>';
				}

				if (data.next && data.next.length > 0) {
					html += '&nbsp;<span class="next-buttons">' + i18n.lang('next', opt.language);
					for (var i = 0; i < data.next.length; i++) {
						var name = i18n.lang('next-' + data.next[i], opt.language);
						html += ' <a href="javascript:;" shortcut="next,' + data.next[i] + '">' + name + '</a>';
					}
					html += '</span>';
				}
			}

			if (opt.customShortcuts) {
				for (var i = 0; i < opt.customShortcuts.length; i++) {
					var sh = opt.customShortcuts[i];
					html += '&nbsp;<span class="custom-shortcut"><a href="javascript:;" shortcut="custom">' + sh.name + '</a></span>';
				}
			}
			html += '</div>';
		}

		// Add Custom Values Dom
		if (opt.showCustomValues) {
			html += '<div class="customValues"><b>' + (opt.customValueLabel || i18n.lang('custom-values', opt.language)) + '</b>';

			if (opt.customValues) {
				for (var i = 0; i < opt.customValues.length; i++) {
					var val = opt.customValues[i];
						html += '&nbsp;<span class="custom-value"><a href="javascript:;" custom="' + val.value + '">' + val.name + '</a></span>';
				}
			}
		}

		html += '</div></div>';

		return $(html);
	},
	getWeekHead: function(startOfWeek, showWeekNumbers, lang) {
		var prepend = showWeekNumbers ? '<th>' + i18n.lang('week-number', lang) + '</th>' : '';
		if (startOfWeek == 'monday') {
			return prepend +
				`<th>${i18n.lang('week-1', lang)}</th>
				<th>${i18n.lang('week-2', lang)}</th>
				<th>${i18n.lang('week-3', lang)}</th>
				<th>${i18n.lang('week-4', lang)}</th>
				<th>${i18n.lang('week-5', lang)}</th>
				<th>${i18n.lang('week-6', lang)}</th>
				<th>${i18n.lang('week-7', lang)}</th>`;
		} else {
			return prepend +
				`<th>${i18n.lang('week-7', lang)}</th>
				<th>${i18n.lang('week-1', lang)}</th>
				<th>${i18n.lang('week-2', lang)}</th>
				<th>${i18n.lang('week-3', lang)}</th>
				<th>${i18n.lang('week-4', lang)}</th>
				<th>${i18n.lang('week-5', lang)}</th>
				<th>${i18n.lang('week-6', lang)}</th>`;
		}
	},
	getGapHTML: function() {
		var html = ['<div class="gap-top-mask"></div><div class="gap-bottom-mask"></div><div class="gap-lines">'];
		for (var i = 0; i < 20; i++) {
			html.push(
				`<div class="gap-line">
					<div class="gap-1"></div>
					<div class="gap-2"></div>
					<div class="gap-3"></div>
				</div>`
			);
		}
		html.push('</div>');
		return html.join('');
	},
	createMonthHTML: function(d, opt) {
		var days = [];
		d.setDate(1);
		var lastMonth = new Date(d.getTime() - 86400000);
		var now = new Date();

		var dayOfWeek = d.getDay();
		if ((dayOfWeek == 0) && (opt.startOfWeek == 'monday')) {
			// Add one week
			dayOfWeek = 7;
		}

		if (dayOfWeek > 0) {
			for (var i = dayOfWeek; i > 0; i--) {
				var day = new Date(d.getTime() - 86400000 * i);
				var valid = calendar.isValidTime(day.getTime(), opt);
				if (opt.startDate && calendar.compareDay(day, opt.startDate) < 0) {
					valid = false;
				}
				if (opt.endDate && calendar.compareDay(day, opt.endDate) > 0) {
					valid = false;
				}
				days.push({
					date: day,
					type:'lastMonth',
					day: day.getDate(),
					time:day.getTime(),
					valid:valid
				});
			}
		}
		var toMonth = d.getMonth();
		for (var i = 0; i < 40; i++) {
			var today = moment(d).add(i, 'days').toDate();
			var valid = calendar.isValidTime(today.getTime(), opt);
			if (opt.startDate && calendar.compareDay(today, opt.startDate) < 0) {
				valid = false;
			}
			if (opt.endDate && calendar.compareDay(today, opt.endDate) > 0) {
				valid = false;
			}
			days.push({
				date: today,
				type: today.getMonth() == toMonth ? 'toMonth' : 'nextMonth',
				day: today.getDate(),
				time:today.getTime(),
				valid:valid
			});
		}
		var html = [];
		for (var week = 0; week < 6; week++) {
			if (days[week * 7].type == 'nextMonth') {
				break;
			}
			html.push('<tr>');
			for (var day = 0; day < 7; day++) {
				var _day = (opt.startOfWeek == 'monday') ? day + 1 : day;
				var today = days[week * 7 + _day];
				var highlightToday = moment(today.time).format('L') == moment(now).format('L');
				today.extraClass = '';
				today.tooltip = '';
				if (today.valid && opt.beforeShowDay && typeof opt.beforeShowDay == 'function') {
					var _r = opt.beforeShowDay(moment(today.time).toDate());
					today.valid = _r[0];
					today.extraClass = _r[1] || '';
					today.tooltip = _r[2] || '';
					if (today.tooltip != '') {
						today.extraClass += ' has-tooltip ';
					}
				}

				var todayDivAttr = {
					time: today.time,
					'data-tooltip': today.tooltip,
					'class': 'day ' + today.type + ' ' + today.extraClass +
								' ' + (today.valid ? 'valid' : 'invalid') +
								' ' + (highlightToday ? 'real-today' : '')
				};

				if (day == 0 && opt.showWeekNumbers) {
					html.push(
						`<td>
							<div class="week-number" data-start-time="${today.time}">
								${calendar.getWeekNumber(today.date)}
							</div>
						</td>`
					);
				}

				html.push(
					`<td ${attributesCallbacks({}, opt.dayTdAttrs, today)}>
						<div ${attributesCallbacks(todayDivAttr, opt.dayDivAttrs, today)}>
							${module.exports.renderDayHTML(today.time, today.day, opt)}
						</div>
					</td>`
				);
			}
			html.push('</tr>');
		}
		return html.join('');
	},
	getApplyBtnClass: function(autoClose, extraClass) {
		var klass = '';
		if (autoClose === true) {
			klass += ' hide';
		}
		if (extraClass !== '') {
			klass += ' ' + extraClass;
		}
		return klass;
	},
	renderDayHTML: function(time, date, opt) {
		if (opt.showDateFilter && typeof opt.showDateFilter == 'function') {
			return opt.showDateFilter(time, date);
		}
		return date;
	}
};

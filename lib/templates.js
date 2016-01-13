require('moment');
const moment = window.moment;

const i18n = require('./i18n');
const calendar = require('./calendar');

/**
 * Calls the functions in callbacksArray and concatenates the return values.
 * This is used by createMonthHTML to add additional attributes to the
 * generated html.
 */
const attributesCallbacks = function(initialObject, callbacksArray, today) {
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

const getWeekHead = (startOfWeek, showWeekNumbers, lang) => {
	let html = `<th>${i18n.lang('week-1', lang)}</th>
			<th>${i18n.lang('week-2', lang)}</th>
			<th>${i18n.lang('week-3', lang)}</th>
			<th>${i18n.lang('week-4', lang)}</th>
			<th>${i18n.lang('week-5', lang)}</th>
			<th>${i18n.lang('week-6', lang)}</th>`;
	let week7 = `<th>${i18n.lang('week-7', lang)}</th>`;
	if (startOfWeek == 'monday') {
		return html + week7;
	} else {
		return week7 + html;
	}
};

module.exports = {
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

		var colspan = opt.showWeekNumbers ? 6 : 5;
		html += `<div class="month-wrapper">
					<table class="month1" cellspacing="0" border="0" cellpadding="0">
						<thead>
							<tr class="caption">
								<th style="width:27px;">
									<button type="button" class="prev"></button>
								</th>
								<th colspan="${colspan}" class="month-name"></th>
								<th style="width:27px;">
									${(opt.singleDate || !opt.stickyMonths ? '<button type="button" class="next"></button>' : '')}
								</th>
							</tr>
							<tr class="week-name">${getWeekHead(opt.startOfWeek, opt.showWeekNumbers, opt.language)}</tr>
						</thead>
						<tbody></tbody>
					</table>`;

		if (opt.singleMonth) {
			html += `<div class="gap">
						${module.exports.getGapHTML()}
					</div>
					<table class="month2" cellspacing="0" border="0" cellpadding="0">
						<thead>
							<tr class="caption">
								<th style="width:27px;">
									${(!opt.stickyMonths ? '<button type="button" class="prev"></button>' : '')}
								</th>
								<th colspan="${colspan}" class="month-name"></th>
								<th style="width:27px;">
									<button type="button" class="next"></button>
								</th>
							</tr>
							<tr class="week-name">
								${getWeekHead(opt.startOfWeek, opt.showWeekNumbers, opt.language)}
							</tr>
						</thead>
						<tbody></tbody>
					</table>`;
		}
		html += '<div style="clear:both;height:0;font-size:0;"></div>' + // This is needed to determine height of month-wrapper
				'</div>'; // Month-wrapper ends here

		html += '<div class="footer">';

		// Add Custom Values Dom
		if (opt.showCustomValues) {
			html += '<div class="customValues"><b>' + (opt.customValueLabel || i18n.lang('custom-values', opt.language)) + '</b>';

			if (opt.customValues) {
				for (let i = 0; i < opt.customValues.length; i++) {
					var val = opt.customValues[i];
						html += '&nbsp;<span class="custom-value"><a href="javascript:;" custom="' + val.value + '">' + val.name + '</a></span>';
				}
			}
		}

		html += `	</div>
					<div class="date-range-length-tip"></div>
				</div>`;

		return $(html);
	},
	createMonthHTML: function(d, opt) {
		var days = [];
		d.setDate(1);
		var lastMonth = new Date(d.getTime() - 86400000);
		var now = new Date();

		var dayOfWeek = d.getDay();
		if ((dayOfWeek === 0) && (opt.startOfWeek == 'monday')) {
			// Add one week
			dayOfWeek = 7;
		}

		if (dayOfWeek > 0) {
			for (let i = dayOfWeek; i > 0; i--) {
				let day = new Date(d.getTime() - 86400000 * i);
				let valid = calendar.isValidTime(day.getTime(), opt);
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
		let toMonth = d.getMonth();
		for (let i = 0; i < 40; i++) {
			let today = moment(d).add(i, 'days').toDate();
			let valid = calendar.isValidTime(today.getTime(), opt);
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
				time: today.getTime(),
				valid:valid
			});
		}
		const html = [];
		for (let week = 0; week < 6; week++) {
			if (days[week * 7].type == 'nextMonth') {
				break;
			}
			html.push('<tr>');
			for (let day = 0; day < 7; day++) {
				let _day = (opt.startOfWeek == 'monday') ? day + 1 : day;
				let today = days[week * 7 + _day];
				let highlightToday = moment(today.time).format('L') == moment(now).format('L');
				today.extraClass = '';
				today.tooltip = '';
				if (today.valid && opt.beforeShowDay && typeof opt.beforeShowDay == 'function') {
					let _r = opt.beforeShowDay(moment(today.time).toDate());
					today.valid = _r[0];
					today.extraClass = _r[1] || '';
					today.tooltip = _r[2] || '';
					if (today.tooltip !== '') {
						today.extraClass += ' has-tooltip ';
					}
				}

				let todayDivAttr = {
					time: today.time,
					'data-tooltip': today.tooltip,
					'class': 'day ' + today.type + ' ' + today.extraClass +
								' ' + (today.valid ? 'valid' : 'invalid') +
								' ' + (highlightToday ? 'real-today' : '')
				};

				html.push(
					`<td ${attributesCallbacks({}, opt.dayTdAttrs, today)}>
						<button type="button" ${attributesCallbacks(todayDivAttr, opt.dayDivAttrs, today)}>
							${module.exports.renderDayHTML(today.time, today.day, opt)}
						</button>
					</td>`
				);
			}
			html.push('</tr>');
		}
		return html.join('');
	},
	renderDayHTML: function(time, date, opt) {
		if (opt.showDateFilter && typeof opt.showDateFilter == 'function') {
			return opt.showDateFilter(time, date);
		}
		return date;
	}
};

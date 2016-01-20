require('jquery');
const $ = window.jQuery;

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
	var resultObject = $.extend(true, {}, initialObject);

	$.each(callbacksArray, function(cbAttrIndex, cbAttr) {
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

const createMonthTable = (month, opt) => {
	const hasPrevBtn = month === 1 || !opt.stickyMonths;
	const hasNextBtn = month === 2 || opt.singleDate || !opt.stickyMonths;
	const colspan = opt.showWeekNumbers ? 6 : 5;
	return (
	`<table class="month${month}" cellspacing="0" border="0" cellpadding="0">
		<thead>
			<tr class="caption">
				<th style="width:27px;">
					${hasPrevBtn ? '<button type="button" class="prev"></button>' : ''}
				</th>
				<th colspan="${colspan}" class="month-name"></th>
				<th style="width:27px;">
					${hasNextBtn ? '<button type="button" class="next"></button>' : ''}
				</th>
			</tr>
			<tr class="week-name">
				${getWeekHead(opt.startOfWeek, opt.showWeekNumbers, opt.language)}
			</tr>
		</thead>
		<tbody></tbody>
	</table>`
	);
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
		if (!opt.topBar.enabled) {
			html += ' no-topbar ';
		}
		if (opt.topBar.customText) {
			html += ' custom-topbar ';
		}
		html += '"><div class="month-wrapper">';

		html += createMonthTable(1, opt);
		if (!opt.singleMonth) {
			html += createMonthTable(2, opt);
		}
		
		html += '<div style="clear:both;height:0;font-size:0;"></div>' + // This is needed to determine height of month-wrapper
				'</div>'; // Month-wrapper ends here
		html += '<div class="footer"></div></div>';

		return $(html);
	},
	
	createMonthHTML: function(d, opt) {
		const m = moment(d).startOf('month');
		const thisMonth = m.month();
		const weekStart = opt.startOfWeek === 'monday' ? 1 : 0;
		const end = m.clone().endOf('month');
		if (weekStart) { // monday
			if (end.day() !== 0) {
				end.endOf('week').add(1, 'd');
			}
		} else {
			end.endOf('week');
		}
		end.add(1, 'd');
		const daysFromPrevMonth = (m.day() - weekStart + 7) % 7;
		//const rowsNeeded = Math.ceil((end.clone().subtract(1, 'd').date() + daysFromPrevMonth) / 7);
		// determine the first day to be rendered
		let day = m.clone().subtract(daysFromPrevMonth, 'd');
		let weekday = 0;
		const html = [];
		const types = ['last-month', 'this-month', 'next-month'];
		
		while (day.isBefore(end)) {
			if (weekday === 0) {
				html.push('<tr>');
			}
			let valid = calendar.isValidTime(day.valueOf(), opt, opt);
			let type = types[(day.month() - thisMonth + 13) % 12];
			let highlightToday = day.format('L') === moment().format('L');
			let extraClass = '';
			let tooltip = '';
			
			if (valid && opt.beforeShowDay && typeof opt.beforeShowDay == 'function') {
				let res = opt.beforeShowDay(day.toDate());
				valid = res[0];
				extraClass = res[1] || '';
				tooltip = res[2] || '';
				if (tooltip !== '') {
					extraClass += ' has-tooltip ';
				}
			}
			
			let today = {
				date: day.toDate(),
				type: type,
				day: day.date(),
				time: day.valueOf(),
				valid: valid
			};

			let todayDivAttr = {
				time: today.time,
				'data-tooltip': tooltip,
				'class': 'day ' + type + ' ' + extraClass +
							' ' + (valid ? 'valid' : 'invalid') +
							' ' + (highlightToday ? 'real-today' : ''),
			};

			html.push(
				`<td ${attributesCallbacks({}, opt.dayTdAttrs, today)}>
					<button type="button" ${attributesCallbacks(todayDivAttr, opt.dayDivAttrs, today)} ${valid? '' : 'disabled'}>
						${module.exports.renderDayHTML(today.time, today.day, opt)}
					</button>
				</td>`
			);
			
			
			weekday++;
			if (weekday === 7) {
				weekday = 0;
				html.push('</tr>');
			}
			day.add(1, 'd');
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

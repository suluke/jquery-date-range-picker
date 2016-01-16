require('jquery');
const $ = window.jQuery;

require('moment');
const moment = window.moment;

const i18n = require('./i18n');
const calendar = require('./calendar');

const weekNumberClicked = (box, $weekNumberDom, dateRange, startOfWeek) => {
	var thisTime = parseInt($weekNumberDom.attr('data-start-time'), 10);
	let date1;
	if (!dateRange.startWeek) {
		dateRange.startWeek = thisTime;
		$weekNumberDom.addClass('week-number-selected');
		date1 = new Date(thisTime);
		dateRange.start = moment(date1).day(startOfWeek === 'monday' ? 1 : 0).toDate();
		dateRange.end = moment(date1).day(startOfWeek === 'monday' ? 7 : 6).toDate();
	} else {
		box.find('.week-number-selected').removeClass('week-number-selected');
		date1 = new Date(thisTime < dateRange.startWeek ? thisTime : dateRange.startWeek);
		var date2 = new Date(thisTime < dateRange.startWeek ? dateRange.startWeek : thisTime);
		dateRange.startWeek = false;
		dateRange.start = moment(date1).day(startOfWeek === 'monday' ? 1 : 0).toDate();
		dateRange.end = moment(date2).day(startOfWeek === 'monday' ? 7 : 6).toDate();
	}
};

class WeekNumbers {
	constructor($monthContainer, lang) {
		this.$monthContainer = $monthContainer;
		$monthContainer.find('.week-name').prepend('<th>' + i18n.lang('week-number', lang) + '</th>');
		this.createWeekNumberColumn();
	}

	createWeekNumberColumn() {
		this.$monthContainer.find('tbody tr').each(function() {
			const $this = $(this);
			const startTime = $this.children().first().children().attr('time');
			$this.prepend(
				`<td>
					<div class="week-number" data-start-time="${startTime}">
						${calendar.getWeekNumber(new Date(parseInt(startTime)))}
					</div>
				</td>`
			);
		});
	}

	update() {
		if (this.$monthContainer.find('.week-number').length === 0) {
			this.createWeekNumberColumn();
		}
	}

	markStartWeek(startWeek) {
		this.$monthContainer.find('.week-number').each(function() {
			if ($(this).attr('data-start-time') === startWeek) {
				$(this).addClass('week-number-selected');
			}
		});
	}

	static addToPicker(opt, box, updateSelectableRange, invalidate, autoclose) {
		const instances = [];
		box.find('table[class^="month"]').each(function() {
			const $this = $(this);
			instances.push(new WeekNumbers($this, opt.language));
			$this.on('click', '.week-number', function() {
				weekNumberClicked(box, $(this), opt, opt.startOfWeek);
				updateSelectableRange();
				invalidate();
				autoclose();
			});
		});
		return instances;
	}
}

module.exports = WeekNumbers;

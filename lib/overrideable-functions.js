require('jquery');
const $ = window.jQuery;

const i18n = require('./i18n');

module.exports = {
	hoveringTooltip: function(days, startTime, hoveringTime, lang) {
		return days > 1 ? days + ' ' + i18n.lang('days', lang) : '';
	},
	/*jshint -W098 */
	calcPosition: function(box, opt, evt) {
	/*jshint +W098 */
		return {};
	}
};

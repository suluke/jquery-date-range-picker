require('jquery');
const $ = window.jQuery;

const i18n = require('./i18n');

module.exports = {
	getValue: function() {
		return $(this).val();
	},
	/*jshint -W098 */
	setValue: function(s, s1, s2) {
	/*jshint +W098 */
		if (!$(this).attr('readonly') && !$(this).is(':disabled') && s != $(this).val()) {
			$(this).val(s);
		}
	},
	hoveringTooltip: function(days, startTime, hoveringTime, lang) {
		return days > 1 ? days + ' ' + i18n.lang('days', lang) : '';
	},
	/*jshint -W098 */
	calcPosition: function(self, box, opt, evt) {
	/*jshint +W098 */
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
	}
};

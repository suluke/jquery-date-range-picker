require('jquery');
const $ = window.jQuery;

module.exports = {
	/*jshint -W098 */
	calcPosition: (box, opt, evt) => {
	/*jshint +W098 */
		return {};
	},
	animateOpen: ($pickerDom, animationDuration, onFinished) => {
		$pickerDom.slideDown(animationDuration, onFinished);
	},
	animateClose: ($pickerDom, animationDuration, onFinished) => {
		$pickerDom.slideUp(animationDuration, onFinished);
	}
};

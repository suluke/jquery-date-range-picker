const prefixes = ['', '-o-', '-moz-', '-webkit-', '-ms-'];

module.exports = {
	supportsGradients: () => {
		const attr = 'backgroundImage';
		const test = 'linear-gradient(left top,#9f9, white)';
		const elm = document.createElement('modern');
		for (let i = 0; i < prefixes.length; ++i) {
			elm.style[attr] = prefixes[i] + test;
		}

		// TODO this is probably not necessary
		elm.style[attr] = '-webkit-gradient(linear,left top,right bottom,from(#9f9),to(white))';

		return elm.style[attr].indexOf('gradient') !== -1;
	},
	normalizeLocale: locale => {
		if (locale.toLowerCase() === 'auto') {
			locale = window.navigator.userLanguage || window.navigator.language;
		}
		locale = locale.toLowerCase();
		switch(locale) {
			case 'en-us':
				return 'en';
			// TODO the following code is legacy support and should be removed
			case 'cn':
				return 'zh-cn';
			case 'no':
				return 'nn';
			case 'cz':
				return 'cs';
			default:
				return locale;
		}
	},
	isTouchDevice: () => {
		return 'ontouchstart' in window || navigator.msMaxTouchPoints;
	}
};

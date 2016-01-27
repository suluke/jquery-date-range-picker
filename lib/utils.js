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
	}
};

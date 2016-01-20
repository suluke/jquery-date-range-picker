const plugins = [
	require('./plugins/shortcuts'),
	require('./plugins/daytime-selection'),
	require('./plugins/week-numbers'),
	require('./plugins/double-click-prevent'),
	require('./plugins/unselectable'),
	require('./plugins/draggable-range-bounds'),
	require('./plugins/mousewheel-month-scroll'),
	require('./plugins/easy-open-close-listeners'),
	require('./plugins/top-bar')
];

module.exports = {
	initializeAll(datepicker) {
		for (let i = 0; i < plugins.length; ++i) {
			if (plugins[i].addToPicker) {
				plugins[i].addToPicker(datepicker);
			}
		}
	}
};

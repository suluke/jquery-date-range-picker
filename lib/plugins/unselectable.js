module.exports = {
	addToPicker: box => {
		box.attr('unselectable', 'on')
		.css('user-select', 'none')
		.on('selectstart', function(e) {
			e.preventDefault(); return false;
		});
	}
};

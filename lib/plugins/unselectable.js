module.exports = {
	addToPicker: picker => {
		picker.getDom().attr('unselectable', 'on')
		.css('user-select', 'none')
		.on('selectstart', function(e) {
			e.preventDefault(); return false;
		});
	}
};

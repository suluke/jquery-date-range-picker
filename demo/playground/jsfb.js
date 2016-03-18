/**
 * JSON Schema Form Builder (JSFB)
 */
window.JSFB = function(schema, object, onChange, $container) {
	if (!object) {
		object = {};
	}
	if (!onChange) {
		onChange = function() {};
	}
	if (!$container) {
		$container = $('<form>');
	}
	var nt = normalizeType;
	for (var key in schema) {
		if (!schema.hasOwnProperty(key)) {
			continue;
		}
		var $elm = null;
		if (nt(schema[key]) === nt('bool')) {
			$elm = $('<input type="checkbox">');
			
		} else if (nt(schema[key]) === nt('string')) {
			$elm = $('<input type="text">');
		} else if (nt(schema[key]) === nt('dom')) {
			$elm = $('<input type="text">');
		} else if (nt(schema[key]) === nt('int')) {
			$elm = $('<input type="text">');
		} else if (nt(schema[key]) === nt('date')) {
			$elm = $('<input type="text">');
		} else if (nt(schema[key]) === nt('function')) {
			$elm = $('<textarea>');
		} else if (Array.isArray(schema[key]) && schema.length > 1) {
			$elm = $('<select>');
			for (var i = 0; i < schema[key].length; i++) {
				var text = schema[key][i];
				$elm.append($('<option value="' + text + '">' + text + '</option>'));
			}
		} else if (Array.isArray(schema[key])) {	
			console.warn('TODO: Creating form elements for array-of-type creation not implemented yet');
			continue;
		} else if($.isPlainObject(schema[key])) {
			$elm = $('<fieldset>');
			if (!object[key]) {
				object[key] = {};
			}
			ConfigFormBuilder(schema[key], object[key], onChange, $elm);
		} else {
			console.warn('Cannot handle data type "' + schema[key] + '"');
			$elm = $('<span>TODO</span>');
		}
		
		$elm.data('change-object-key', key);
		$elm.change(function() {
			var val = null;
			if ($(this).is('[type="checkbox"]')) {
				val = $(this).is(':checked');
			} else {
				val = $(this).val();
			}
			object[$(this).data('change-object-key')] = val;
			onChange();
		});
		
		$label = $('<label>' + key + ': </label>');
		$label.append($elm);
		$container.append($label);
		$container.append('<br/>');
	}
	
	return $container;
	
	
	function normalizeType(t) {
		switch(t) {
			case 'boolean':
				return 'bool';
			case 'integer':
				return 'int';
			default:
				return t;
		}
	}
};

var autocompleteCache = {}, searchCache = {}, lastAutocomplete = '', defaultTerm = 'lightning bolt';
$('.term').focus();

$('#go').on('mousedown', function(e) {
	if ($('.term').val().length > 0) {
		doSearch($('.term').val());
	}
});

$('.search .cached').on('focus', function(e) {
	$('.search .term').val($(this).val());
	$('.search .term').focus();
});

$('.search .term').on('keydown', function(e) {
	var self = this;
	switch(e.which) {
		case 9: //tab
			e.preventDefault();
			$(this).val($('.cached').val());
			doAutocomplete($(this).val());
			return;
			break;
		case 13: //enter
			e.preventDefault();
			_doTermSearch();
			return;
			break;
		case 39: //right arrow
			if ($('.cached').val().length != $(this).val().length) {
				$(this).val($('.cached').val());
				doAutocomplete($(this).val());
			}
			return;
			break;
		case 27: //escape
			e.preventDefault();
			$('.term').val('');
			$('.cached').val(defaultTerm);
			return;
			break;
	}

	var char = String.fromCharCode(e.which);
	var alpha = char.search(/[a-zA-Z0-9/]/i) > -1;
	var punctuation = char.search(/[ ,.!"'&#/]/i) > -1;
	var backspace = e.which == 8;
	if (!alpha && !backspace && !punctuation) return; //return if pressed key wasn't backspace or alphanumeric
	$('#legalities').fadeOut();
	if (alpha) char = char.toLowerCase();
	if (char == '7' && e.shiftKey) char = '&';
	if (char == '1' && e.shiftKey) char = '!';
	if (char == '3' && e.shiftKey) char = '#';
	var term = alpha || punctuation ? $(this).val() + char : $(this).val();
	if (backspace) term = term.substring(0, term.length - 1);

	if (term in autocompleteCache) {
		$('.cached').val(autocompleteCache[term]); 
		return;
	}

	if (term.length > 0) {
		var cache = $('.cached').val();
		if (cache.length > term.length) {
			if (cache.substring(term.length-1,term.length) != char) $('.cached').val('');
		}
		doAutocomplete(term);
	} else {
		$('.cached').val('');
	}

	function _doCachedSearch() {
		if ($('.cached').val().length > 0) {
			$(self).val($('.cached').val());
			doSearch($('.cached').val());
		}
	}
	function _doTermSearch() {
		if ($(self).val().length > 0) doSearch($(self).val());
	}
});

function doAutocomplete(q) {
	lastAutocomplete = q;
	$.ajax({
		url: "./php/autocomplete.php",
		data: {
			term: q.toLowerCase()
		}
	}).done(function(data) {
		if (data && data != -1) {
			data = data.toLowerCase();
			autocompleteCache[q] = data;
			if (lastAutocomplete == q) $('.cached').val(data);
		} else if (data && data == -1 || !data) {
			//nope
		}
	});
}

function doSearch(q) {
	if (q in searchCache) {
		searchCallback(searchCache[q]);
	} else {
		$.ajax({
			url: "./php/search.php",
			data: {
				term: q.toLowerCase()
			}
		}).done(searchCallback);
	}

	function searchCallback(data) {
		if (data && data != -1) {
			try {data = JSON.parse(data);}
			catch(e) {}

			searchCache[data.name.toLowerCase()] = data;

			for (var l in data.legalities) {
				if (data.legalities[l]) {
					$('#'+l+' a').attr('title','playable');
					$('#'+l+' span:first-child').removeClass('glyphicon-remove').addClass('glyphicon-ok');
				} else {
					$('#'+l+' a').attr('title','not playable');
					$('#'+l+' span:first-child').removeClass('glyphicon-ok').addClass('glyphicon-remove');
				}
				$('#legalities').fadeIn();
			}
		} else if (data && data == -1 || !data) {
			$('.term').val('');
			$('.cached').val(defaultTerm);
			flicker('.cached');
			$('.term').focus();
		}
	}
}

function flicker(e) {
	$(e).animate({backgroundColor:"#df6868"}, 150, function() {
		$(this).animate({backgroundColor:"#FFF"},300);
	});
}
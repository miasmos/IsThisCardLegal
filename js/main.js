var autocompleteCache = {}, searchCache = {}, lastAutocomplete = '', defaultTerm = 'lightning bolt', lastLegalitiesTop = 0;
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

$('.search .term').on('paste', function(e) {
	var term = $(this).val();
	if (term.length > 0) {
		$('.cached').val(term);
		doAutocomplete(term);
	} else {
		$('.cached').val('');
	}

});

$('.search .term').on('keypress', function(e) {
	var self = this;
	if (e.which == 13) { //enter
		e.preventDefault();
		_doTermSearch();
		return;
	}

	var char = String.fromCharCode(e.which);
	var alpha = char.search(/[a-zA-Z0-9/]/i) > -1;
	var punctuation = char.search(/[ ,.!"'&#/]/i) > -1;
	var backspace = e.which == 8;
	if (!alpha && !backspace && !punctuation) return; //return if pressed key wasn't backspace or alphanumeric
	hideLegalities();
	if (alpha) char = char.toLowerCase();
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
}).on('keydown', function(e) {
	switch(e.which) {
		case 9: //tab
			e.preventDefault();
			$(this).val($('.cached').val());
			doAutocomplete($(this).val());
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
			hideLegalities();
			return;
			break;
		case 8: //backspace
			hideLegalities();
			break;
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
			$('.term').val('');
			$('.cached').val(defaultTerm);
			flicker('.cached');
			$('.term').focus();
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
				switch(data.legalities[l]) {
					case "v":
						ok($('#'+l));
						break;
					case "c":
						ok($('#'+l));
						break;
					case "u":
						ok($('#'+l));
						break;
					case "r":
						restricted($('#'+l));
						break;
					case "g":
						remove($('#'+l));
						break;
					case "b":
						remove($('#'+l));
						break;
					default:
						ok($('#'+l));
						break;
				}
				showLegalities();
			}
		} else if (data && data == -1 || !data) {
			$('.term').val('');
			$('.cached').val(defaultTerm);
			flicker('.cached');
			$('.term').focus();
		}

		function ok(e) {
			cleanClasses(e);
			$(e).find('a').attr('title','legal');
			$(e).find('span:first-child').removeClass('glyphicon-remove').addClass('glyphicon-ok');
		}

		function restricted(e) {
			cleanClasses(e);
			$(e).find('a').attr('title','restricted');
			$(e).find('span:first-child').removeClass('glyphicon-remove').addClass('glyphicon-ok').addClass('glyphicon-restricted');
		}

		function remove(e) {
			cleanClasses(e);
			$(e).find('a').attr('title','banned');
			$(e).find('span:first-child').removeClass('glyphicon-ok').addClass('glyphicon-remove');
		}

		function cleanClasses(e) {
			$(e).removeClass('glyphicon-restricted');
		}
	}
}

function showLegalities() {
	if (!$('#legalities').is(':animated')) {
		lastLegalitiesTop = parseInt($('#legalities').css('margin-top'));
		$('#legalities').css({'margin-top':lastLegalitiesTop-10,'opacity':0,'display':'block'})
			.animate({'margin-top':lastLegalitiesTop}, {duration: 400, queue: false}, 'easeInQuad')
			.animate({'opacity':1}, {duration: 400, queue: false});
	}
}

function hideLegalities() {
	if (!$('#legalities').is(':animated')) {
		lastLegalitiesTop = parseInt($('#legalities').css('margin-top'));
		$('#legalities').animate({'margin-top':lastLegalitiesTop-10,'opacity':0}, 350, 'easeOutCubic', function(){
			$(this).css({'margin-top':lastLegalitiesTop,'display':'none'});
		});
	}
}

function flicker(e) {
	$(e).animate({backgroundColor:"#df6868"}, 150, function() {
		$(this).animate({backgroundColor:"#FFF"},300);
	});
}
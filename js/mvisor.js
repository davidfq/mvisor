var MDV = {
	initGUI: function(){
		this.$app = $('#app-wrapper').first();
		
		this.$app.find('.ui-toggler').click(function(e){
			e.preventDefault();
			$('#' + $(this).data('target')).toggle();
		});
		
		this.$app.delegate('.alert-message .close', 'click', function(e) {
			e.preventDefault();
			$(this).parents('.alert-message').hide();
		});

		this.$app.delegate('.doc .close', 'click', function(e) {
			e.preventDefault();
			$(this).parents('.doc').hide();
		});
		
	},
	
	initFileControl: function() {

		this.$dropArea = $('#droparea');
		this.$fileControl = $('.filecontrol').first();
		this.$fileInput = $('#files');

		this.$app.removeClass('idle').addClass('empty');
		
		// naughty dragleave event fired when reaching textNode inside droparea		
		// quirky: use status var 'overText' when mouse actually enters/leaves
		// textNode inside dropArea
		this.overText = false;
		this.$dropArea.get(0).addEventListener('dragenter', function(e) {

			if (e.target.nodeType === 3) {
				MDV.overText = true;
			} else {
				$(e.target).addClass('dragenter');
				MDV.overText = false;
			}
		},
		false);

		this.$dropArea.get(0).addEventListener('dragleave', function(e) {
			if (e.target.nodeType === 3 && MDV.overText) {
				MDV.overText = false;
			}
			if (!MDV.overText) {
				$(e.target).removeClass('dragenter');
			}
		},
		false);

	},

	loadStarted: function(fileName) {
		MDV.$dropArea.removeClass('dragenter');
		MDV.$fileControl.data('num-files', MDV.$fileControl.data('num-files') + 1).hide();
		MDV.$app.removeClass('empty');
	},

	showFile: function(file) {
		var converter = new Attacklab.showdown.converter(),
			html = converter.makeHtml(file.text),
			$doc = $('<div class="doc markdown"></div>'),
			$content = $('<div class="content"></div>'),
			$meta = $('<p class="meta"></p>');

		if (file.size.match('N/A')) {
			MDV.msg('warning', '<strong>' + file.name + '</strong> is empty');
			return;
		}

		if (html === '') {
			MDV.msg('warning', '<strong>' + file.name + '</strong> looks like has no markdown syntax');
		}

		$meta.html(file.name + ' (' + file.size + ' / ' + file.type + ')' + '<a class="close" href="#">×</a>');
		$content.html(html);
		$doc.append($meta).append($content);
		if ($('.markdown').size() == 0) {
			$('.docs').append($doc);
		} else {
			$('.markdown').first().before($doc);
		}
	},

	msg: function(type, text) {
		var $a = $('#app').first(), html = [];
		html.push('<div class="alert-message ');
		html.push(type);
		html.push('"">');
		if (type !== 'error') {
			html.push('<a class="close" href="#">×</a>');
		}
		html.push(text);
		html.push('</p></div>');
		$a.prepend(html.join(''));
	}

};

$(document).ready(function() {
	
	MDV.initGUI();
	
	if (!FileApiHelper.isAvailable) {
		MDV.msg('error', 'OH! MY! your browser does not support File Api');
		return;
	}
	
	MDV.initFileControl();

	FileApiHelper.init({
		dropArea: 'droparea',
		fileInput: 'files',
		loadCompletedHandler: MDV.showFile,
		loadStartedHandler: MDV.loadStarted
	});
	
	// tricks for prevent default browser behavior when files
	// are dropped outside the dropArea
	MDV.$app.height((window.outerHeight - 100) + 'px');
	$(document.body).bind("dragover", function(e) {
		e.preventDefault();
		return false;
  });
  $(document.body).bind("drop", function(e){
		e.preventDefault();
		return false;
   });
});

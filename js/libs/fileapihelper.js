//
//  fileapihelper.js -- Little helper for reading text files using the HTML5 File Api
//
//  author: @davidfq  
//  version: 0.0.2
//  usage: 
//
//    FileApiHelper.init({ 
//		    dropArea : 'drop-area', // identifier for element where files are dropped
//		    fileInput : 'files', // identifier for input[type=file] 
//		    loadCompletedHandler : function(fileData){
//        console.log(fileData.name);
//        console.log(fileData.size);
//        console.log(fileData.text);
//      },
//      loadStartedHandler : function(fileName){
//        console.log(fileName);
//      }
//    });
//
var FileApiHelper = (function() {
	var dropArea, fileInput, multiple, loadCompletedHandler, loadStartedHandler, errorHandler, files,

	available = !!(window.File && window.FileList && window.FileReader),

	init = function(opts) {

		// feature detection, check for the various File API support
		if (!available) {
			return;
		}

		var settings = opts || {};
		dropArea = document.getElementById(settings.dropArea) || null;
		fileInput = document.getElementById(settings.fileInput) || null;

		// allow multiple file selection by default
		multiple = typeof settings.multiple !== 'undefined' ? settings.multiple : true;
		loadCompletedHandler = settings.loadCompletedHandler || null;
		loadStartedHandler = settings.loadStartedHandler || null;
		errorHandler = settings.errorHandler || null;

		// assign event handlers
		if (dropArea) {
			// the ondragover event needs to be canceled in Google Chrome
			// and Safari to allow firing the ondrop event.
			dropArea.addEventListener('dragover', function(e) {
				e.stopPropagation();
				e.preventDefault();
			},
			false);

			dropArea.addEventListener('drop', handleFileSelect, false);
		}
		if (fileInput) {
			fileInput.addEventListener('change', handleFileSelect, false);
		}
	},

	handleFileSelect = function(e) {
		e.stopPropagation();
		e.preventDefault();
		files = typeof e.dataTransfer !== 'undefined' ? e.dataTransfer.files : e.target.files;

		if (files.length > 1 && !multiple) {
			console.log('Multiple file selection is not allowed');
			return;
		}

		loadFiles();
	},

	loadFiles = function() {
		if (files.length == 0) {
			return;
		}
		// loop through the FileList and attach handlers  
		for (var i = 0, f; f = files[i]; i++) {
			var reader = new FileReader();
			reader.file = f;
			reader.onerror = function(e) {
				if (errorHandler) {
					errorHandler.call(this, e.target.error);
				} else {
					console.log(e.target.error);
				}
			};
			reader.onloadstart = function(e) {
				if (loadStartedHandler) {
					loadStartedHandler.call(this, e.currentTarget.file.fileName);
				} else {
					console.log('loading > ' + e.currentTarget.file.fileName);
				}
			};
			reader.onload = function(e) {
				var file = this.file,
					fileData = {
					text: e.target.result,
					name: file.fileName,
					size: formatFileSize(file.fileSize),
					type: resolveFileType(file.type)
				};

				if (loadCompletedHandler) {
					loadCompletedHandler.call(this, fileData);
				} else {
					console.log('loaded > ' + fileData.name);
				}

			};
			reader.readAsText(f, 'UTF-8');
		}
	},

	getFiles = function() {
		return files;
	},

	setFiles = function(files) {
		files = files;
	},

	formatFileSize = function(size) {
		if (!size || typeof(size) === 'undefined' || isNaN(size)) {
			return 'N/A';
		}
		if (size > 1048576) {
			return Math.round(size / 1048576, 1) + " MB";
		}
		if (size > 1024) {
			return Math.round(size / 1024, 1) + " KB";
		}
		return size + " b";
	},

	resolveFileType = function(type) {
		if (!type || typeof type === 'undefined') {
			return 'unknown format';
		}
		return type;
	};

	return {
		isAvailable: available,
		init: init,
		getFiles: getFiles,
		setFiles: setFiles,
		loadFiles: loadFiles
	};
} ());

(function(){

	var inputFile = document.querySelector('input[type="file"]');
	inputFile.addEventListener('change', onChangeHandler);
	var dropArea = document.querySelector('#drop_zone');
	dropArea.addEventListener('drop', onChangeHandler);
	dropArea.addEventListener('dragover', function (evt) {
		evt.preventDefault();
	});
	dropArea.addEventListener('dragend', function (evt) {
		evt.preventDefault();
	});

	function onChangeHandler(evt){
		evt.preventDefault();
		
		var files = (evt.dataTransfer && evt.dataTransfer.files) || evt.target.files;
		console.log(files);

		updateFileView( files );
		
	}

	function updateFileView( _files ){
		
		var fileList = document.querySelector('#file_list');
		fileList.innerHTML = '';

		for (var file=0; file<_files.length; file++){
			var item = new FileItem( _files[file], fileList );
		}
	}

	// FileItem Class/function
	function FileItem( _file, fileList ){

		// FileItem Element
		var li = document.createElement('li');
		li.innerHTML = _file.name + ' (' + getBytesWithUnit( _file.size, true, 2, true ) + ')';

		// progress Element
		var progressEl = document.createElement('div');
		progressEl.className = 'progress';
		progressEl.style.width = "0%";
		
		li.appendChild(progressEl); 

		// appendo to filelist <ul>
		fileList.appendChild(li);

		// Create Worker for appened file
		// And crete worker communication channel
		var worker = new Worker('/js/worker/fileReader.js');
		worker.addEventListener('message', onWorkerMessage );
		worker.addEventListener('error', onWorkerError );
		worker.postMessage({ type: 'file', data: _file })

		function onWorkerError(err){
			console.log(err);
			worker.terminate();
		}

		function onWorkerMessage(e){
			var data = e.data;
			switch (data.cmd) {
				case 'loadStart':
					//console.log('loadStart',data.data);
					break;
				case 'loadEnd':
					//console.log('loadEnd',data.data);
					break;
				case 'progress':
					//console.log('progress',data.data);
					progressEl.innerHTML = data.data.percent+"%";
					progressEl.style.width = data.data.percent+"%";
					break;
				case 'complete':
					li.classList.add('complete');
					//console.log('complete',data.data);
					break;
				
				default:
					// statements_def
					break;
			}
		}

		return {
			"el" : li
		};
	}

	// # http://bateru.com/news/2012/03/code-of-the-day-converts-bytes-to-unit/
	// other ways to do:
	// - http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
	
	// function: getBytesWithUnit
	// input: bytes (number)
	// input: useSI (boolean), if true then uses SI standard (1KB = 1000bytes), otherwise uses IEC (1KiB = 1024 bytes)
	// input: precision (number), sets the maximum length of decimal places.
	// input: useSISuffix (boolean), if true forces the suffix to be in SI standard. Useful if you want 1KB = 1024 bytes
	// returns (string), represents bytes is the most simplified form.
	var getBytesWithUnit = function (bytes, useSI, precision, useSISuffix) {
		"use strict";
		if (!(!isNaN(bytes) && +bytes > -1 && isFinite(bytes))) {
			return false;
		}
		var units, obj,	amountOfUnits, unitSelected, suffix;
		units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		obj = {
			base : useSI ? 10 : 2,
			unitDegreeDiff : useSI ? 3 : 10
		};
		amountOfUnits = Math.max(0, Math.floor(Math.round(Math.log(+bytes) / Math.log(obj.base) * 1e6) / 1e6));
		unitSelected = Math.floor(amountOfUnits / obj.unitDegreeDiff);
		unitSelected = units.length > unitSelected ? unitSelected : units.length - 1;
		suffix = (useSI || useSISuffix) ? units[unitSelected] : units[unitSelected].replace('B', 'iB');
		bytes = +bytes / Math.pow(obj.base, obj.unitDegreeDiff * unitSelected);
		precision = precision || 3;
		if (bytes.toString().length > bytes.toFixed(precision).toString().length) {
			bytes = bytes.toFixed(precision);
		}
		return bytes + " " + suffix;
	};

})();
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
		li.innerHTML = _file.name + ' (' + getReadableFileSizeString( _file.size ) + ')';

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

	function getReadableFileSizeString(fileSizeInBytes) {

	    var i = -1;
	    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
	    do {
	        fileSizeInBytes = fileSizeInBytes / 1024;
	        i++;
	    } while (fileSizeInBytes > 1024);

	    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
	};

})();
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

	function FileItem( _file, fileList ){

		var li = document.createElement('li');
		li.innerHTML = _file.name;

		var progressEl = document.createElement('div');
		progressEl.className = 'progress';
		progressEl.style.width = "0%";
		
		li.appendChild(progressEl); 
		
		fileList.appendChild(li);
		
		var worker = new Worker('/js/worker/fileReader.js');
		worker.addEventListener('message', onWorkerMessage.bind(worker) );
		worker.addEventListener('error', onWorkerError.bind(worker) );
		worker.postMessage({ type: 'file', data: _file })

		function onWorkerError(err){
			console.log(err);
			this.terminate();
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

})();
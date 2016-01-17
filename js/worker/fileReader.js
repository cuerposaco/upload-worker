self.addEventListener('message', onMessageHandler);

function onMessageHandler(evt){
	var data = evt.data;
	if( actions[ data.type ]){
		actions[ data.type ].call( this, data.data);
	}
}

var actions = {
	"file" : onFileSlice
}

// @funtion onFileSlice
// onFileSlice - create slice parts from file to send async or 
// whatever to do with this parts of the file
function onFileSlice(data){
	var file = data;
	
	var CHUNK_SIZE = 1024*1024; // 1MB
	var TOTAL_SIZE = file.size;

	var start = 0;
	var end = start + CHUNK_SIZE;

	// async process
	processRecursive(function complete() {
		self.postMessage({ 
			cmd: 'complete', 
			data: {
				"start":start,
				"end": end,
				"size": file.size
			} 
		});

		self.close();
	});
	return;

	function processRecursive( cb ){
		//console.log('recursive');
		if( start < TOTAL_SIZE ){
			var chunk = file.slice( start, end );
			sendChunk( chunk, start, TOTAL_SIZE, function(){
				// Send Message
				self.postMessage({ 
					cmd: 'progress', 
					data: {
						"chunk" : chunk,
						"loaded" : start,
						"total" : TOTAL_SIZE,
						"percent" : Math.round((start / TOTAL_SIZE) * 100)
					} 
				});

				//Update chunk data
				start = end;
				end = start + CHUNK_SIZE;
				// prevent bytes overflow
				if (end > TOTAL_SIZE) { end = TOTAL_SIZE; }
				// process next chunk
				processRecursive( cb );	
			} );
		} else {
			//Success
			cb();
		}
	}

	// @function sendChunk
	// Async Simulation
	function sendChunk(_chunk,_start,_total, _cb){
		setTimeout(_cb, Math.random()*100+10);
	}

	// sync process
	while( start < TOTAL_SIZE ){
		
		var chunk = file.slice( start, end );
		
		process( chunk, start, TOTAL_SIZE );

		start = end;
		end = start + CHUNK_SIZE;
		// prevent bytes overflow
		if (end > TOTAL_SIZE) { end = TOTAL_SIZE; }
	}

	self.postMessage({ 
		cmd: 'complete', 
		data: {
			"start":start,
			"end": end,
			"size": file.size
		} 
	});

	self.close();

}

function process( chunk, start, total ){
	self.postMessage({ 
		cmd: 'progress', 
		data: {
			"chunk" : chunk,
			"loaded" : start,
			"total" : total,
			"percent" : Math.round((start / total) * 100)
		} 
	});

}

// @funtion onFileRead
// Filereader function

function onFileRead (data) { 
	var file = data[0];
	console.log( file );
	var reader = new FileReader();
	//reader.onloadstart = function( evt ){ self.postMessage({ cmd: 'onLoadStart', data: evt }) };
	//reader.onloadend = function( evt ){ self.postMessage({ cmd: 'loadEnd', data: evt }) };
	
	reader.onprogress = function( evt ){ 
		self.postMessage({ 
			cmd: 'progress', 
			data: { 
				"loaded": evt.loaded, 
				"total": evt.total
			} 
		}) 
	};
	
	reader.onload = function( evt ){ 
		self.postMessage({ 
			cmd: 'complete', 
			data: evt.target.result 
		}) 
	};
	
	reader.readAsArrayBuffer( file ); 
}
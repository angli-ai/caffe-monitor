var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();

function readMultipleFiles(file) {
	//Retrieve all the files from the FileList object
	//var files = evt.target.files; 

	if (file) {
		var r = new FileReader();
		r.onload = function(f) {
			return function(e) {
				var contents = e.target.result;
				console.log(contents);
				alert( "Got the file.n" 
					+"name: " + f.name + "n"
					+"type: " + f.type + "n"
					+"size: " + f.size + " bytesn"
					+ "starts with: " + contents.substr(1, contents.indexOf("n"))
					); 
			};
		};

		r.readAsText(file);
	} else {
		alert("Failed to load files"); 
	}
}

function parseCaffeLog(textdata) {
	var lines = textdata.split("\n");
	var re = /\S* ([0-9.:]+) .* Iteration ([0-9]+), (\w+) = ([.0-9]+)/;
	var output = "";
	var datatable = {
		"loss": [],
		"lr": []
	};
	for (var i in lines) {
		var res = lines[i].match(re);
		if (res) {
			var match = re.exec(lines[i]);
			output += match[1] + ", " + match[2] + ", " + match[3] + ": " + match[4] + "\n";
			var iter = match[2];
			var datatype = match[3];
			
			var obj = {
				"time": match[1],
				"iter": parseInt(iter),
				"value": parseFloat(match[4])
			};
			datatable[datatype][iter] = obj;
		}
	}
	console.log("datatable:", datatable);
	return datatable;
}

function getFigData(data, datatype) {
	var obj = data[datatype];
	var X = [];
	var Y = [];
	for (var i in obj) {
		X.push(obj[i].iter);
		Y.push(obj[i].value);
	}
	console.log(X);
	console.log(Y);
	var data = [{
		x: X,
		y: Y
	}];
	var layout = {
		title: "Loss vs. Iteration",
		xaxis: {
			title: "Iteration",
			titlefont: {
			}
		},
		yaxis: {
			title: "Loss",
			titlefont: {
			}
		}
	};
	return {
		data: data,
		layout: layout
	};
}

var current_files = null;
var interval = 60000; // 1 minute.
var timer = setInterval(function() {updateFigures()}, interval);

function updateFigures() {
	if (!current_files) {
		return;
	}
	var files = current_files;
	var output = document.getElementById("result");

	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		console.log(file);


		var picReader = new FileReader();

		picReader.onload = function(event) {

			var textFile = event.target;
			var out = parseCaffeLog(textFile.result);

		//	var div = document.createElement("div");
			var fig = getFigData(out, "loss");
			Plotly.newPlot(output, fig.data, fig.layout);

			//div.innerText = out;

			//output.insertBefore(div, null);
			var newDate = new Date();
			document.getElementById("console").innerHTML = newDate.toLocaleString();

		};

		//Read the text file
		picReader.readAsText(file);
	}
}

window.onload = function() {

    //Check File API support
    if (window.File && window.FileList && window.FileReader) {
        var filesInput = document.getElementById("files");

        filesInput.addEventListener("change", function(event) {
            current_files = event.target.files; //FileList object
			updateFigures();
        });
    }
    else {
        console.log("Your browser does not support File API");
    }
}

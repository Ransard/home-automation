
	var margin = [20,20,20,20],
	    width = 1000 - margin[1] - margin[3],
	    height = 400 - margin[0] - margin[2];

	var color = d3.scale.category10();



function DrawGraph(data) {

	var svg = d3.select("body").append("svg:svg")
		.attr("width", width + margin[1] + margin[3])
		.attr("height", height + margin[0] + margin[2])
		.append("svg:g")
		.attr("transform","translate(" + margin[3] + "," + margin[0] + ")");

	color.domain(d3.keys(d3Item[0]).filter(function (key) { return key == "deviceId";  }));


	data = d3.nest().key(function(d) { return d.deviceId; }).entries(data);

	console.log(data);

	var min  = d3.min(data, function(d) { return d3.min(d.values, function(d) { return d.value }) });
	var max  = d3.max(data, function(d) { return d3.max(d.values, function(d) { return d.value }) });


	console.log(min + " " + max);

	var y = d3.scale.linear().domain([d3.min(data, function(d) { return d3.min(d.values, function(d) { return parseInt(d.value) - 10; }) }),
					d3.max(data, function(d){ return d3.max(d.values, function(d) { return parseInt(d.value); }) })])
				.range([height,0]);


	var x = d3.scale.linear().domain([d3.min(data, function(d) { return d3.min(d.values, function(d) { return d.timestamp; }) }),
					d3.max(data, function(d){ return d3.max(d.values, function(d){ return d.timestamp; }) })])
				.range([0,width]);


	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var line = d3.svg.line()
		.interpolate("basis")
		.x(function(d){ return x(d.timestamp);})
		.y(function(d) {return y(d.value);})



		if(data == null)
			return;

	var devices = svg.selectAll("path")
		.data(data, function(d){ return d.key; })
		.enter().append("g")
		.attr("class","device");

	devices.append("path")
		.attr("class","line")
		.attr("d", function(d) { return line(d.values); } )
		.style("stroke", function(d){ return color(d.key); })
}

function UpdateGraph(data) {
	return;
	console.log("updating");

	var x = d3.scale.linear().domain([0, d3Item.length]).range([0,width]);
	var y = d3.scale.linear().domain([5, 25]).range([height,0])

		var line = d3.svg.line()
		.x(function(d,i){
			return x(i);
		})
	.y(function(d) {
		return y(d.value);
	})




	var svg = d3.select("body").transition();
	
	svg.select(".line")
	       .duration(750)
       		.attr("d", line(data));	       
}

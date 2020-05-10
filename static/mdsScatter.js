function getMax(arr, prop) {
    var max;
    for (var i = 0; i < arr.length; i++) {
        if (max == null || parseInt(arr[i][prop]) > parseInt(max))
            max = arr[i][prop];
    }
    return max;
}

function getMin(arr, prop) {
    var min;
    for (var i = 0; i < arr.length; i++) {
        if (min == null || parseInt(arr[i][prop]) < parseInt(min))
            min = arr[i][prop];
    }
    return min;
}

function drawMDSscatter(type) {
    d3.json("/get_mds/" + type,
        function(d) {

            d_mds_orig = (JSON.parse(d.mds_orig));
            d_mds_random = (JSON.parse(d.mds_random));
            d_mds_stratified = (JSON.parse(d.mds_stratified));

            var leftMargin = 10;
            var rightMargin = 10;
            var topMargin = 40;
            var bottomMargin = 40;
            var height = 500;
            var width = 700;

            // x axis scale
            var widthScale = d3.scaleLinear()
                .domain([Math.round(getMin(d_mds_orig, "dim0")) - 1, Math.round(getMax(d_mds_orig, "dim0")) - 2])
                .range([0, width - leftMargin - rightMargin]);

            if (type == 'correlation')
                widthScale.domain([-1.5, 1.5]);

            // y axis scale
            var heightScale = d3.scaleLinear()
                .domain([Math.round(getMin(d_mds_orig, "dim1")) - 1, Math.round(getMax(d_mds_orig, "dim1"))])
                .range([height - topMargin - bottomMargin, 0]);

            if (type == 'correlation')
                heightScale.domain([-1.5, 1.5]);

            var colorScale = ["red", "blue", "green"];

            // color scale
            var color = d3.scaleLinear()
                .domain([0, 100])
                .range(["red", "blue"]);

            // x axis
            var x_axis = d3.axisBottom(widthScale)
                .ticks(10)
                .tickSize(10);

            // x axis
            var y_axis = d3.axisLeft(heightScale)
                .ticks(10)
                .tickSize(10);

            // container for svg graph
            var container = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("style", "margin-left:20em;margin-right:20em;margin-top:2em")
                //.attr("class","screeplotSvg")
                .attr("viewBox", "-50 0 " + width + " " + height);


            var canvas = container.append("g")
                .attr("transform", "translate(" + leftMargin + "," + topMargin + ")");

            canvas.append("g")
                .attr("transform", "translate(0," + (height - topMargin - bottomMargin) + ")")
                .call(x_axis);

            // add the y Axis
            canvas.append("g")
                .call(y_axis);

            // x axis label
            canvas.append("text")
                .attr("transform", "translate(" + (width - leftMargin - rightMargin) + " ," + (height - topMargin) + ")")
                .attr("dx", "-25.6em")
                .attr("dy", "-0.6em")
                .style("text-anchor", "end")
                .text("Dimension 1");

            // y axis label
            canvas.append("text")
                .attr("transform", "translate(" + (-5 * leftMargin) + " ," + 0 + ")" + " rotate(-90)")
                .attr("dx", "-15.7em")
                .attr("dy", "1.0em")
                .style("text-anchor", "end")
                .text("Dimension 2");

            canvas.append('g')
                .selectAll("dot")
                .data(d_mds_orig)
                .enter()
                .append("circle")
                .attr("class", "scatter_o")
                .attr("cx", function(d) {
                    return widthScale(d["dim0"]);
                })
                .attr("cy", function(d) {
                    return heightScale(d["dim1"]);
                })
                .attr("r", 4)
                .attr("opacity", "0")
                .style("fill", function(d) {
                    return colorScale[d["clusterNo"]];
                });


            canvas.selectAll(".scatter_o")
                .transition()
                .duration(50)
                .attr("opacity", function(d, i) {
                    return 1;
                })
                .delay(function(d, i) {
                    return (i)
                });

            canvas.append('g')
                .selectAll("dot")
                .data(d_mds_random)
                .enter()
                .append("circle")
                .attr("class", "scatter_r")
                .attr("cx", function(d) {
                    return widthScale(d["dim0"]);
                })
                .attr("cy", function(d) {
                    return heightScale(d["dim1"]);
                })
                .attr("r", 4)
                //.attr("visibility","hidden")
                .attr("opacity", "0")
                .style("fill", function(d) {
                    return colorScale[d["clusterNo"]];
                });

            canvas.append('g')
                .selectAll("dot")
                .data(d_mds_stratified)
                .enter()
                .append("circle")
                .attr("class", "scatter_s")
                .attr("cx", function(d) {
                    return widthScale(d["dim0"]);
                })
                .attr("cy", function(d) {
                    return heightScale(d["dim1"]);
                })
                .attr("r", 4)
                .attr("opacity", "0")
                // .attr("visibility","hidden")
                .style("fill", function(d) {
                    return colorScale[d["clusterNo"]];
                });

        });
}
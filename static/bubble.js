var myColor1= [d3.scaleLinear().domain([0,10]).range(["white","teal"]), d3.scaleLinear().domain([0,10]).range(["#FF7F7F", "#FF7F7F"])];

var myColor = d3.scaleLinear().domain([0,10]).range(["white","teal"]);
var diameter = 600;
var width1= 420, height1 = 250;
var bubble_global_data=[]

var svg_bubble = null;

    var pack = d3.pack()
        .size([width1, height1])
        .padding(1.5);


function getItemScore(item){
    var score=0;
    if(scoreFeatures.length==0)
        score = 0;
    else{
			score = 0;
				for(var j=0;j<scoreFeatures.length;j++)
				{
				    if(scoreFeatures[j]=="SalePrice"){
				        score += (1- item[scoreFeatures[j]])/scoreFeatures.length;
				    } else{
				        score += item[scoreFeatures[j]]/scoreFeatures.length;
				    }
				}
			}
	return score;
}

function getBubbleData(data){
	for (var i=0;i<data.length;i++)
	{
	    if(data[i].Neighborhood1 ==null || data[i].Neighborhood1<1){
	        continue;
	    }
	}
	var result=[]
	var mean=[]
	groupData = groupBy(data,'Neighborhood1');
    var min = Number.MAX_VALUE;
	var max = 0;

	for(i in groupData)
	{
		if(i>=0)
		{
		 sp = groupData[i].reduce((accum,item) => accum + getItemScore(item), 0)/groupData[i].length;
		 mean[i] = sp;
		 if(sp > max){
		    max = sp;
		 }
		 if(sp<min){
		    min = sp;
		 }
		}
	}

	for(i in mean)
	{
		if(i>=0 &&  !isNaN(mean[i]))
		{
		    value = mean[i];
		    if(max!= min){
		        value = (mean[i] - min) / (max - min);
		    }
		    meanSalePrice = groupData[i].reduce((accum,item) => accum + item.SalePrice1, 0)/groupData[i].length;
		    meanOverallQual = groupData[i].reduce((accum,item) => accum + item.OverallQual1, 0)/groupData[i].length;

		    result.push({Name: groupData[i][0]['NeighborhoodText'], Count:groupData[i].length, Scale:value, MeanSalePrice:meanSalePrice,
		     MeanOverallQual:meanOverallQual});
		}
	}
	return result;
}




function bubble_test(){
    d3.json("/get_mds/euclidean", function(data) {
        bubble_global_data = JSON.parse(data.mds_orig);
        data = getBubbleData(bubble_global_data.slice());
        drawBubbleGraph(data);
    });
}

function updateBubbleGraph(data){
    drawBubbleGraphUtil(data);
}

function drawBubbleGraph(data){
    svg_bubble = d3.select("#bubble-div").append("svg").attr("width", width1).attr("height", height1);
    drawBubbleGraphUtil(data);
}

function drawBubbleGraphUtil(classes) {
if(svg_bubble != null){
      var t = d3.transition()
          .duration(100);

      // hierarchy
      var h = d3.hierarchy({children: classes})
          .sum(function(d) { return d.Count; });

      //JOIN
      var circle = svg_bubble.selectAll("circle")
          .data(pack(h).leaves(), function(d){ return d.data.Name; });



      var text = svg_bubble.selectAll("text")
				.style("pointer-events" ,"none")
          .data(pack(h).leaves(), function(d){ return d.data.Name; });

      //EXIT
      circle.exit().style("fill", function(d) {
         return myColor(d.data.Scale*10);
            })
        .transition(t)
          .remove();

      text.exit()
        .transition(t)
          .remove();

      //UPDATE
      circle
        .transition(t)
		.duration(400)
          .style("fill", function(d) {
         return myColor(d.data.Scale*10);
            })
          .attr("r", function(d){
          return d.r })
          .attr("cx", function(d){ return d.x; })
          .attr("cy", function(d){ return d.y; })
		  
		  

      text
		  .transition(t)
		  .duration(400)
          .attr("x", function(d){if(selectedNeigh!=null) return d.x-120; else return d.x-25; })
		  .attr("font-size", function(d){ return (d.r/2>30?15:d.r/2)+"px";})
          .attr("y", function(d){ return d.y; })
		  .text(function(d){if(selectedNeigh!=null)  return "Mean SalePrice in " + d.data.Name+" "+(d.data.MeanSalePrice/1000).toFixed(2)+"k"; else return d.data.Name;})
		  ;

      //ENTER
      circle.enter().append("circle")
          //.attr("r", 1e-6)
		  .style("cursor","pointer")
          .attr("id", function(d){

            return d.data.Name;})
          .attr("cx", function(d){
          return d.x; })
          .attr("cy", function(d){ return d.y; })
          .style("fill", "#fff").on('click', d => {
            if(selectedNeigh == null){
                selectedNeigh = d.data.Name;
            }else{
                selectedNeigh = null;
            }
              updateDcm();
              applyFilters();
              updateBubble();
              updateLineData();
            })
        .transition(t)
          .style("fill", function(d) {
         return myColor(d.data.Scale*10);
            })
          .attr("r", function(d){ return d.r});

      text.enter().append("text")
		 .attr("fill", "black")
          .attr("x", function(d){ return d.x-20; })
          .attr("y", function(d){ return d.y; })
		  .style("cursor","pointer")
          .attr("font-family", "sans-serif")
          .attr("font-size", function(d){ return (d.r/2>30?30:d.r/2)+"px";})
		  .text(function(d){ return d.data.Name; })
		  .on('click', d => {
            if(selectedNeigh == null){
                selectedNeigh = d.data.Name;
            }else{
                selectedNeigh = null;
            }
              updateDcm();
              applyFilters();
              updateBubble();
              updateLineData();
            })
			  .transition(t)
          .attr("opacity", 1);
		  
}

}
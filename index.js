function main() {
  var width = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    ),
    height = Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );

  const svgWidth = 800; //width;
  const svgHeight = 400; //height;
  const svgPaddingLeft = 80;
  const svgPaddingRight = 80;
  const svgPaddingBottom = 80;
  const svgPaddingTop = 30;

  const colorDoping = ["hsl(120,50%,50%)", "hsl(10,50%,50%)"];
const circleRadius = 7;

  var svg = d3
    .select("#main")
    .append("svg")
    .attr("id","svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    let svgPositionWindow = document.getElementById("svg").getBoundingClientRect();

  d3.queue()
    .defer(d3.json, "cyclist-data.json")
    .await(function (error, data) {
      if (error) {
        console.error("Oh dear, something went wrong: " + error);
      } else {
        drawScatterplot(data);
      }
    });

  //defining function avec callback (drawMap)
  function drawScatterplot(data) {
const epoch = new Date(0);
    data.forEach(d => {
        let tp = new Date(0);
        tp.setMinutes(d.Time.slice(0,2));
        tp.setSeconds(d.Time.slice(3,5));
        d.Time = tp;
        let tp2 = new Date(0) 
        tp2.setFullYear(d.Year);
        d.Year = tp2;
    }); 
console.log(data)
    // scales
    const dataYear_min = d3.min(data, (d) => d.Year);
    const dataYear_max = d3.max(data, (d) => d.Year);
    const dataYear_minPadding = new Date(dataYear_min.getFullYear() - 1,0)
    const dataYear_maxPadding = new Date(dataYear_max.getFullYear() + 1,0)

    var scaleYear = d3.scaleTime()
    //   .domain([dataYear_min - Math.floor(dataYear_min*0.001), dataYear_max + Math.floor(dataYear_max*0.001)])
      .domain([ dataYear_minPadding, dataYear_maxPadding])
      .range([svgPaddingLeft, svgWidth - svgPaddingRight]);

    const dataTime_min = d3.min(data, (d) => (d.Time - epoch)/1000);
    const dataTime_max = d3.max(data, (d) => (d.Time - epoch)/1000);
    var scaleTime = d3.scaleTime()
      .domain([dataTime_min - dataTime_min*0.002, dataTime_max + dataTime_max*0.002])
      .range([svgPaddingTop, svgHeight - svgPaddingBottom]);

    svg
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => scaleYear(d.Year))
      .attr("cy", (d) => scaleTime((d.Time-epoch)/1000))
      .attr("r", circleRadius)
      .attr("fill", (d)=> d.Doping == "" ? colorDoping[0] : colorDoping[1])
      .attr("index", (d, i) => i)
      .attr("class","dot")
      .attr("data-xvalue",(d) => d.Year)
      .attr("data-yvalue",(d) => d.Time)


    // ------------  AXIS  ------------
    // const formatDate = d3.timeFormat("%Y");
    var axisOrigin = [svgPaddingLeft, svgPaddingBottom];
    // var xAxis = d3.axisBottom(scaleYear)
    //     // .tickValues(data.map(d => d.Year))
    //     // .tickFormat(formatDate);

    // svg.append("g")
    // .attr("transform", "translate(0," + (svgHeight-axisOrigin[1])  + ")")
    // // .attr("transform", `translate(0,${height})`)
    // .call(xAxis);

    svg // X axis (id, class and positioning)
      .append("g")
      .call(d3.axisBottom(scaleYear))
      .attr("id", "x-axis")
      .attr("class", "tick")
      .attr("transform", "translate(0," + (svgHeight-axisOrigin[1])  + ")");

    const formatDate = d3.timeFormat("%b");
    var yAxis = d3.axisLeft(scaleTime)
        // .tickValues(data.map(d => d.Time - epoch))
        .tickFormat(d=>Math.floor(d/60) +":"+ Math.floor(d%60/10)+Math.floor(d%60%10));

    svg // Y axis (id, class and positioning)
      .append("g")
      .attr("transform", "translate(" + axisOrigin[0] + ",0)")
      .call(yAxis)
      .attr("id", "y-axis")
      .attr("class", "tick")
      
        // ------------  LABELS  ------------
        svg // X label (text, id and class)
        .append("text")
        .text("Date [years]")
        .attr("id", "xlabel")
        .attr("class", "label");
      svg // X label (positioning)
        .select("#xlabel")
        .attr("text-anchor", "middle")
        .attr("x", svgWidth * 0.5)
        .attr("y", svgHeight - svgPaddingBottom * 0.4);
      svg // Y label (text, id and class)
        .append("text")
        .text("Time [min:sec]")
        .attr("id", "ylabel")
        .attr("class", "label");
      svg // Y label (positioning)
        .select("#ylabel")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -svgHeight * 0.5)
        .attr("y", 20);
  

        //legend
        const legWidth = 18+"rem";
        const legHeight = 40;
        const legX = svgWidth - 300;
        const legY0 = 2;
        const legDx = 10;
        const legDy = 3;

    var legend = d3
    .select("body")
    .append("svg")
      .attr("id", "legend")
      .attr("class", "legend")
      .attr("width", legWidth)
      .attr("height", legHeight * 2 + legY0*2)

      legend.selectAll("circle")
      .data(colorDoping)
      .enter()
      .append("circle")
      .attr("cx", 10)
      .attr("cy",(d,i)=>legHeight*0.5 + legHeight * i)
      .attr("r", circleRadius)
      .attr("fill", d=>d)

      legend.selectAll("text")
      .data(colorDoping)
      .enter()
      .append("text")
      .attr("x", 20)
      .attr("y",(d,i)=>legHeight*0.5 + 2 + legHeight * i)
      .text((d,i)=> i== 0 ? "No doping allegations" : "Riders with doping allegations")
      .attr("dominant-baseline", "middle")
      .attr("class", "legendText")



// tooltip
svg // tooltip appearance on mouse bar hovering
.selectAll("circle")
.on("mouseover", function () {
  var i = this.getAttribute("index");

  d3.select("#tooltip") // adding text to appear in the tooltip.++ add data as props.  ++  positioning tooltip
    .html("<strong>"+data[i].Time.getMinutes() +"'" +Math.floor(data[i].Time.getSeconds()/10)+Math.floor(data[i].Time.getSeconds()%10) +"''</strong>  (" + data[i].Year.getFullYear()+", <em>"+data[i].Name+"</em>)")
    .attr("data-year", data[i].Year)
    .attr("data-time", data[i].Time)
    .style("left", scaleYear(data[i].Year) + svgPositionWindow.left*1.1  + "px")
    .style("bottom", - scaleTime((data[i].Time-epoch)/1000) + svgPositionWindow.bottom*1.03  + "px");
  d3.select("#tooltip").transition().duration(200).style("opacity", 0.9);
});

svg // tooltip desappearance on mouse bar leaving hovering
.selectAll("circle")
.on("mouseout", function () {
  d3.select("#tooltip").transition().duration(200).style("opacity", 0);
});




  }
}


function convertTimeIntoSeconds(x) {
    return parseInt(x.Time.slice(0,2))*60+parseInt(x.Time.slice(3,5))
}
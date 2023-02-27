class Scatterplot {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      // Configuration object with defaults
      // Important: depending on your vis and the type of interactivity you need
      // you might want to use getter and setter methods for individual attributes
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 600,
        containerHeight: _config.containerHeight || 250,
        margin: _config.margin || {top: 50, right: 20, bottom: 50, left: 120}
      }
      this.data = _data;
      this.initVis();
    }
    
    /**
     * This function contains all the code that gets excecuted only once at the beginning.
     * (can be also part of the class constructor)
     * We initialize scales/axes and append static elements, such as axis titles.
     * If we want to implement a responsive visualization, we would move the size
     * specifications to the updateVis() function.
     */
    initVis() {
      // We recommend avoiding simply using the this keyword within complex class code
      // involving SVG elements because the scope of this will change and it will cause
      // undesirable side-effects. Instead, we recommend creating another variable at
      // the start of each function to store the this-accessor
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      // You need to adjust the margin config depending on the types of axis tick labels
      // and the position of axis titles (margin convetion: https://bl.ocks.org/mbostock/3019563)
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Initialize scales
      vis.colorScale = d3.scaleOrdinal().range(["black","#83B692", "#fb8500", "#D64933", "#7A9CC6", "#8D6A9F", "#858585"])
          .domain(["S","A", "F", "G", "K", "M" ]);
  
      vis.xScale = d3.scaleLog()
        .range([0, vis.width]);
  
      vis.yScale = d3.scaleLog()
          .range([vis.height, 0]).nice();
  
      // Initialize axes
      vis.xAxis = d3.axisBottom(vis.xScale)
          .ticks(6)
          .tickSize(-vis.height - 10)
          .tickPadding(10)
          .tickFormat((d,i) => i === 0 ? "Unknown" : i % 4 === 0 ? d3.format(".1e")(d) : "");
  
      vis.yAxis = d3.axisLeft(vis.yScale)
          .ticks(6)
          .tickSize(-vis.width - 10)
          .tickPadding(10);
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
      
      // Append y-axis group
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');

      vis.chart.append("text")
          .attr("class", "title")
          .attr("text-anchor", "middle")
          .attr("x",vis. width/2)
          .attr("y", -20)
          .text("Mass vs Radius");

      vis.chart.append("text")
        .attr("class", "xlabel")
        .attr("text-anchor", "middle")
        .attr("x",vis. width/2)
        .attr("y", vis.height + 40)
        .text("Earth Radius");

    vis.chart.append("text")
      .attr('class', 'ylabel')
      .text("Earth Mass")
      .attr('transform', 'rotate(-90)')
      .attr('x', -((vis.height + vis.config.margin.top + vis.config.margin.bottom ) / 2))
      .attr('y', -40) // Relative to the y axis.
    }
  
    /**
     * This function contains all the code to prepare the data before we render it.
     * In some cases, you may not need this function but when you create more complex visualizations
     * you will probably want to organize your code in multiple functions.
     */
    updateVis() {
      let vis = this;
      
      // Specificy accessor functions
      vis.colorValue = d => d.st_spectype.charAt(0);
      vis.xValue = d => d.pl_rade > 0 ? d.pl_rade : 0.1;
      vis.yValue = d => d.pl_bmasse > 0 ? d.pl_bmasse : 0.1;
  
      // Set the scale input domains
      console.log(d3.min(vis.data, d => d.pl_rade))
      vis.xScale.domain([0.1, d3.max(vis.data, vis.xValue)]);
      vis.yScale.domain([0.01, d3.max(vis.data, vis.yValue)]);
  
      vis.renderVis();
    }
  
    /**
     * This function contains the D3 code for binding data to visual elements.
     * We call this function every time the data or configurations change.
     */
    renderVis() {
      let vis = this;

      // create tooltip element  
      const tooltip = d3.select("body")
      .append("div")
      .attr("class","d3-tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("padding", "15px")
      .style("background", "rgba(0,0,0,0.6)")
      .style("border-radius", "5px")
      .style("width", "100px")
      .style("font-size", "12px")
      .style("position", "absolute")
      .style("color", "#fff");

      // Add a clipPath: everything out of this area won't be drawn.
      // var clip = Svg.append("defs").append("svg:clipPath")
      // .attr("id", "clip")
      // .append("svg:rect")
      // .attr("width", vis.config.containerWidth )
      // .attr("height", vis.config.containerHeight - vis.config.margin.bottom )
      // .attr("x", vis.config.margin.left)
      // .attr("y", vis.config.margin.top -10);

      // Add brushing
      // d3.select(vis.config.parentElement)
      //   .call( d3.brush()                     // Add the brush feature using the d3.brush function
      //     .extent( [ [vis.config.margin.left,vis.config.margin.top -10], [vis.config.containerWidth,vis.config.containerHeight - vis.config.margin.bottom] ] )
      //     // .extent( [ [0,0], [vis.config.containerWidth,vis.config.containerHeight] ] )
      //     .on("start brush", function({selection}) {updateChart(selection)}) // Each time the brush selection changes, trigger the 'updateChart' function
      // )
  
      // Add circles
      vis.circles = vis.chart.selectAll('.point')
          .data(vis.data)
          .enter()
        .append('circle')
          .attr('class', 'point')
          .attr('r', 4)
          .attr('cy', d => vis.yScale(vis.yValue(d)))
          .attr('cx', d => vis.xScale(vis.xValue(d)))
          .attr('fill', d => vis.colorScale(vis.colorValue(d)))
          .on("mouseover", function(d, i) {
            tooltip.html(`<div>Name: ${i.pl_name}</div>
            <div>Mass: ${i.pl_bmasse}</div>
            <div>Radius: ${i.pl_rade}</div>`).style("visibility", "visible");
          })
          .on("mousemove", function(){
            tooltip
              .style("top", (event.pageY-10)+"px")
              .style("left",(event.pageX+10)+"px");
          })
          .on("mouseout", function() {
            tooltip.html(``).style("visibility", "hidden");
            d3.select(this).attr("fill", d => vis.colorScale(vis.colorValue(d)));
          })
          .on("click", function(d){if(d.target.__data__.st_spectype !== "S") {detailClick(d.target.__data__, "scatter")}});
      
      // Update the axes/gridlines
      // We use the second .call() to remove the axis and just show gridlines
      vis.xAxisG
          .call(vis.xAxis)
          .call(g => g.select('.domain').remove());
  
      vis.yAxisG
          .call(vis.yAxis)
          .call(g => g.select('.domain').remove())

      // Function that is triggered when brushing is performed
      function updateChart(selection) {

        // Get the selection coordinate
        // extent = d3.event.selection   // looks like [ [12,11], [132,178]]
        vis.circles.classed("selectedBrush", function(d){return isBrushed(selection, vis.xScale(vis.xValue(d)), vis.yScale(vis.yValue(d)) ) } )

      }
      // A function that return TRUE or FALSE according if a dot is in the selection or not
      function isBrushed(brush_coords, cx, cy) {
        var x0 = brush_coords[0][0] - vis.config.margin.left,
            x1 = brush_coords[1][0] - vis.config.margin.left,
            y0 = brush_coords[0][1] - vis.config.margin.bottom,
            y1 = brush_coords[1][1] - vis.config.margin.top;
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
      }
    }
  }
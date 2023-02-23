class Histogram {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _map, _xLabel, _lMar) {
      // Configuration object with defaults
      // Important: depending on your vis and the type of interactivity you need
      // you might want to use getter and setter methods for individual attributes
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 550,
        containerHeight: _config.containerHeight || 250,
        margin: _config.margin || {top: 20, right: 30, bottom: 50, left: 80}
      }
      this.data = _data;
      this.num_map = _map;
      this.xLabel = _xLabel
  
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

      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      // You need to adjust the margin config depending on the types of axis tick labels
      // and the position of axis titles (margin convetion: https://bl.ocks.org/mbostock/3019563)
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right,
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
    
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

      vis.xScale = d3.scaleLinear()
        .domain([0, d3.max(vis.num_map, d => d)])
        .range([0, vis.width]);

      vis.xAxisG = vis.chart.append("g")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(d3.axisBottom(vis.xScale));

      // set the parameters for the histogram
      vis.histogram = d3.histogram()
          .value(d => d)   // I need to give the vector of value
          .domain(vis.xScale.domain())  // then the domain of the graphic
          .thresholds(vis.xScale.ticks(70)); // then the numbers of bins

        // And apply this function to data to get the bins
        vis.bins = vis.histogram(vis.num_map);

        // Y axis: scale and draw:
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
            // vis.yScale.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)

        vis.yAxis = d3.axisLeft(vis.yScale)
        
        vis.yAxisG = vis.chart.append("g")
            .call(d3.axisLeft(vis.yScale));
        
        vis.chart.append('text')
          .attr('class', 'title')
          .attr('x', vis.width / 2)
          .attr('y', vis.config.margin.top / 40)
          .attr('text-anchor', 'middle')
          .text("Distance from Earth");

        vis.chart.append("text")
          .attr("class", "xlabel")
          .attr("text-anchor", "middle")
          .attr("x",vis. width/2)
          .attr("y", vis.height + 40)
          .text("Distance (pc)");

        vis.chart.append("text")
          .attr('class', 'ylabel')
          .text("Exoplanents")
          .attr('transform', 'rotate(-90)')
          .attr('x', -((vis.height + vis.config.margin.top + vis.config.margin.bottom + 50) / 2))
          .attr('y', -40) // Relative to the y axis.
    }
  
    /**
     * This function contains all the code to prepare the data before we render it.
     * In some cases, you may not need this function but when you create more complex visualizations
     * you will probably want to organize your code in multiple functions.
     */
    updateVis() {
      let vis = this;

      // And apply this function to data to get the bins
      vis.bins = vis.histogram(vis.num_map);
      vis.yScale.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);
      vis.xScale.domain([0, d3.max(vis.num_map, d => d)]);
  
      vis.renderVis();
    }
  
    /**
     * This function contains the D3 code for binding data to visual elements.
     * We call this function every time the data or configurations change 
     * (i.e., user selects a different year)
     */
    renderVis() {
      let vis = this;

      // create tooltip element  
      const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "15px")
        .style("background", "rgba(0,0,0,0.6)")
        .style("border-radius", "5px")
        .style("width", "100px")
        .style("font-size", "12px")
        .style("color", "#fff");

      // Add rectangles
      vis.bars = vis.chart.selectAll("rect")
        .data(vis.bins)
        .enter()
      .append("rect")
        .attr("x", 1)
        .attr("class", "hist-bar")
        .attr("transform", function(d) { return "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")"; })
        .attr("width", function(d) { return vis.xScale(d.x1) - vis.xScale(d.x0) ; })
        .attr("height", function(d) { return vis.height - vis.yScale(d.length); })
        .style("fill", "#525252")
        .on("mouseover", function(d, i) {
          tooltip.html(`<b>${i.length}</b> exoplanets are between <b>${Math.min(...i)}</b> and <b>${Math.max(...i)}</b> parsecs from earth`).style("visibility", "visible");
          // d3.select(this)
          //   .attr("fill", "steelblue");
        })
        .on("mousemove", function(){
          tooltip
            .style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function() {
          tooltip.html(``).style("visibility", "hidden");
          d3.select(this).attr("fill", "#525252");
        });
        // .style("fill", "steelblue")

        // Update the axes because the underlying scales might have changed
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
  }
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
        margin: _config.margin || {top: 10, right: 30, bottom: 20, left: 100}
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
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - 30;

      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
    
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

      vis.xScale = d3.scaleLinear()
        .domain([0, d3.max(vis.num_map, d => d)])     // can use this instead of 1000 to have the max of data: )
        .range([0, vis.width]);

      vis.xAxisG = vis.chart.append("g")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(d3.axisBottom(vis.xScale));

        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(d => d)   // I need to give the vector of value
            .domain(vis.xScale.domain())  // then the domain of the graphic
            .thresholds(vis.xScale.ticks(70)); // then the numbers of bins

        // And apply this function to data to get the bins
        vis.bins = histogram(vis.num_map);

        // Y axis: scale and draw:
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);
            vis.yScale.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
        
        vis.yAxisG = vis.chart.append("g")
            .call(d3.axisLeft(vis.yScale));
  
      
    }
  
    /**
     * This function contains all the code to prepare the data before we render it.
     * In some cases, you may not need this function but when you create more complex visualizations
     * you will probably want to organize your code in multiple functions.
     */
    updateVis() {
      let vis = this;
  
      vis.renderVis();
    }
  
    /**
     * This function contains the D3 code for binding data to visual elements.
     * We call this function every time the data or configurations change 
     * (i.e., user selects a different year)
     */
    renderVis() {
      let vis = this;

      // Add rectangles
      vis.chart.selectAll("rect")
        .data(vis.bins)
        .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")"; })
        .attr("width", function(d) { return vis.xScale(d.x1) - vis.xScale(d.x0) ; })
        .attr("height", function(d) { return vis.height - vis.yScale(d.length); })
        .style("fill", "steelblue")
    }
  }
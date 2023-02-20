class LineChart {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || {top: 60, right: 30, bottom: 50, left: 80}
      }
      this.data = _data;
      this.initVis();
    }
    
    /**
     * Initialize scales/axes and append static chart elements
     */
    initVis() {
      let vis = this;
  
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      vis.xScale = d3.scaleTime()
          .range([0, vis.width]);
  
      vis.yScale = d3.scaleLinear()
          .range([vis.height, 0])
          .nice();
  
      // Initialize axes
      vis.xAxis = d3.axisBottom(vis.xScale)
          .ticks(6)
          .tickSizeOuter(0)
          .tickPadding(10)
          //.tickFormat(d => d + ' km');
  
      vis.yAxis = d3.axisLeft(vis.yScale)
          .ticks(4)
          .tickSizeOuter(0)
          .tickPadding(10);
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // Append group element that will contain our actual chart (see margin convention)
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
      
      // Append y-axis group
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');
  
      // We need to make sure that the tracking area is on top of other chart elements
      vis.marks = vis.chart.append('g');

      vis.chart.append('text')
        .attr('class', 'title')
        .attr('x', vis.width / 2)
        .attr('y', vis.config.margin.top / 40)
        .attr('text-anchor', 'middle')
        .text("Discoveries over Time");

      vis.chart.append("text")
        .attr("class", "xlabel")
        .attr("text-anchor", "middle")
        .attr("x",vis. width/2)
        .attr("y", vis.height + 40)
        .text("Time (years)");

      vis.chart.append("text")
        .attr('class', 'ylabel')
        .text("Number of Discoveries")
        .attr('transform', 'rotate(-90)')
        .attr('x', -((vis.height + vis.config.margin.top + vis.config.margin.bottom + 90) / 2))
        .attr('y', -50) // Relative to the y axis.
    }
  
    /**
     * Prepare the data and scales before we render it.
     */
    updateVis() {
      let vis = this;
      
      vis.xValue = d => new Date(parseInt(d[0]),0);
      vis.yValue = d => d[1];
  
      vis.line = d3.line()
          .x(d => vis.xScale(vis.xValue(d)))
          .y(d => vis.yScale(vis.yValue(d)));
  
      // Set the scale input domains
      vis.xScale.domain(d3.extent(vis.data, vis.xValue));
      vis.yScale.domain(d3.extent(vis.data, vis.yValue));
  
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements
     */
    renderVis() {
      let vis = this;
  
      // Add line path
      vis.marks.selectAll('.chart-line')
          .data([vis.data])
        .join('path')
          .attr('stroke', 'steelblue')
          .attr('fill', 'none')
          .attr('class', 'chart-line')
          .attr('d', vis.line);
      
      // Update the axes
      vis.xAxisG.call(vis.xAxis);
      vis.yAxisG.call(vis.yAxis);
    }
  }
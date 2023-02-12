class Barchart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _map, _xLabel) {
    // Configuration object with defaults
    // Important: depending on your vis and the type of interactivity you need
    // you might want to use getter and setter methods for individual attributes
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 200,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || {top: 20, right: 5, bottom: 20, left: 50}
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
    // We recommend avoiding simply using the this keyword within complex class code
    // involving SVG elements because the scope of this will change and it will cause
    // undesirable side-effects. Instead, we recommend creating another variable at
    // the start of each function to store the this-accessor
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    // You need to adjust the margin config depending on the types of axis tick labels
    // and the position of axis titles (margin convetion: https://bl.ocks.org/mbostock/3019563)
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - 40;

    // Initialize scales
    vis.xScale = d3.scaleBand()
        .range([0, vis.width])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        // .ticks(4)
        // .tickSizeOuter(0);

    vis.yAxis = d3.axisLeft(vis.yScale)
        // .tickSizeOuter(0);

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

    // Append titles, legends and other static elements here
    // ...
    // vis.chart.append("text")
    //     .attr("class", "x label")
    //     .attr("text-anchor", "end")
    //     .attr("x",vis. width)
    //     .attr("y", vis.height + 40)
    //     .text("Number of Stars");

    // vis.chart.append("text")
    //     .attr("class", "y label")
    //     .attr("text-anchor", "end")
    //     .attr("y", 6)
    //     .attr("dy", ".75em")
    //     .attr("transform", "rotate(-90)")
    //     .text("life expectancy (years)");
    
    // vis.chart.append('text')
    //     .attr('class', 'title')
    //     .attr('x', vis.width / 2)
    //     .attr('y', vis.config.margin.top / 40)
    //     .attr('text-anchor', 'middle')
    //     .text('Number of Stars in System');
    vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', vis.height + 20)
        .attr('x', vis.width - 20)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(`Number of ${vis.xLabel}`);

    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 2)
        .attr('y', 2)
        .attr('dy', '.71em')
        .text('Exoplanets');
  }

  /**
   * This function contains all the code to prepare the data before we render it.
   * In some cases, you may not need this function but when you create more complex visualizations
   * you will probably want to organize your code in multiple functions.
   */
  updateVis() {
    let vis = this;
    vis.data.reverse();

    // Specificy x- and y-accessor functions
    vis.yValue = d => vis.num_map.get(d.sy_snum)
    vis.xValue = d => d.sy_snum;

    // Set the scale input domains
    vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);
    vis.xScale.domain(vis.data.map(vis.xValue));

    vis.renderVis();
  }

  /**
   * This function contains the D3 code for binding data to visual elements.
   * We call this function every time the data or configurations change 
   * (i.e., user selects a different year)
   */
  renderVis() {
    let vis = this;
    vis.data.reverse();

    // Add rectangles
    vis.chart.selectAll('.bar')
        .data(vis.data)
        .enter()
      .append('rect')
        .attr('class', 'bar')
        .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
        .attr('width', vis.xScale.bandwidth())
        .attr('x', d => vis.xScale(vis.xValue(d)))
        .attr('y', d => vis.yScale(vis.yValue(d)));
    
    // Update the axes because the underlying scales might have changed
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}
class Barchart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _map, _title, _lMar, _yAxisLabel) {
    // Configuration object with defaults
    // Important: depending on your vis and the type of interactivity you need
    // you might want to use getter and setter methods for individual attributes
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 250,
      margin: _config.margin || {top: 20, right: 10, bottom: 20, left: _lMar}
    }
    this.data = _data;
    this.num_map = _map;
    this.title = _title;
    this.yAxisLabel = _yAxisLabel;
    this.yAxis = this.yAxisLabel != "" ? true : false;


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
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom - 30;

    // Initialize scales
    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.yScale = d3.scaleBand()
        .range([vis.height, 0])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)

    vis.yAxis = d3.axisLeft(vis.yScale)

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
    vis.chart.append("text")
        .attr("class", "xlabel")
        .attr("text-anchor", "middle")
        .attr("x",vis.width/2)
        .attr("y", vis.height + 35)
        .text("Exoplanets");

    if(vis.yAxis) {
      vis.chart.append("text")
        .attr('class', 'ylabel')
        .text(`${vis.yAxisLabel}`)
        .attr('transform', 'rotate(-90)')
        .attr('x', -((vis.height + vis.config.margin.top + vis.config.margin.bottom + 50) / 2))
        .attr('y', -30) // Relative to the y axis.
    }
    
    vis.chart.append('text')
        .attr('class', 'title')
        .attr('x', vis.width / 2)
        .attr('y', vis.config.margin.top / 40)
        .attr('text-anchor', 'middle')
        .text(`${vis.title}`);
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
    vis.xValue = d => d[1];
    vis.yValue = d => d[0];

    // Set the scale input domains
    vis.yScale.domain(vis.num_map.keys());
    vis.xScale.domain([0, d3.max(vis.num_map, vis.xValue)]);
    // vis.yScale.domain(vis.data.map(vis.yValue));

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
      .style("color", "#fff");

    // Add rectangles
    vis.chart.selectAll('.bar')
        .data(vis.num_map)
        .enter()
      .append('rect')
        .attr('class', 'bar')
        .attr('height', vis.yScale.bandwidth())
        .attr('width', d => vis.xScale(vis.xValue(d)))
        .attr('x', 0)
        .attr('y', d => vis.yScale(vis.yValue(d)))
        // .style("fill", "steelblue")
        .on("mouseover", function(d, i) {
          tooltip.html(`Data: ${d.target.__data__[1]}`).style("visibility", "visible");
          d3.select(this)
            .attr("fill", "steelblue");
        })
        .on("mousemove", function(){
          tooltip
            .style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function() {
          tooltip.html(``).style("visibility", "hidden");
          d3.select(this).attr("fill", "black");
        });
        // .append('title')
        // .text((d) => `Sales were ${d.sales} in ${d.year}`);
    
    // Update the axes because the underlying scales might have changed
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}
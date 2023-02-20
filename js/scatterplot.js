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
        containerWidth: _config.containerWidth || 500,
        containerHeight: _config.containerHeight || 300,
        margin: _config.margin || {top: 50, right: 20, bottom: 50, left: 80}
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
      vis.colorScale = d3.scaleOrdinal(d3.schemeTableau10)
          .domain(["A", "F", "G", "K", "M" ]);
  
      vis.xScale = d3.scaleLog()
        .range([vis.config.margin.left, vis.width]);
  
      vis.yScale = d3.scaleLinear()
          .range([vis.height, 0]).nice();;
  
      // Initialize axes
      vis.xAxis = d3.axisBottom(vis.xScale)
          .ticks(6)
          .tickSize(-vis.height - 10)
          .tickPadding(10)
  
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
      .text("Radius");

    vis.chart.append("text")
      .attr('class', 'ylabel')
      .text("Mass")
      .attr('transform', 'rotate(-90)')
      .attr('x', -((vis.height + vis.config.margin.top + vis.config.margin.bottom ) / 2))
      .attr('y', -30) // Relative to the y axis.
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
      vis.xValue = d => d.st_rad > 0 ? d.st_rad : 0.1;
      vis.yValue = d => d.st_mass;
  
      // Set the scale input domains
      vis.xScale.domain([0.01, d3.max(vis.data, vis.xValue)]);
      vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);
  
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
      .style("color", "#fff");
  
      // Add circles
      vis.chart.selectAll('.point')
          .data(vis.data)
          .enter()
        .append('circle')
          .attr('class', 'point')
          .attr('r', 4)
          .attr('cy', d => vis.yScale(vis.yValue(d)))
          .attr('cx', d => vis.xScale(vis.xValue(d)))
        //   .attr('fill', "steelblue");
          .attr('fill', d => vis.colorScale(vis.colorValue(d)))
          .on("mouseover", function(d, i) {
            console.log(d.target.__data__)
            tooltip.html(`Planet Name: ${d.target.__data__.pl_name}`).style("visibility", "visible");
            d3.select(this)
              .attr("fill", "black");
          })
          .on("mousemove", function(){
            tooltip
              .style("top", (event.pageY-10)+"px")
              .style("left",(event.pageX+10)+"px");
          })
          .on("mouseout", function() {
            tooltip.html(``).style("visibility", "hidden");
            d3.select(this).attr("fill", d => vis.colorScale(vis.colorValue(d)));
          });
      
      // Update the axes/gridlines
      // We use the second .call() to remove the axis and just show gridlines
      vis.xAxisG
          .call(vis.xAxis)
          .call(g => g.select('.domain').remove());
  
      vis.yAxisG
          .call(vis.yAxis)
          .call(g => g.select('.domain').remove())
    }
  }
class BubbleChart {

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
        containerWidth: _config.containerWidth || 1150,
        containerHeight: _config.containerHeight || 250,
        margin: _config.margin || {top: 50, right: 50, bottom: 50, left: 50}
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

      // append the svg object to the body of the page
        vis.svg = d3.select("#bubbleChart")
        .append("svg")
        .attr("width", vis.width + vis.config.margin.left + vis.config.margin.right)
        .attr("height", vis.height + vis.config.margin.top + vis.config.margin.bottom)
        .append("g")
        .attr("transform",
                "translate(" + vis.config.margin.left + "," + vis.config.margin.top + ")");

        // Add X axis
        vis.xScale = d3.scaleLinear()
        .range([ 0, vis.width ]);

        // Add Y axis
        vis.yScale = d3.scaleLinear()
        .range([ vis.height, 0]);

        // Add a scale for bubble size
        vis.zScale = d3.scaleLinear()
        .range([ 0, 40]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            // .ticks(6)
            .tickSize(-vis.height - 10)
            // .tickPadding(10)

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.svg.append('g')
        .attr('class', 'axis y-axis');

        // Add a scale for bubble color
        vis.myColor = d3.scaleOrdinal(d3.schemeSet1)
        .domain(["Gas", "Terrestrial", "Minor"]);     
        
        vis.svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")
            .attr("x",vis.width/2)
            .attr("y", vis.height + 40)
            .text("Distance from Star [AU]");
    }

    updateVis() {
        let vis = this;
        
        // Specificy accessor functions
        // var earthMass = data[x.rowIndex - 1].pl_bmasse;
        // var planetType = d => d.pl_bmasse > 10 ? "Gas" : d.pl_bmasse > 0.1 ? "Terrestrial" : "Minor";
        vis.colorValue = d => d.pl_bmasse > 10 ? "Gas" : d.pl_bmasse > 0.1 ? "Terrestrial" : "Minor";
        vis.xValue = d => d.pl_orbsmax;
        vis.yValue = d => 1;
        vis.zValue = d => d.pl_rade;
    
        // // Set the scale input domains
        vis.xScale.domain([0, d3.max(vis.data, vis.xValue) + 0.1]);
        vis.yScale.domain([1, d3.max(vis.data, vis.yValue)]);
        vis.zScale.domain([0, d3.max(vis.data, vis.zValue)])
    
        vis.renderVis();
      }
  
    /**
     * This function contains the D3 code for binding data to visual elements.
     * We call this function every time the data or configurations change.
     */
    renderVis() {
      let vis = this;

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
        
            // Add dots
            vis.svg.append('g')
            .selectAll("dot")
            .data(vis.data)
            .enter()
            .append("circle")
                .attr("class", "bubbles")
                .attr("cx", function (d) { return vis.xScale(vis.xValue(d)); } )
                .attr("cy", function (d) { return vis.yScale(vis.yValue(d)); } )
                .attr("r", function (d) { return vis.zScale(vis.zValue(d)); } )
                .style("fill", function (d) { return vis.myColor(vis.colorValue(d)); } )
                .on("mouseover", function(d, i) {
                    tooltip.html(`<div>Name: ${i.pl_name}</div>
                    <div>Mass: ${i.pl_bmasse}</div>
                    <div>Radius: ${i.pl_rade}</div>
                    <div>Distance: ${i.pl_orbsmax}</div>`).style("visibility", "visible");
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

            vis.xAxisG
                .call(vis.xAxis)
                .call(g => g.select('.domain').remove());

     
    }
  }
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
        containerWidth: _config.containerWidth || 1600,
        containerHeight: _config.containerHeight || 250,
        margin: _config.margin || {top: 50, right: 50, bottom: 50, left: 100}
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

      // append the svg object to the bubbleChart
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
        vis.zScale = d3.scaleSqrt()
        .range([0, 70]);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickSize(-vis.height - 10)

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`);

        // Append y-axis group
        vis.yAxisG = vis.svg.append('g')
        .attr('class', 'axis y-axis');

        // Add a scale for bubble color
        vis.myColor = d3.scaleOrdinal().range(["#A30000", "#004369", "#167D7F", "#83B692", "#fb8500", "#D64933", "#7A9CC6", "#8D6A9F", "#858585"])
        .domain(["Gas", "Terrestrial", "Minor","A", "F", "G", "K", "M" ]);   
        
        vis.svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")
            .attr("x",vis.width/2)
            .attr("y", vis.height + 40)
            .text("Distance from Star [AU]");

        if(vis.data[0].st_rad === 0) {
            document.getElementById("checkbox").disabled = true;
            document.getElementById("checkbox").title = "Star Radius Unknown";
        }
        else {
            document.getElementById("checkbox").disabled = false;
            document.getElementById("checkbox").title = "Show Star on map";
        }

        function update(){

            // For each check box:
            d3.selectAll(".checkbox").each(function(d){
                var cb = d3.select(this);
                var grp = cb.property("value")
        
                if(cb.property("checked")){
                    vis.dots.remove();
                    var stellertoEarth = 109.076 * vis.data[0].st_rad
                    vis.data.push({pl_rade: stellertoEarth, pl_orbsmax: 0, pl_bmasse: -1, st_spectype: vis.data[0].st_spectype})
                    vis.updateVis();
                }
                else {
                    vis.data = vis.data.filter(d => d.pl_bmasse != -1);
                    vis.dots.remove();
                    vis.updateVis();
                }
            })
        }
        
        // When a button change, I run the update function
        d3.selectAll(".checkbox").on("change",update);

    }

    updateVis() {
        let vis = this;
        
        // Specificy accessor functions
        vis.colorValue = d => d.pl_bmasse > 10 ? "Gas" : d.pl_bmasse > 0.1 ? "Terrestrial" : d.pl_bmasse > 0 ? "Minor" : d.st_spectype.charAt(0);
        vis.xValue = d => d.pl_orbsmax;
        vis.yValue = d => 1;
        vis.zValue = d => d.pl_rade;
    
        // // Set the scale input domains
        vis.xScale.domain([0, d3.max(vis.data, vis.xValue) + 0.01]);
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
        vis.dots = vis.svg.append('g')
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
                    d3.select(this).attr("fill", d => vis.myColor(vis.colorValue(d)));
                    });

            vis.xAxisG
                .call(vis.xAxis)
                .call(g => g.select('.domain').remove());
     
    }
  }
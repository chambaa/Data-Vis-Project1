class Orbit {

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
        containerWidth: _config.containerWidth || 1550,
        containerHeight: _config.containerHeight || 250,
        margin: _config.margin || {top: 50, right: 50, bottom: 50, left: 50}
      }
      this.data = _data;
    }

    initVis() {
        var vis = this;

        // Initialize scales
        vis.colorScale = d3.scaleOrdinal().range(["black","#83B692", "#fb8500", "#D64933", "#7A9CC6", "#8D6A9F", "#adadad"])
        .domain(["S","A", "F", "G", "K", "M" ]);

        //Make an SVG Container
        var svg = d3.select("#orbit")
        .append("svg")
        .attr("width", vis.config.containerWidth + 50)
        .attr("height", vis.config.containerHeight + 50)
        .style('background-color', 'black');

        // Star
        var specType = vis.data[0].st_spectype.charAt(0);
        var color = specType === "A" ? "#83B692" : specType === "F" ? "#fb8500" : specType === "G" ? "#D64933" : 
        specType === "K" ? "#7A9CC6" : specType === "M" ? "#8D6A9F" : "#525252";
        svg.append("ellipse")
        .attr("cx", vis.config.containerWidth / 2 + 20)
        .attr("cy", vis.config.containerHeight/ 2 + 30)
        .attr("rx", 30)
        .attr("ry", 30)
        .style("fill", color);

        var i = 0;
        console.log(vis.data)
        vis.data = vis.data.slice().sort((a, b) => d3.descending(a.pl_orbsmax, b.pl_orbsmax))
        console.log(vis.data)

        vis.data.forEach(element => {

            // console.log( 100  * element.pl_orbeccen)
            // console.log((vis.config.containerHeight * element.pl_orbeccen) * 5)
            var test = 6 - i;
            console.log((30 / element.pl_orbsmax) + 30)
            console.log((vis.config.containerHeight / test) + element.pl_orbeccen)
            svg.append("ellipse")
            .attr("cx", vis.config.containerWidth / 2 + 20)
            .attr("cy", vis.config.containerHeight / 2 + 30)
            .attr("rx", (30 / element.pl_orbsmax) + 30)
            .attr("ry", (vis.config.containerHeight / test) + element.pl_orbeccen)
            .style("fill", "none")
            .style("stroke", "white");  
            i++;
        });



        // svg.append("ellipse")
        // .attr("cx", 170)
        // .attr("cy", 100)
        // .attr("rx", 150)
        // .attr("ry", 60)
        // .style("fill", "none")
        // .style("stroke", "black");  
        
        // svg.append("ellipse")
        // .attr("cx", 200)
        // .attr("cy", 150)
        // .attr("rx", 10)
        // .attr("ry", 10)
        // .style("fill", "green");
        
        // svg.append("ellipse")
        // .attr("cx", 210)
        // .attr("cy", 40)
        // .attr("rx", 10)
        // .attr("ry", 10)
        // .style("fill", "blue");
        
        // svg.append("ellipse")
        // .attr("cx", 245)
        // .attr("cy", 90)
        // .attr("rx", 10)
        // .attr("ry", 10)
        // .style("fill", "red");

        // svg.append("ellipse")
        // .attr("cx", 170)
        // .attr("cy", 100)
        // .attr("rx", 120)
        // .attr("ry", 50)
        // .style("fill", "none")
        // .style("stroke", "black");  
    
        
    }
}
/**
 * Load data from CSV file asynchronously and render bar chart
 */
d3.csv('data/exoplanets-1.csv')
  .then(data => {

    // Convert sales strings to numbers
    data.forEach(d => {
      d.sy_snum = +d.sy_snum;
      d.sy_pnum = +d.sy_pnum;

    });

    var snum_map = d3.rollup(data, v => v.length, d => d.sy_snum);
    var pnum_map = d3.rollup(data, v => v.length, d => d.sy_pnum);
    
    // Initialize chart
    const barchart = new Barchart({ parentElement: '#barchart'}, data, snum_map, "Stars");
    const barchart2 = new Barchart({ parentElement: '#barchart2'}, data, pnum_map, "Planets");
    
    // Show chart
    barchart.updateVis();
    barchart2.updateVis();
  })
  .catch(error => console.error(error));
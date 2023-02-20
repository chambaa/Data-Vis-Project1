/**
 * Load data from CSV file asynchronously and render bar chart
 */
d3.csv('data/exoplanets-1.csv')
  .then(data => {

    var dist = [];
    var testTable = [];
    // Convert sales strings to numbers
    data.forEach(d => {
      d.sy_snum = +d.sy_snum;
      d.sy_pnum = +d.sy_pnum;
      d.sy_dist = +d.sy_dist;
      d.st_rad = +d.st_rad;
      d.st_mass = +d.st_mass;
      d.disc_year = +d.disc_year;

      dist.push(d.sy_dist)

      var ob = {
        "Name": d.pl_name,
        "Radius": d.st_rad,
        "Mass": d.st_mass,
        "Discovery Year": d.disc_year

      }
      testTable.push(ob);

    });

    // # of stars in system
    var snum_map = d3.rollup(data, v => v.length, d => d.sy_snum);
    snum_map = new Map([...snum_map.entries()].sort());

    // # of planets in system
    var pnum_map = d3.rollup(data, v => v.length, d => d.sy_pnum);
    pnum_map = new Map([...pnum_map.entries()].sort());

    // star type
    var type_map = d3.rollup(data, v => v.length, d => d.st_spectype.charAt(0));
    const validTypes = ["A", "F", "G", "K", "M"]
    var unknown = 0;
    type_map.forEach((value, key) => {
        if(!validTypes.includes(key)) {
            unknown += value;
            type_map.delete(key);
        }
    })
    type_map.set("unknown", unknown)

    // Discovery method
    var method_map = d3.rollup(data, v => v.length, d => d.discoverymethod);

    // Habitable zone
    var dist_map = d3.group(data, d => d.st_spectype.charAt(0))
    dist_map.forEach((value, key) => {
        if(!validTypes.includes(key)) {
            dist_map.delete(key);
        }
    })
    var unhab = 0;
    var hab = 0;
    dist_map.forEach((value, key) => {
        if(key == "A") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 8.5 && item.pl_orbsmax < 12.5) {
                    hab++;
                }
                else {
                    unhab++;
                }
            })
        }
        else if(key == "F") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 1.5 && item.pl_orbsmax < 2.2) {
                    hab++;
                }
                else {
                    unhab++;
                }
            })
        }
        else if(key == "G") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 0.95 && item.pl_orbsmax < 1.4) {
                    hab++;
                }
                else {
                    unhab++;
                }
            })
        }
        else if(key == "K") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 0.38 && item.pl_orbsmax < 0.56) {
                    hab++;
                }
                else {
                    unhab++;
                }
            })
        }
        else if(key == "M") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 0.08 && item.pl_orbsmax < 0.12) {
                    hab++;
                }
                else {
                    unhab++;
                }
            })
        }
    })
    const hab_map = new Map();
    hab_map.set("habitable", hab);
    hab_map.set("unhabitable", unhab);
    hab_map.set("unknown", unknown);


    
    // Initialize chart
    const star_bar = new Barchart({ parentElement: '#starBar'}, data, snum_map, "Stars in System", 80, "Number of Stars");
    const planet_bar = new Barchart({ parentElement: '#planetBar'}, data, pnum_map, "Planets in System", 80, "Number of Planets");
    const method_bar = new Barchart({ parentElement: '#methodBar'}, data, method_map, "Discovery Method", 150, "");
    const type_bar = new Barchart({ parentElement: '#typeBar'}, data, type_map, "Star Type", 80, "Star Type");
    const hab_bar = new Barchart({ parentElement: '#habBar'}, data, hab_map, "Habitable Zone", 80, "");
    
    // Show chart
    star_bar.updateVis();
    planet_bar.updateVis();
    method_bar.updateVis();
    type_bar.updateVis();
    hab_bar.updateVis();

    const hist = new Histogram( { parentElement: '#hist'}, data, dist, "Habitable", 80)
    hist.updateVis();

    const year_map = d3.rollup(data, v => v.length, d => d.disc_year);
    const year_map_sorted = new Map([...year_map.entries()].sort());
    const line = new LineChart( { parentElement: '#line'}, year_map_sorted)
    line.updateVis();

    const scat = new Scatterplot( { parentElement: '#scat'}, data);
    scat.updateVis();

    tabulate(testTable, ["Name", "Radius", "Mass", "Discovery Year"]);

  })
  .catch(error => console.error(error));
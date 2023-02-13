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
            unknown += value;
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


    
    // Initialize chart
    const star_bar = new Barchart({ parentElement: '#starBar'}, data, snum_map, "Stars", 50);
    const planet_bar = new Barchart({ parentElement: '#planetBar'}, data, pnum_map, "Planets", 50);
    const method_bar = new Barchart({ parentElement: '#methodBar'}, data, method_map, "Methods", 150);
    const type_bar = new Barchart({ parentElement: '#typeBar'}, data, type_map, "Type", 80);
    const hab_bar = new Barchart({ parentElement: '#habBar'}, data, hab_map, "Habitable", 80);
    
    // Show chart
    star_bar.updateVis();
    planet_bar.updateVis();
    method_bar.updateVis();
    type_bar.updateVis();
    hab_bar.updateVis();
  })
  .catch(error => console.error(error));
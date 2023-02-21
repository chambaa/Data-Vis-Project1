let filter = [];
const validTypes = ["A", "F", "G", "K", "M"]
let data, planet_bar, star_bar, snum_map, pnum_map, type_map, method_map, hab_map, type_bar, method_bar, hab_bar, scat;

/**
 * Load data from CSV file asynchronously and render bar chart
 */
d3.csv('data/exoplanets-1.csv')
  .then(_data => {

    data = _data;
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
    snum_map = d3.rollup(data, v => v.length, d => d.sy_snum);
    snum_map = new Map([...snum_map.entries()].sort());

    // # of planets in system
    pnum_map = d3.rollup(data, v => v.length, d => d.sy_pnum);
    pnum_map = new Map([...pnum_map.entries()].sort());

    // // star type
    type_map = getStarTypeMap(data);

    // Discovery method
    method_map = d3.rollup(data, v => v.length, d => d.discoverymethod);

    // Habitable zone
    hab_map = getHabMap(data);
    
    // Initialize chart
    star_bar = new Barchart({ parentElement: '#starBar'}, data, snum_map, "Stars in System", 80, "Number of Stars");
    planet_bar = new Barchart({ parentElement: '#planetBar'}, data, pnum_map, "Planets in System", 80, "Number of Planets");
    method_bar = new Barchart({ parentElement: '#methodBar'}, data, method_map, "Discovery Method", 150, "");
    type_bar = new Barchart({ parentElement: '#typeBar'}, data, type_map, "Star Type", 80, "Star Type");
    hab_bar = new Barchart({ parentElement: '#habBar'}, data, hab_map, "Habitable Zone", 80, "");
    
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

    scat = new Scatterplot( { parentElement: '#scat'}, data);
    scat.updateVis();

    tabulate(testTable, ["Name", "Radius", "Mass", "Discovery Year"]);

  })
  .catch(error => console.error(error));


function filterData() {
    if (filter.length == 0) {
        // star_bar.num_map = snum_map;
        planet_bar.num_map = pnum_map;
        method_bar.num_map = method_map;
        hab_bar.num_map = hab_map;
        type_bar.num_map = type_map;
        
        scat.data = data;
    } else {
        var tempData = [];
        filter.forEach(e => {
            var tempData2 = data.filter(d => e.sy_snum === d.sy_snum);
            tempData = tempData.concat(tempData2)
        });

        // Update Stars
        // var tmp_snum_map = d3.rollup(data, v => v.length, d => d.sy_snum);
        // tmp_snum_map = new Map([...snum_map.entries()].sort());
        // star_bar.num_map = tmp_snum_map;

        // Update Planets
        var tmp_pnum_map = d3.rollup(tempData, v => v.length, d => d.sy_pnum);
        tmp_pnum_map = new Map([...tmp_pnum_map.entries()].sort());
        planet_bar.num_map = tmp_pnum_map;

        // Update Discovery method
        var tmp_method_map = d3.rollup(tempData, v => v.length, d => d.discoverymethod);
        method_bar.num_map = tmp_method_map;

        // Update Habitable zone
        var tmp_hab_map = getHabMap(tempData);
        hab_bar.num_map = tmp_hab_map;

        // Update star type
        var tmp_type_map = getStarTypeMap(tempData);
        type_bar.num_map = tmp_type_map;

        // Update scatterplot
        scat.data = tempData;
    }

    // star_bar.bars.remove();
    // star_bar.updateVis();

    planet_bar.bars.remove();
    planet_bar.updateVis();

    method_bar.bars.remove();
    method_bar.updateVis()

    hab_bar.bars.remove();
    hab_bar.updateVis();

    type_bar.bars.remove();
    type_bar.updateVis();

    scat.circles.remove();
    scat.updateVis();
}

function getHabMap(_data) {
        // Habitable zone
        var dist_map = d3.group(_data, d => d.st_spectype.charAt(0))
        var unknown = 0
        dist_map.forEach((value, key) => {
            if(!validTypes.includes(key)) {
                unknown += value.length
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
        const hab_map2 = new Map();
        hab_map2.set("habitable", hab);
        hab_map2.set("unhabitable", unhab);
        hab_map2.set("unknown", unknown);

        return hab_map2;
}

function getStarTypeMap(data) {
    // star type
    var tmp_type_map = d3.rollup(data, v => v.length, d => d.st_spectype.charAt(0));

    var unknown = 0;
    tmp_type_map.forEach((value, key) => {
        if(!validTypes.includes(key)) {
            unknown += value;
            tmp_type_map.delete(key);
        }
    })
    tmp_type_map.set("unknown", unknown)
    return tmp_type_map;
}
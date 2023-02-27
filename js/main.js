let filter = [];
let tableData = [];
var dist = [];
var unknownStarType = [];
var habData = [];
var unhabData = [];
const validTypes = ["A", "F", "G", "K", "M"]
let data, tempDataG, planet_bar, star_bar, snum_map, pnum_map, type_map, method_map, hab_map, type_bar, method_bar, hab_bar, scat, hist, line, year_map_sorted, scat_data;


/**
 * Load data from CSV file asynchronously and render bar chart
 */
d3.csv('data/exoplanets-1.csv')
  .then(_data => {

    data = _data;
    // Convert strings to numbers
    data.forEach(d => {
      d.sy_snum = +d.sy_snum;
      d.sy_pnum = +d.sy_pnum;
      d.sy_dist = +d.sy_dist;
      d.st_rad = +d.st_rad;
      d.st_mass = +d.st_mass;
      d.pl_rade = +d.pl_rade;
      d.pl_bmasse = +d.pl_bmasse;
      d.disc_year = +d.disc_year;
      d.pl_orbsmax = +d.pl_orbsmax;
      d.pl_orbeccen = +d.pl_orbeccen;

      dist.push(d.sy_dist)

      var ob = {
        "Name": d.pl_name,
        "Radius": d.pl_rade,
        "Mass": d.pl_bmasse,
        "Discovery Year": d.disc_year

      }
      tableData.push(ob);

      if(!validTypes.includes(d.st_spectype.charAt(0))) {
        unknownStarType.push(d);
      }

    });
    tempDataG = data

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
    var dist_map = d3.group(_data, d => d.st_spectype.charAt(0))
    var unknown = 0
    dist_map.forEach((value, key) => {
        if(!validTypes.includes(key)) {
            unknown += value.length
            dist_map.delete(key);
        }
    })
    dist_map.forEach((value, key) => {
        if(key == "A") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 8.5 && item.pl_orbsmax < 12.5) {
                    habData.push(item);
                }
                else {
                    unhabData.push(item);
                }
            })
        }
        else if(key == "F") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 1.5 && item.pl_orbsmax < 2.2) {
                    habData.push(item);
                }
                else {
                    unhabData.push(item);
                }
            })
        }
        else if(key == "G") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 0.95 && item.pl_orbsmax < 1.4) {
                    habData.push(item);
                }
                else {
                    unhabData.push(item);
                }
            })
        }
        else if(key == "K") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 0.38 && item.pl_orbsmax < 0.56) {
                    habData.push(item);
                }
                else {
                    unhabData.push(item);
                }
            })
        }
        else if(key == "M") {
            value.forEach(item => {
                if(item.pl_orbsmax >= 0.08 && item.pl_orbsmax < 0.12) {
                    habData.push(item);
                }
                else {
                    unhabData.push(item);
                }
            })
        }
    })
    hab_map = new Map();
    hab_map.set("habitable", habData.length);
    hab_map.set("unhabitable", unhabData.length);
    hab_map.set("unknown", unknown);
    
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

    hist = new Histogram( { parentElement: '#hist'}, data, dist, "Habitable", 80)
    hist.updateVis();

    const year_map = d3.rollup(data, v => v.length, d => d.disc_year);
    year_map_sorted = new Map([...year_map.entries()].sort());
    line = new LineChart( { parentElement: '#line'}, year_map_sorted)
    line.updateVis();

    scat_data = [...data];;
    scat_data.push({"pl_name": "Mars", "pl_rade":0.53, "pl_bmasse": 0.107, "st_spectype":"S"})
    scat_data.push({"pl_name": "Venus", "pl_rade":0.95, "pl_bmasse": 0.815, "st_spectype":"S"})
    scat_data.push({"pl_name": "Mecury", "pl_rade":0.38, "pl_bmasse": 0.055, "st_spectype":"S"})
    scat_data.push({"pl_name": "Neptune", "pl_rade":3.86, "pl_bmasse": 17.15, "st_spectype":"S"})
    scat_data.push({"pl_name": "Uranus", "pl_rade":3.98, "pl_bmasse": 14.54, "st_spectype":"S"})
    scat_data.push({"pl_name": "Saturn", "pl_rade":9.13, "pl_bmasse": 95.16, "st_spectype":"S"})
    scat_data.push({"pl_name": "Jupiter", "pl_rade":11.21, "pl_bmasse": 317.91, "st_spectype":"S"})
    scat_data.push({"pl_name": "Earth", "pl_rade":1, "pl_bmasse": 1, "st_spectype":"S"})
    scat = new Scatterplot( { parentElement: '#scat'}, scat_data);
    scat.updateVis();

    tabulate(tableData, ["Name", "Radius", "Mass", "Discovery Year"]);

  })
  .catch(error => console.error(error));

function clickFunction() {
    filter = [];
    filterData();
}

function filterData() {
    if (filter.length == 0) {
        tempDataG = data;
        document.getElementById("btn").disabled = true;
        document.getElementById("btn").title = "Click on a bar to apply filters";
        star_bar.num_map = snum_map;
        planet_bar.num_map = pnum_map;
        method_bar.num_map = method_map;
        hab_bar.num_map = hab_map;
        type_bar.num_map = type_map;
        scat.data = scat_data;
        line.data = year_map_sorted;
        hist.num_map = dist;
        tabulate(tableData, ["Name", "Radius", "Mass", "Discovery Year"]);
    } else {
        document.getElementById("btn").disabled = false;
        document.getElementById("btn").title = "";
        var tempData = [];
        filter.forEach(e => {
            var tempData2 = data.filter(d => e.sy_snum === d.sy_snum);
            var tempData3 = data.filter(d => e.sy_pnum === d.sy_pnum);
            var tempData4 = e.sy_stype === "unknown" ? unknownStarType : data.filter(d => e.sy_stype === d.st_spectype.charAt(0));
            var tempData5 = data.filter(d => e.sy_disc === d.discoverymethod);
            var tempData6 = e.sy_hab === "unknown" ? unknownStarType : e.sy_hab === "habitable" ? habData : e.sy_hab === "unhabitable" ? unhabData : []

            tempData = tempData.concat(tempData2)
            tempData = tempData.concat(tempData3)
            tempData = tempData.concat(tempData4)
            tempData = tempData.concat(tempData5)
            tempData = tempData.concat(tempData6)
        });

        // Update Stars
        var tmp_snum_map = d3.rollup(tempData, v => v.length, d => d.sy_snum);
        tmp_snum_map = new Map([...tmp_snum_map.entries()].sort());
        star_bar.num_map = tmp_snum_map;

        // Update Planets
        var tmp_pnum_map = d3.rollup(tempData, v => v.length, d => d.sy_pnum);
        tmp_pnum_map = new Map([...tmp_pnum_map.entries()].sort());
        planet_bar.num_map = tmp_pnum_map;

        // Update Discovery method
        method_bar.num_map = d3.rollup(tempData, v => v.length, d => d.discoverymethod);

        // Update Habitable zone
        hab_bar.num_map = getHabMap(tempData);

        // Update star type
        type_bar.num_map = getStarTypeMap(tempData);

        // Update scatterplot
        var tmp_scat_data =  [...tempData];
        tmp_scat_data.push({"pl_name": "Mars", "pl_rade":0.53, "pl_bmasse": 0.107, "st_spectype":"S"})
        tmp_scat_data.push({"pl_name": "Venus", "pl_rade":0.95, "pl_bmasse": 0.815, "st_spectype":"S"})
        tmp_scat_data.push({"pl_name": "Mecury", "pl_rade":0.38, "pl_bmasse": 0.055, "st_spectype":"S"})
        tmp_scat_data.push({"pl_name": "Neptune", "pl_rade":3.86, "pl_bmasse": 17.15, "st_spectype":"S"})
        tmp_scat_data.push({"pl_name": "Uranus", "pl_rade":3.98, "pl_bmasse": 14.54, "st_spectype":"S"})
        tmp_scat_data.push({"pl_name": "Saturn", "pl_rade":9.13, "pl_bmasse": 95.16, "st_spectype":"S"})
        tmp_scat_data.push({"pl_name": "Jupiter", "pl_rade":11.21, "pl_bmasse": 317.91, "st_spectype":"S"})
        tmp_scat_data.push({"pl_name": "Earth", "pl_rade":1, "pl_bmasse": 1, "st_spectype":"S"})
        scat.data = tmp_scat_data;

        // Update Line
        const tmp_year_map = d3.rollup(tempData, v => v.length, d => d.disc_year);
        const tmp_year_map_sorted = new Map([...tmp_year_map.entries()].sort());
        line.data = tmp_year_map_sorted

        // Update Table
        var tmpTableData = [];
        var tmpDist = [];
        tempData.forEach(d => {
            d.st_rad = +d.st_rad;
            d.st_mass = +d.st_mass;
            d.disc_year = +d.disc_year;
            d.sy_dist = +d.sy_dist;
            d.pl_rade = +d.pl_rade;
            d.pl_bmasse = +d.pl_bmasse;
            d.pl_orbsmax = +d.pl_orbsmax;
            d.pl_orbeccen = +d.pl_orbeccen;
       
            var ob = {
              "Name": d.pl_name,
              "Radius": d.pl_rade,
              "Mass": d.pl_bmasse,
              "Discovery Year": d.disc_year
      
            }
            tmpTableData.push(ob);

            tmpDist.push(d.sy_dist)
        });
        tabulate(tmpTableData, ["Name", "Radius", "Mass", "Discovery Year"]);

        // Update Hist
        hist.num_map = tmpDist;
    }
    tempDataG = tempData

    star_bar.bars.remove();
    star_bar.updateVis();

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

    line.marks.remove();
    line.updateVis();

    hist.bars.remove();
    hist.updateVis();
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
        var hab = 0;
        var unhab = 0;
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
        if(hab > 0) {
            hab_map2.set("habitable", hab);
        }
        if(unhab > 0) {
            hab_map2.set("unhabitable", unhab);
        }
        if(unknown > 0) {
            hab_map2.set("unknown", unknown);
        }
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
    if(unknown > 0) {
        tmp_type_map.set("unknown", unknown)
    }
    return tmp_type_map;
}

function detailClick(x, type) {
    console.log(x)
    var dataTest = filter.length > 0 ? tempDataG : data;
    var fullRowData = type === "scatter" ? x : dataTest[x.rowIndex - 1];
    var systemData = data.filter(d => fullRowData.sys_name === d.sys_name);
    document.getElementById("mainVis").style.display = "none";
    document.getElementById("name").innerHTML = `Exoplanet: ${fullRowData.pl_name}`;
    var earthMass = fullRowData.pl_bmasse;
    var planetType = earthMass > 50 ? "Gas giant - Jovian" : earthMass > 10 ? "Gas giant - Neptunian" : earthMass > 2 ? 
    "Terrestrial - Superterran (super-Earths)" : earthMass > 0.5 ? "Terrestrial - Terran (Earths)" : earthMass > 0.1 ? 
    "Terrestrial - Subterran" : earthMass > 0.00001 ? "Minor - Mercurian" : "Minor - Asteroidan";
    document.getElementById("type").innerHTML = `Planet Type: ${planetType}`;

    var orbit = new Orbit( { parentElement: '#orbit'}, systemData);
    orbit.initVis();
    document.getElementById("detailVis").style.display = "block";
    var bubble = new BubbleChart( { parentElement: '#bubbleChart'}, systemData);
    bubble.updateVis();
}

function homeFunction() {
    document.getElementById("detailVis").style.display = "none";
    document.getElementById("mainVis").style.display = "block";
    document.getElementById("bubbleChart").innerHTML = "";
    document.getElementById("orbit").innerHTML = "";
    document.getElementById("checkbox").checked = false;
}

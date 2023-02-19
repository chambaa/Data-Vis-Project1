function tabulate(data, columns) {
	var table = d3.select('#tab')
        .append("foreignObject")
        .attr("width", 500)
        .attr("height", 250)
        .attr("class", "scrollTable")
        .append('xhtml:table');

    var title = table.append('caption')
        .style("font-weight","bold")
        .text("Select a row to discover more!");
	var thead = table.append('thead')
	var	tbody = table.append('tbody');

	// append the header row
	thead.append('tr')
	  .selectAll('th')
	  .data(columns).enter()
	  .append('th')
	    .text(function (column) { return column; });

	// create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(data)
	  .enter()
	  .append('tr');

	// create a cell in each row for each column
	var cells = rows.selectAll('td')
	  .data(function (row) {
	    return columns.map(function (column) {
	      return {column: column, value: row[column]};
	    });
	  })
	  .enter()
	  .append('td')
	    .text(function (d) { return d.value; });

  return table;
}
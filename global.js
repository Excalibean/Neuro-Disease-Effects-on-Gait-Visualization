console.log("Its Alive");

d3.json("data.json").then(data => {
    console.log(data);

    // Set dimensions
    const width = 600, height = 400, margin = { top: 40, right: 30, bottom: 50, left: 60 };

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([-0.5, 3.5])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(["als", "hunt", "control", "park"])
        .range(["purple", "blue", "#2ca02c", "#d62728"]);

    // Create SVG container
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Add points
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.jitter))
        .attr("cy", d => yScale(d["Double Support Time"]))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.label))
        .attr("opacity", 0.7);

    // Add x-axis
    const xAxis = d3.axisBottom(xScale)
        .tickValues([0, 1, 2, 3])
        .tickFormat(d => ["Alzheimer", "Huntingtons", "Control", "Parkinsons"][d]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

    // Add y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Double Support Time per Group (Filtered: Values ≤ 1)");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - margin.bottom / 2 + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Group");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", margin.left / 3)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Double Support Time (s)");
})
console.log("Its Alive");

d3.json("data.json").then(data => {
    // Set dimensions
    const width = 800, height = 450, margin = { top: 40, right: 30, bottom: 50, left: 60 };

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([-0.5, 3.3])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(["als", "hunt", "control", "park"])
        .range(["purple", "blue", "green", "red"]);

    // Create SVG container
    const svg = d3.select("#chart")
        .attr("width", width + 150)
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
        .tickFormat(d => ["Alzheimer's", "Huntington's", "Control", "Parkinson's"][d]);

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

    // Define legend position
    const legendX = width; // Adjust as needed
    const legendY = 20;

    const legend = svg.append("g")
        .attr("transform", `translate(${legendX}, ${legendY})`);

    // Define categories
    const categories = ["Alzheimer's Disease", "Huntington's Disease", "Control (Healthy)", "Parkinson's Disease"];

    // Append legend items
    categories.forEach((category, i) => {
        let legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`) // Adjust spacing
            .style("pointer-events", "none");

        // Legend color dot
        legendRow.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", colorScale(category));

        // Legend text
        legendRow.append("text")
            .attr("x", 12)  // Position text beside the circle
            .attr("y", 4)   // Align text vertically
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .text(category);
    });

    const tooltip = d3.select("#tooltip");

    const groupNames = {
        "als": "Alzheimer's Disease",
        "hunt": "Huntington's Disease",
        "control": "Control (Healthy)",
        "park": "Parkinson's Disease"
    };

    svg.selectAll("circle")
        .on("mouseover", function(event, d) {
            // Show tooltip
            tooltip.style("display", "block")
                .html(`<strong>Label:</strong> ${groupNames[d.label]} <br>
                    <strong>Group:</strong> ${d.jitter.toFixed(3)} <br>
                    <strong>Double Support Time:</strong> ${d["Double Support Time"].toFixed(3)}s`)
                .style("left", (event.pageX + 10) + "px") // Offset tooltip
                .style("top", (event.pageY - 20) + "px");

            // Highlight point
            d3.select(this).attr("r", 6).style("stroke", "black").style("stroke-width", 2);
        })
        .on("mousemove", function(event) {
            // Move tooltip with mouse
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            // Hide tooltip
            tooltip.style("display", "none");

            // Reset point style
            d3.select(this).attr("r", 4).style("stroke", "none");
        });

})


// **Gait-Animation Prototype**

// Function to load and animate data
function loadAndAnimateData(file) {
    d3.json(file).then(data => {
        let patient = data[0]; // Use the first patient in the file

        // Convert gait parameters to milliseconds
        let leftStride = patient.left_stride * 1000;
        let rightStride = patient.right_stride * 1000;
        let leftSwing = patient.left_swing * 1000;
        let rightSwing = patient.right_swing * 1000;

        // Select SVG
        let svg = d3.select("#gait-animation")
            .attr("width", 200)  // Set fixed width
            .attr("height", 200) // Set fixed height
            .style("display", "block")
            .style("margin", "auto");

        let width = +svg.attr("width"), height = +svg.attr("height");

        // Clear previous animation
        svg.selectAll("*").remove();

        // Base position for ground (near the bottom of the SVG)
        let groundY = height - 20;

        // Adjust foot positions (left and right) to be centered horizontally
        let leftFoot = svg.append("circle")
            .attr("cx", width / 2 - 50)  // Place left foot slightly left of center
            .attr("cy", groundY)         // On the ground
            .attr("r", 25)               // Set larger radius for visibility
            .attr("fill", "black");

        let rightFoot = svg.append("circle")
            .attr("cx", width / 2 + 50)  // Place right foot slightly right of center
            .attr("cy", groundY)         // On the ground
            .attr("r", 25)               // Set larger radius for visibility
            .attr("fill", "black");

        // Walking animation function
        function animateFeet() {
            // Left foot movement (swing up and down)
            leftFoot.transition().duration(leftSwing)
                .attr("cy", groundY - 30)  // Lift up during swing (increase height)
                .transition().duration(leftStride - leftSwing)
                .attr("cy", groundY);      // Return to ground

            // Right foot movement (delayed)
            rightFoot.transition().delay(leftStride / 2).duration(rightSwing)
                .attr("cy", groundY - 30)  // Lift up during swing (increase height)
                .transition().duration(rightStride - rightSwing)
                .attr("cy", groundY);      // Return to ground
        }

        // Loop animation
        setInterval(animateFeet, Math.max(leftStride, rightStride));
        animateFeet(); // Start animation
    });
}

// Initial load
loadAndAnimateData("park1.json");

// Handle dropdown change
d3.select("#file-selector").on("change", function() {
    let selectedFile = d3.select(this).property("value");
    loadAndAnimateData(selectedFile);
});


// ** main vis prototype **
function animate_footprints(file, datasetIndex) {
    d3.json(file).then(data => {
        const margin = { top: 20, right: 20, bottom: 50, left: 70 };
        const width = 600 - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;
       
        // Set up the SVG container
        const svg = d3.select("#walking-path")
                        .html("") // Clears previous content
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);
    
        // Scale for the X and Y axes
        const xScale = d3.scaleLinear().domain([0, 500]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 2]).range([height, 0]);
    
        // Create x and y axis
        const xAxis = svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));
    
        const yAxis = svg.append("g")
            .call(d3.axisLeft(yScale));
    
        // Add x-axis label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40) // Adjusted for visibility
            .style("text-anchor", "middle")
            .text("Time (ms)");
    
        // Add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -40)
            .style("text-anchor", "middle")
            .text("Foot Position (m)");

        // Get color for this dataset
        const footColor = datasetColors[datasetIndex % datasetColors.length];
        
        // Create circles for each foot
        const leftFoot = svg.append("circle")
            .attr("class", "foot")
            .attr("r", 5)
            .attr("fill", footColor)
            .attr("cx", xScale(data[0].x_left))
            .attr("cy", yScale(data[0].y_left));
    
        const rightFoot = svg.append("circle")
            .attr("class", "right-foot")
            .attr("r", 5)
            .attr("fill", footColor)
            .attr("cx", xScale(data[0].x_right))
            .attr("cy", yScale(data[0].y_right));

        // Function to update foot positions over time
        function updateFootPosition(index) {
            if (index >= data.length) {
                setTimeout(loadNextDataset, 1000);
                return;
            }
    
            // Get the time for the current data point
            const currentTime = data[index].time;
            console.log(currentTime)

            // TEMP stop after 10 seconds
            if (currentTime > 10) {
                setTimeout(loadNextDataset, 1000);
                return;
            }
    
            // Update positions of the feet based on the current data point
            leftFoot.transition()
                .duration(currentTime / 100000)
                .attr("cx", xScale(data[index].x_left))
                .attr("cy", yScale(data[index].y_left));
    
            rightFoot.transition()
                .duration(currentTime / 100000)
                .attr("cx", xScale(data[index].x_right))
                .attr("cy", yScale(data[index].y_right));
    
            // Call the next data point after a short delay
            setTimeout(() => updateFootPosition(index + 1), currentTime / 100000); // divide by large number quicken speed
        }
    
        // Start the animation
        updateFootPosition(0);
    
    })
}

const datasets = [
    "./gait_coordinates/control1_coord.json",
    "./gait_coordinates/als1_coord.json",
    "./gait_coordinates/park1_coord.json",
    "./gait_coordinates/hunt1_coord.json"
];

const datasetColors = ["green", "purple", "red", "blue"];
let currentDatasetIndex = 0; // Track which dataset is being played

// Function to load the next dataset
function loadNextDataset() {
    currentDatasetIndex++;

    if (currentDatasetIndex < datasets.length) {
        animate_footprints(datasets[currentDatasetIndex], currentDatasetIndex);
    } else {
        console.log("All animations completed.");
    }
}

// Start with the first dataset
animate_footprints(datasets[currentDatasetIndex], currentDatasetIndex);
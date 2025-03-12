console.log("Its Alive");

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

let path1, path2;
let data1, data2;
let isAnimating = false;
let index = 0; // Track the current index for animation
let animationTimeout; // Track the animation timeout for interrupting

function loadFootprints(file1, file2) {
    // Stop ongoing animation and reset index immediately
    if (isAnimating) {
        isAnimating = false;
        clearTimeout(animationTimeout); // Clear any ongoing animation timeout
    }
    index = 0; // Reset the animation index

    // Clear any ongoing transitions and reset positions
    if (path1 && path2) {
        path1.leftFoot.transition().duration(0).attr("cx", path1.xScale(data1[0].x_left)).attr("cy", path1.yScale(data1[0].y_left));
        path1.rightFoot.transition().duration(0).attr("cx", path1.xScale(data1[0].x_right)).attr("cy", path1.yScale(data1[0].y_right));
        path2.leftFoot.transition().duration(0).attr("cx", path2.xScale(data2[0].x_left)).attr("cy", path2.yScale(data2[0].y_left));
        path2.rightFoot.transition().duration(0).attr("cx", path2.xScale(data2[0].x_right)).attr("cy", path2.yScale(data2[0].y_right));
    }

    Promise.all([d3.json(file1), d3.json(file2)]).then(([d1, d2]) => {
        data1 = d1.filter(d => d.time <= 20);
        data2 = d2.filter(d => d.time <= 20);

        // Create the walking path visuals without animation
        path1 = createWalkingPath("#walking-path1", data1, "blue", "green");
        path2 = createWalkingPath("#walking-path2", data2, "blue", "green");

        // Reset the animation state to ensure it doesn't play automatically after dropdown change
        isAnimating = false;
    });
}

function createWalkingPath(containerId, data, footColorLeft, footColorRight) {
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([0, 20]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    const svg = d3.select(containerId)
        .html("")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create x and y axes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
    svg.append("g").call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("text-anchor", "middle")
        .text("Distance in 20 seconds");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .style("text-anchor", "middle")
        .text("Foot Position (m)");

    // Left and Right foot markers
    const leftFoot = svg.append("circle")
        .attr("r", 5)
        .attr("fill", footColorLeft)
        .attr("cx", xScale(data[0].x_left))
        .attr("cy", yScale(data[0].y_left));

    const rightFoot = svg.append("circle")
        .attr("r", 5)
        .attr("fill", footColorRight)
        .attr("cx", xScale(data[0].x_right))
        .attr("cy", yScale(data[0].y_right));

    // Add a legend to the right of the graph
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 60}, 20)`); // Position the legend

    // Green box (Left Foot) in the legend
    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", footColorLeft);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .attr("fill", "black")
        .text("Left Foot")
        .style("font-size", "12px");

    // Blue box (Right Foot) in the legend
    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("y", 15)  // Place it below the green box
        .attr("fill", footColorRight);

    legend.append("text")
        .attr("x", 15)
        .attr("y", 25)
        .attr("fill", "black")
        .text("Right Foot")
        .style("font-size", "12px");

    return { leftFoot, rightFoot, data, xScale, yScale };
}

function startAnimation() {
    if (isAnimating) return; // Prevent starting the animation if it's already running

    if (!data1 || !data2) return;

    isAnimating = true;

    let index = 0;
    function updateFootPositions() {
        if (index >= Math.min(data1.length, data2.length)) {
            isAnimating = false;  // Animation has finished, set flag to false
            return;
        }

        const currentTime1 = data1[index].time;
        const currentTime2 = data2[index].time;

        // console.log(`time1: ${currentTime1}`);
        // console.log(`time2: ${currentTime2}`);

        // Update positions for first dataset
        path1.leftFoot.transition()
            .duration(currentTime1)
            .attr("cx", path1.xScale(data1[index].x_left))
            .attr("cy", path1.yScale(data1[index].y_left));
        path1.rightFoot.transition()
            .duration(currentTime1)
            .attr("cx", path1.xScale(data1[index].x_right))
            .attr("cy", path1.yScale(data1[index].y_right));

        // Update positions for second dataset
        path2.leftFoot.transition()
            .duration(currentTime2)
            .attr("cx", path2.xScale(data2[index].x_left))
            .attr("cy", path2.yScale(data2[index].y_left));
        path2.rightFoot.transition()
            .duration(currentTime2)
            .attr("cx", path2.xScale(data2[index].x_right))
            .attr("cy", path2.yScale(data2[index].y_right));

        index++;
        animationTimeout = setTimeout(updateFootPositions, 1);
    }

    updateFootPositions();
}

// Load default data on page load (no animation)
loadFootprints("./gait_coordinates/control1_coord.json", "./gait_coordinates/als1_coord.json");

// Set dropdown values to match loaded files
document.getElementById('file1').value = './gait_coordinates/control1_coord.json';
document.getElementById('file2').value = './gait_coordinates/als1_coord.json';

// Update graphs (but no animation) when dropdown changes
document.getElementById('file1').addEventListener('change', () => {
    const file1 = document.getElementById('file1').value;
    const file2 = document.getElementById('file2').value;
    loadFootprints(file1, file2);  // Reload without animation
});

document.getElementById('file2').addEventListener('change', () => {
    const file1 = document.getElementById('file1').value;
    const file2 = document.getElementById('file2').value;
    loadFootprints(file1, file2);  // Reload without animation
});

window.startAnimation = startAnimation;
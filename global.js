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

// ** side vis prototype **

let path1, path2;
let data1, data2;
let isAnimating = false;
let index = 0; // Track the current index for animation
let animationTimeout; // Track the animation timeout for interrupting

// debounce function to limit the rate of execution of a function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.getElementById('duration-slider').addEventListener('input', debounce(() => {
    const file1 = document.getElementById('file1').value;
    const file2 = document.getElementById('file2').value;
    loadFootprints(file1, file2);  // Reload without animation
    updateDurationLabel(document.getElementById('duration-slider').value);
}, 250));

function updateDurationLabel(value) {
    document.getElementById('duration-label').textContent = value;
}
window.updateDurationLabel = updateDurationLabel;

function loadFootprints(file1, file2) {
    const duration = document.getElementById('duration-slider').value;

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
        data1 = d1.filter(d => d.time <= duration);
        data2 = d2.filter(d => d.time <= duration);

        // Create the walking path visuals without animation
        path1 = createWalkingPath("#walking-path1", data1, "blue", "green", duration);
        path2 = createWalkingPath("#walking-path2", data2, "blue", "green", duration);

        // Reset the animation state to ensure it doesn't play automatically after dropdown change
        isAnimating = false;
    });
}

function createWalkingPath(containerId, data, footColorLeft, footColorRight, duration) {
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([0, duration]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 0.5]).range([height, 0]);

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
        .text(`Distance in ${duration} Seconds`);

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

// Function to update the narrative text
function updateNarrativeText(text) {
    document.getElementById('narrative-text').textContent = text;
}

// Function to update the labels for the graphs based on the selected diseases
function updateGraphLabels() {
    const disease1 = document.getElementById('file1').selectedOptions[0].text;
    const disease2 = document.getElementById('file2').selectedOptions[0].text;
    document.getElementById('label-disease1').textContent = disease1;
    document.getElementById('label-disease2').textContent = disease2;
    updateNarrativeText(`Comparing the walking paths of ${disease1} and ${disease2}.`);
}

// Update graphs (but no animation) when dropdown changes
document.getElementById('file1').addEventListener('change', () => {
    updateGraphLabels();
    const file1 = document.getElementById('file1').value;
    const file2 = document.getElementById('file2').value;
    loadFootprints(file1, file2);  // Reload without animation
});

document.getElementById('file2').addEventListener('change', () => {
    updateGraphLabels();
    const file1 = document.getElementById('file1').value;
    const file2 = document.getElementById('file2').value;
    loadFootprints(file1, file2);  // Reload without animation
});

// Load default data on page load (no animation)
loadFootprints("./gait_coordinates/control1_coord.json", "./gait_coordinates/park1_coord.json");

// Set dropdown values to match loaded files
document.getElementById('file1').value = './gait_coordinates/control1_coord.json';
document.getElementById('file2').value = './gait_coordinates/park1_coord.json';

updateGraphLabels();
updateNarrativeText('Use the controls below to compare the walking paths of different diseases.');

window.startAnimation = startAnimation;

// Function to animate a single walking path without displaying y-axis
function animateWalkingPaths(files, svgIds, yOffset = 0, labelTexts = []) {
    Promise.all(files.map(file => d3.json(file))).then(datasets => {
        datasets.forEach((data, index) => {
            const svgId = svgIds[index];
            const labelText = labelTexts[index];

            const margin = { top: 100, right: 20, bottom: 20, left: 20 }; // Adjust margins as needed
            const width = 600 - margin.left - margin.right;
            const height = 150 - margin.top - margin.bottom; // Increase height to ensure graphs stay within view

            // Set up the SVG container
            const svg = d3.select(svgId)
                .html("") // Clear previous content
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top + yOffset})`); // Adjust yOffset to shift down

            // Scale for the X and Y axes
            const xScale = d3.scaleLinear().domain([0, 200]).range([0, width]);
            const yScale = d3.scaleLinear().domain([0, 2]).range([height, 0]);

            // Create x-axis
            const xAxis = svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale));

            // Add label text
            svg.append("text")
                .attr("x", width * 0.95)
                .attr("y", height / 2)
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "middle")
                .text(labelText);

            // Determine the class for the dots based on the label text
            let footClass = "";
            if (labelText === "Healthy Person") {
                footClass = "healthy";
            } else if (labelText === "Parkinson's Disease") {
                footClass = "parkinsons";
            } else if (labelText === "Huntington's Disease") {
                footClass = "huntingtons";
            } else if (labelText === "Alzheimer's Disease") {
                footClass = "alzheimers";
            }

            // Create circles for each foot
            const leftFoot = svg.append("circle")
                .attr("class", `foot ${footClass}`)
                .attr("r", 5)
                .attr("cx", xScale(data[0].x_left))
                .attr("cy", yScale(data[0].y_left)); // Use yScale for vertical positioning

            const rightFoot = svg.append("circle")
                .attr("class", `foot ${footClass}`)
                .attr("r", 5)
                .attr("cx", xScale(data[0].x_right))
                .attr("cy", yScale(data[0].y_right)); // Use yScale for vertical positioning

            // Function to update foot positions over time
            function updateFootPosition(index) {
                if (index >= data.length) {
                    return;
                }

                // Get the time for the current data point
                const currentTime = data[index].time;

                // TEMP stop after 200 seconds
                if (currentTime > 235) {
                    return;
                }

                // Update positions of the feet based on the current data point
                leftFoot.transition()
                    .duration(currentTime / 100000)
                    .attr("cx", xScale(data[index].x_left))
                    .attr("cy", yScale(data[index].y_left)); // Update y position

                rightFoot.transition()
                    .duration(currentTime / 100000)
                    .attr("cx", xScale(data[index].x_right))
                    .attr("cy", yScale(data[index].y_right)); // Update y position

                // Call the next data point after a short delay
                setTimeout(() => updateFootPosition(index + 1), currentTime / 100000); // divide by large number quicken speed
            }

            // Start the animation
            updateFootPosition(0);
        });
    });
}

// Initial load
animateWalkingPaths(
    ["./gait_coordinates/control1_coord.json"],
    ["#combined-walking-path"],
    0,
    ["Healthy Person"]
);

let step = 0;
const descriptions = [
    "Gait refers to the manner or pattern of walking.\nYour Gait includes the way you walk, your stride length, step width, hip sway, arm sways and walking speed.",
    "This is the pace of a Healthy Person.",
    "This is the pace of a person with Parkinson's Disease. \nA neurological disorder that affects movement.\nIt is typically characterized by tremors, stiffness, slowness and impaired balance.",
    "Other neurological disorders such as Huntington's Disease also affect Gait due to uncontrollable movement and loss of motor control.",
    "Changes in Gait take many variations whether it's simply walking slower, lack of an arm swing on a single side, shuffling, a forward lean causing quicker steps, and more."
];
const files = [
    "./gait_coordinates/control1_coord.json",
    "./gait_coordinates/park1_coord.json",
    "./gait_coordinates/hunt1_coord.json",
    "./gait_coordinates/als1_coord.json"
];
const svgIds = [
    "#combined-walking-path",
    "#second-walking-path",
    "#third-walking-path",
    "#fourth-walking-path"
];
const labelTexts = [
    "Healthy Person",
    "Parkinson's Disease",
    "Huntington's Disease",
    "Alzheimer's Disease"
];

d3.select("#visualization-container").on("click", function() {
    step++;
    if (step === 1) {
        d3.select("#description").text(descriptions[0]);
    } else if (step === 2) {
        d3.select("#description").text(descriptions[1]);
        d3.select("#combined-walking-path")
            .transition()
            .duration(500)
            .style("opacity", 1);
        animateWalkingPaths(files.slice(0, 1), svgIds.slice(0, 1), 0, labelTexts.slice(0, 1));
    } else if (step === 3) {
        d3.select("#description").text(descriptions[2]);
        d3.select("#description-container")
            .transition()
            .duration(300)
            .style("top", "120px")
            .style("right", "80px")
            .style("transform", "translate(0, 0)");
        d3.select("#combined-walking-path").style("transform", "translateY(-125px)");
        d3.select("#second-walking-path").style("opacity", 1);
        animateWalkingPaths(files.slice(0, 2), svgIds.slice(0, 2), 0, labelTexts.slice(0, 2));
    } else if (step === 4) {
        d3.select("#description").text(descriptions[3]);
        d3.select("#combined-walking-path").style("transform", "translateY(-225px)");
        d3.select("#second-walking-path").style("transform", "translateY(-100px)");
        d3.select("#third-walking-path").style("opacity", 1);
        animateWalkingPaths(files.slice(0, 3), svgIds.slice(0, 3), 0, labelTexts.slice(0, 3));
    } else if (step === 5) {
        d3.select("#description").text(descriptions[4]);
        d3.select("#combined-walking-path").style("transform", "translateY(-325px)");
        d3.select("#second-walking-path").style("transform", "translateY(-200px)");
        d3.select("#third-walking-path").style("transform", "translateY(-100px)");
        d3.select("#fourth-walking-path").style("opacity", 1);
        animateWalkingPaths(files, svgIds, 0, labelTexts);

        // scroll down prompt
        d3.select("#scroll-prompt")
            .transition()
            .duration(1000)
            .style("opacity", 1);
    } else {
        d3.select("#visualization-container").style("pointer-events", "none");
    }
});
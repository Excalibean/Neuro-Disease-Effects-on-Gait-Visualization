console.log("Its Alive");

// **Gait-Animation Top-Down**

// Function to load and animate data with shadow reference stride
function loadAndAnimateData(file, referenceFile = null) {
    // First load the main data
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

        // Create shadow feet (reference stride) if a reference file is provided
        let leftShadow, rightShadow, referenceName;
        
        function loadReference() {
            if (referenceFile) {
                // Load the reference data
                d3.json(referenceFile).then(refData => {
                    let refPatient = refData[0];
                    
                    // Get the name of the reference for the legend
                    referenceName = referenceFile.split('/').pop().split('.')[0];
                    
                    // Add shadow feet (reference stride)
                    leftShadow = svg.append("circle")
                        .attr("cx", width / 2 - 50)
                        .attr("cy", groundY)
                        .attr("r", 20)  // Slightly smaller than main feet
                        .attr("fill", "rgba(128, 128, 128, 0.3)") // Translucent gray
                        .attr("stroke", "black")
                        .attr("stroke-width", 1);
                        
                    rightShadow = svg.append("circle")
                        .attr("cx", width / 2 + 50)
                        .attr("cy", groundY)
                        .attr("r", 20)
                        .attr("fill", "rgba(128, 128, 128, 0.3)") // Translucent gray
                        .attr("stroke", "black")
                        .attr("stroke-width", 1);
                    
                    // Add legend
                    const legend = svg.append("g")
                        .attr("transform", `translate(${width - 70}, 20)`);
                    
                    // Current patient legend item
                    legend.append("circle")
                        .attr("r", 6)
                        .attr("fill", "black");
                        
                    legend.append("text")
                        .attr("x", 12)
                        .attr("y", 4)
                        .text(file.split('/').pop().split('.')[0])
                        .style("font-size", "10px");
                        
                    // Reference patient legend item
                    legend.append("circle")
                        .attr("r", 5)
                        .attr("cy", 15)
                        .attr("fill", "rgba(128, 128, 128, 0.5)")
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.5);
                        
                    legend.append("text")
                        .attr("x", 12)
                        .attr("y", 19)
                        .text(referenceName)
                        .style("font-size", "10px");
                    
                    // Start the animation with both main and shadow feet
                    animateWithReference(refPatient);
                });
            } else {
                // If no reference, just animate the main feet
                animateWithoutReference();
            }
        }
        
        function animateWithReference(refPatient) {
            let refLeftStride = refPatient.left_stride * 1000;
            let refRightStride = refPatient.right_stride * 1000;
            let refLeftSwing = refPatient.left_swing * 1000;
            let refRightSwing = refPatient.right_swing * 1000;
            
            // Main feet animation
            function animateMainFeet() {
                // Left foot movement (swing up and down)
                leftFoot.transition().duration(leftSwing)
                    .attr("cy", groundY - 50)  // Lift up during swing
                    .transition().duration(leftStride - leftSwing)
                    .attr("cy", groundY);      // Return to ground

                // Right foot movement (delayed)
                rightFoot.transition().delay(leftStride / 2).duration(rightSwing)
                    .attr("cy", groundY - 50)  // Lift up during swing
                    .transition().duration(rightStride - rightSwing)
                    .attr("cy", groundY);      // Return to ground
            }
            
            // Shadow feet animation
            function animateShadowFeet() {
                // Left shadow movement
                leftShadow.transition().duration(refLeftSwing)
                    .attr("cy", groundY - 50)  // Lift up during swing
                    .transition().duration(refLeftStride - refLeftSwing)
                    .attr("cy", groundY);      // Return to ground

                // Right shadow movement (delayed)
                rightShadow.transition().delay(refLeftStride / 2).duration(refRightSwing)
                    .attr("cy", groundY - 50)  // Lift up during swing
                    .transition().duration(refRightStride - refRightSwing)
                    .attr("cy", groundY);      // Return to ground
            }

            // Loop animations
            setInterval(animateMainFeet, Math.max(leftStride, rightStride));
            setInterval(animateShadowFeet, Math.max(refLeftStride, refRightStride));
            
            // Start animations
            animateMainFeet();
            animateShadowFeet();
        }
        
        function animateWithoutReference() {
            function animateFeet() {
                // Left foot movement (swing up and down)
                leftFoot.transition().duration(leftSwing)
                    .attr("cy", groundY - 30)  // Lift up during swing
                    .transition().duration(leftStride - leftSwing)
                    .attr("cy", groundY);      // Return to ground

                // Right foot movement (delayed)
                rightFoot.transition().delay(leftStride / 2).duration(rightSwing)
                    .attr("cy", groundY - 30)  // Lift up during swing
                    .transition().duration(rightStride - rightSwing)
                    .attr("cy", groundY);      // Return to ground
            }

            // Loop animation
            setInterval(animateFeet, Math.max(leftStride, rightStride));
            animateFeet(); // Start animation
        }
        
        // Start the appropriate animation
        loadReference();
    });
}

// Initial load with healthy reference
loadAndAnimateData("./strides/park1.json", "./strides/control1.json");

// Add a reference selector dropdown
let referenceSelector = d3.select("#gait-animation-container")
    .append("div")
    .attr("class", "reference-selector")
    .style("margin-top", "10px")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("align-items", "center");

referenceSelector.append("label")
    .attr("for", "reference-file")
    .text("Reference Stride: ")
    .style("margin-right", "10px");

referenceSelector.append("select")
    .attr("id", "reference-file")
    .on("change", function() {
        const selectedFile = d3.select("#file-selector").property("value");
        const selectedReference = d3.select(this).property("value");
        loadAndAnimateData(selectedFile, selectedReference === "none" ? null : selectedReference);
    })
    .selectAll("option")
    .data([
        {value: "none", text: "None"},
        {value: "./strides/control1.json", text: "Control (Healthy)"},
        {value: "./strides/park2.json", text: "Parkinson's (Least Severe)"},
        {value: "./strides/park11.json", text: "Parkinson's (Median)"},
        {value: "./strides/park1.json", text: "Parkinson's (Most Severe)"},
        {value: "./strides/als1.json", text: "ALS (Earliest)"},
        {value: "./strides/als3.json", text: "ALS (Median)"},
        {value: "./strides/als9.json", text: "ALS (Later)"},
        {value: "./strides/hunt9.json", text: "Huntington's (Least Severe)"},
        {value: "./strides/hunt1.json", text: "Huntington's (Median)"},
        {value: "./strides/hunt19.json", text: "Huntington's (Severe)"}
    ])
    .enter()
    .append("option")
    .attr("value", d => d.value)
    .text(d => d.text);

// Update the existing file selector to consider reference
d3.select("#file-selector").on("change", function() {
    let selectedFile = d3.select(this).property("value");
    let selectedReference = d3.select("#reference-file").property("value");
    loadAndAnimateData(selectedFile, selectedReference === "none" ? null : selectedReference);
});

// Handle dropdown change
d3.select("#file-selector").on("change", function() {
    let selectedFile = d3.select(this).property("value");
    loadAndAnimateData(selectedFile);
});

// ** walking path proto **

let path1, path2;
let data1, data2;
let isAnimating1 = false;
let isAnimating2 = false;
let index = 0; // Track the current index for animation
let animationTimeout; // Track the animation timeout for interrupting
let timerInterval1, timerInterval2;

function startTimer(timerId) {
    const timerElement = document.getElementById(timerId);
    let seconds = 0;
    timerElement.textContent = "00:00";
    timerElement.style.display = "inline"; // Show the timer

    return setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
    }, 1000);
}

function resetTimer(timerId, timerInterval) {
    clearInterval(timerInterval);
    const timerElement = document.getElementById(timerId);
    timerElement.textContent = "00:00";
    timerElement.style.display = "none"; // Hide the timer
}

// debounce function to limit the rate of execution of a function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function updateDurationLabel(value) {
    document.getElementById('duration-label').textContent = value;
}
window.updateDurationLabel = updateDurationLabel;

function loadFootprints(file1, file2) {
    const duration = 20;

    // Stop ongoing animation and reset index immediately
    if (isAnimating1) {
        isAnimating1 = false;
        clearTimeout(animationTimeout); // Clear any ongoing animation timeout
    }
    if (isAnimating2) {
        isAnimating2 = false;
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
        data1 = d1;
        data2 = d2;

        // Create the walking path visuals without animation
        path1 = createWalkingPath("#walking-path1", data1, "blue", "green", duration);
        path2 = createWalkingPath("#walking-path2", data2, "blue", "green", duration);

        // Reset the animation state to ensure it doesn't play automatically after dropdown change
        isAnimating1 = false;
        isAnimating2 = false;
    });
}

function createWalkingPath(containerId, data, footColorLeft, footColorRight, duration) {
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([0, 5]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 0.2]).range([height, 0]);

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
        .text(`Distance (m)`);

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
    if (isAnimating1 || isAnimating2) return; // Prevent starting the animation if it's already running

    if (!data1 || !data2) return;

    isAnimating1 = true;
    isAnimating2 = true;

    resetTimer('timer1', timerInterval1); // Reset the timer for the first graph
    resetTimer('timer2', timerInterval2); // Reset the timer for the second graph
    timerInterval1 = startTimer('timer1'); // Start the timer for the first graph
    timerInterval2 = startTimer('timer2'); // Start the timer for the second graph

    let index1 = 0;
    let index2 = 0;
    
    function updateFootPositions() {

        if (index1 < data1.length && data1[index1].x_left <= 5 && data1[index1].x_right <= 5) {
            const currentTime1 = data1[index1].time;

            // Add ghosting effect for left foot
            d3.select(path1.leftFoot.node().parentNode).append("circle")
                .attr("r", 4)
                .attr("fill", "blue") // Color for the left foot
                .attr("cx", path1.xScale(data1[index1].x_left))
                .attr("cy", path1.yScale(data1[index1].y_left))
                .style("opacity", 1)
                .transition()
                .duration(1000) // Duration for the ghost to fade out
                .style("opacity", 0)
                .remove();

            // Add ghosting effect for right foot
            d3.select(path1.rightFoot.node().parentNode).append("circle")
                .attr("r", 4)
                .attr("fill", "green") // Color for the right foot
                .attr("cx", path1.xScale(data1[index1].x_right))
                .attr("cy", path1.yScale(data1[index1].y_right))
                .style("opacity", 1)
                .transition()
                .duration(1000) // Duration for the ghost to fade out
                .style("opacity", 0)
                .remove();

            // Update positions for first dataset
            path1.leftFoot.transition()
                .duration(currentTime1)
                .attr("cx", path1.xScale(data1[index1].x_left))
                .attr("cy", path1.yScale(data1[index1].y_left));

            path1.rightFoot.transition()
                .duration(currentTime1)
                .attr("cx", path1.xScale(data1[index1].x_right))
                .attr("cy", path1.yScale(data1[index1].y_right));

            index1++;
        } else {
            isAnimating1 = false;  // Animation has finished for graph1, set flag to false
            clearInterval(timerInterval1);

            // Add annotation for the time to reach 5 units
            const timerElement1 = document.getElementById('timer1');
            const annotationElement1 = document.getElementById('annotation1');
            annotationElement1.textContent = `Time to reach 5 meters: ${timerElement1.textContent}`;
        }
        if (index2 < data2.length && data2[index2].x_left <= 5 && data2[index2].x_right <= 5) {
            const currentTime2 = data2[index2].time;

            // Add ghosting effect for left foot
            d3.select(path2.leftFoot.node().parentNode).append("circle")
                .attr("r", 4)
                .attr("fill", "blue") // Color for the left foot
                .attr("cx", path2.xScale(data2[index2].x_left))
                .attr("cy", path2.yScale(data2[index2].y_left))
                .style("opacity", 1)
                .transition()
                .duration(1000) // Duration for the ghost to fade out
                .style("opacity", 0)
                .remove();

            // Add ghosting effect for right foot
            d3.select(path2.rightFoot.node().parentNode).append("circle")
                .attr("r", 4)
                .attr("fill", "green") // Color for the right foot
                .attr("cx", path2.xScale(data2[index2].x_right))
                .attr("cy", path2.yScale(data2[index2].y_right))
                .style("opacity", 1)
                .transition()
                .duration(1000) // Duration for the ghost to fade out
                .style("opacity", 0)
                .remove();

            // Update positions for second dataset
            path2.leftFoot.transition()
                .duration(currentTime2)
                .attr("cx", path2.xScale(data2[index2].x_left))
                .attr("cy", path2.yScale(data2[index2].y_left));

            path2.rightFoot.transition()
                .duration(currentTime2)
                .attr("cx", path2.xScale(data2[index2].x_right))
                .attr("cy", path2.yScale(data2[index2].y_right));

            index2++;
        } else {
            isAnimating2 = false;  // Animation has finished for graph2, set flag to false
            clearInterval(timerInterval2);

            // Add annotation for the time to reach 5 units
            const timerElement2 = document.getElementById('timer2');
            const annotationElement2 = document.getElementById('annotation2');
            annotationElement2.textContent = `Time to reach 5 meters: ${timerElement2.textContent}`;
        }

        if (isAnimating1 || isAnimating2) {
            setTimeout(updateFootPositions, 1);
        } 

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
    resetAnimationState(); // Reset the animation state
    resetTimer('timer1', timerInterval1); // Reset the timer for the first graph
    resetTimer('timer2', timerInterval2); // Reset the timer for the second graph
});

document.getElementById('file2').addEventListener('change', () => {
    updateGraphLabels();
    const file1 = document.getElementById('file1').value;
    const file2 = document.getElementById('file2').value;
    loadFootprints(file1, file2);  // Reload without animation
    resetAnimationState(); // Reset the animation state
    resetTimer('timer1', timerInterval1); // Reset the timer for the first graph
    resetTimer('timer2', timerInterval2); // Reset the timer for the second graph
});

// Load default data on page load (no animation)
loadFootprints("./gait_coordinates/control14_low.json", "./gait_coordinates/control12_high.json");

// Set dropdown values to match loaded files
document.getElementById('file1').value = './gait_coordinates/control14_low.json';
document.getElementById('file2').value = './gait_coordinates/control12_high.json';

updateGraphLabels();
updateNarrativeText('Use the controls below to compare the walking paths of different diseases.');

window.startAnimation = startAnimation;

// Function to reset the animation state
function resetAnimationState() {
    isAnimating1 = false;
    isAnimating2 = false;
    index = 0;
    clearTimeout(animationTimeout);
}


//Main Visualization
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
            if (labelText === "Healthy Person" || 
                labelText === "Healthy Person - Slow Pace" || 
                labelText === "Healthy Person - Normal Pace" || 
                labelText === "Healthy Person - Fast Pace") {
                footClass = "healthy";
            } 
            else if (labelText === "Parkinson's Disease") {
                footClass = "parkinsons";
            }
            else if (labelText === "Parkinson's - Early Stage") {
                footClass = "parkinsons-early";
            }
            else if (labelText === "Parkinson's - Mid Stage") {
                footClass = "parkinsons-mid";
            }
            else if (labelText === "Parkinson's - Advanced Stage") {
                footClass = "parkinsons-advanced";
            }
            else if (labelText === "Huntington's Disease") {
                footClass = "huntingtons";
            }
            else if (labelText === "Huntington's - Early Stage") {
                footClass = "huntingtons-early";
            }
            else if (labelText === "Huntington's - Mid Stage") {
                footClass = "huntingtons-mid";
            }
            else if (labelText === "Huntington's - Advanced Stage") {
                footClass = "huntingtons-advanced";
            }
            else if (labelText === "Amyotrophic Lateral Sclerosis (ALS)") {
                footClass = "als";
            }
            else if (labelText === "ALS - Early Stage") {
                footClass = "als-early";
            }
            else if (labelText === "ALS - Mid Stage") {
                footClass = "als-mid";
            }
            else if (labelText === "ALS - Advanced Stage") {
                footClass = "als-advanced";
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
    "Changes in Gait take many variations whether it's simply walking slower, lack of an arm swing on a single side, shuffling, a forward lean causing quicker steps, and more.",
    "For example, Parkingson's has a gait named after it.\n Parkingsonian Gait is characterized by slow, little, shuffling steps with the body bent forward.",
    "But there's no cut and dry way to distinguish which disease is being developed. Even within Parkingson's Disease, there are differences in Gait regardless of stage as seen between the mid and advanced stages.",
    "The same can be said for other neurological disorders such as Amyotrophic Lateral Sclerosis (ALS).",
    "Therefore, Gait analysis can be a window to a person's overall health and can be used to detect early signs of neurological disorders alongside other symptoms such as: memory loss, behavioral changes, and speech/cognitive impairments.",
    "Catching these early signs can lead to a huge difference with early intervention and treatment to slow neurodegeneration within loved ones."
];

const files = [
    "./gait_coordinates/control1_coord.json",
    "./gait_coordinates/park1_high.json",
    "./gait_coordinates/hunt1_coord.json",
    "./gait_coordinates/als1_coord.json",
    "./gait_coordinates/park2_low.json",
    "./gait_coordinates/park11_mid.json",
    "./gait_coordinates/als1_low.json",
    "./gait_coordinates/als3_mid.json",
    "./gait_coordinates/als9_high.json",
    "./gait_coordinates/control14_low.json",
    "./gait_coordinates/control9_mid.json", 
    "./gait_coordinates/control12_high.json",
    "./gait_coordinates/hunt9_low.json",
    "./gait_coordinates/hunt1_mid.json",
    "./gait_coordinates/hunt19_high.json"
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
    "Amyotrophic Lateral Sclerosis (ALS)",
    "Parkinson's - Early Stage",
    "Parkinson's - Mid Stage",
    "Parkinson's - Advanced Stage",
    "ALS - Early Stage",
    "ALS - Mid Stage",
    "ALS - Advanced Stage",
    "Healthy Person - Slow Pace",
    "Healthy Person - Normal Pace",
    "Healthy Person - Fast Pace",
    "Huntington's - Early Stage",
    "Huntington's - Mid Stage",
    "Huntington's - Advanced Stage"
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
            .style("top", "100px")
            .style("right", "80px")
            .style("transform", "translate(0, 0)");
        d3.select("#combined-walking-path").style("transform", "translateY(-75px)");
        d3.select("#second-walking-path").style("opacity", 1);
        animateWalkingPaths(files.slice(0, 2), svgIds.slice(0, 2), 0, labelTexts.slice(0, 2));
    } else if (step === 4) {
        d3.select("#description").text(descriptions[3]);
        d3.select("#combined-walking-path").style("transform", "translateY(-175px)");
        d3.select("#second-walking-path").style("transform", "translateY(-100px)");
        d3.select("#third-walking-path").style("opacity", 1);
        animateWalkingPaths(files.slice(0, 3), svgIds.slice(0, 3), 0, labelTexts.slice(0, 3));
    } else if (step === 5) {
        d3.select("#description").text(descriptions[4]);
        d3.select("#combined-walking-path").style("transform", "translateY(-275px)");
        d3.select("#second-walking-path").style("transform", "translateY(-200px)");
        d3.select("#third-walking-path").style("transform", "translateY(-100px)");
        d3.select("#fourth-walking-path").style("opacity", 1);
        // Just use the first 4 files that match with your 4 SVG IDs
        animateWalkingPaths(files.slice(0, 4), svgIds, 0, labelTexts.slice(0, 4));
    } else if (step === 6) {
        // Update the description to talk about Huntington's disease
        d3.select("#description").text(descriptions[5]);
        
        // Reset transformations and set proper vertical spacing between graphs
        d3.select("#second-walking-path") // Parkingon's low
            .style("transform", "translateY(-200px)")
            .style("opacity", 1);
        
        d3.select("#third-walking-path") // Parkingsons's mid stage
            .style("transform", "translateY(-100px)") // Use positive value to move DOWN
            .style("opacity", 1);
        
        d3.select("#fourth-walking-path") // Parkingson's advanced stage
            .style("transform", "translateY(0px)") // Use positive value to move DOWN
            .style("opacity", 1);
        
        // Use the Huntington's disease files
        const parkFiles = [files[4], files[5], files[1]]; // low, mid, and advanced stages
        const parkLabels = [labelTexts[4], labelTexts[5], labelTexts[6]]; // Labels for these stages
        
        // Animate the three Huntington's cases with their updated positions
        animateWalkingPaths([parkFiles[0]], ["#second-walking-path"], 0, [parkLabels[0]]);
        animateWalkingPaths([parkFiles[1]], ["#third-walking-path"], 0, [parkLabels[1]]);
        animateWalkingPaths([parkFiles[2]], ["#fourth-walking-path"], 0, [parkLabels[2]]);
    } else if (step === 7) { 
        //change description
        d3.select("#description").text(descriptions[6]);
    }  else if (step === 8) { 
        // Reset graphs and change to alzheimer's
        d3.select("#second-walking-path") // Als's low
            .style("transform", "translateY(-200px)")
            .style("opacity", 1);
        
        d3.select("#third-walking-path") // Als's mid stage
            .style("transform", "translateY(-100px)") 
            .style("opacity", 1);
        
        d3.select("#fourth-walking-path") // Als's advanced stage
            .style("transform", "translateY(0px)") 
            .style("opacity", 1);
        
        // Use the Als's disease files
        const alsFiles = [files[6], files[7], files[8]]; // low, mid, and advanced stages
        const alsLabels = [labelTexts[7], labelTexts[8], labelTexts[9]]; // Labels for these stages
        
        // Animate the three Huntington's cases with their updated positions
        animateWalkingPaths([alsFiles[0]], ["#second-walking-path"], 0, [alsLabels[0]]);
        animateWalkingPaths([alsFiles[1]], ["#third-walking-path"], 0, [alsLabels[1]]);
        animateWalkingPaths([alsFiles[2]], ["#fourth-walking-path"], 0, [alsLabels[2]]);
        d3.select("#description").text(descriptions[7]);
    } else if (step === 9) {
        // Final comparison view - comprehensive comparison
        d3.select("#description").text(descriptions[8]);
    
        // Shift existing graphs to the left
        d3.select("#combined-walking-path")
            .style("transform", "translate(-300px, -275px)");
        d3.select("#second-walking-path")
            .style("transform", "translate(-300px, -200px)")  // Move left and maintain vertical position
            .style("opacity", 1);
        
        d3.select("#third-walking-path")
            .style("transform", "translate(-300px, -100px)")  // Move left and maintain vertical position
            .style("opacity", 1);
        
        d3.select("#fourth-walking-path")
            .style("transform", "translate(-300px, 0px)")  // Move left and maintain vertical position
            .style("opacity", 1);
        
        // Create new SVG elements for the right side if they don't exist
        if (!document.querySelector("#fifth-walking-path")) {
            d3.select("#visualization-container")
                .append("svg")
                .attr("id", "fifth-walking-path")
                .attr("class", "walking-path-svg")
                .style("opacity", 0);  // Start hidden
        }
        
        if (!document.querySelector("#sixth-walking-path")) {
            d3.select("#visualization-container")
                .append("svg")
                .attr("id", "sixth-walking-path")
                .attr("class", "walking-path-svg")
                .style("opacity", 0);  // Start hidden
        }
        
        if (!document.querySelector("#seventh-walking-path")) {
            d3.select("#visualization-container")
                .append("svg")
                .attr("id", "seventh-walking-path")
                .attr("class", "walking-path-svg")
                .style("opacity", 0);  // Start hidden
        }
    
        if (!document.querySelector("#eighth-walking-path")) {
            d3.select("#visualization-container")
                .append("svg")
                .attr("id", "eighth-walking-path")
                .attr("class", "walking-path-svg")
                .style("opacity", 0);  // Start hidden
        }
        
        // Position and show the new SVGs on the right side
        d3.select("#fifth-walking-path")
            .style("transform", "translate(300px, -300px)")  // Position on the right at top
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        d3.select("#sixth-walking-path")
            .style("transform", "translate(300px, -200px)")  // Position on the right
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        d3.select("#seventh-walking-path")
            .style("transform", "translate(300px, -100px)")  // Position on the right
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        d3.select("#eighth-walking-path")
            .style("transform", "translate(300px, 0px)")  // Position on the right at bottom
            .transition()
            .duration(500)
            .style("opacity", 1);
        
        // Create arrays for the new SVG IDs and display healthy people's gaits on the right
        const rightSvgIds = [
            "#fifth-walking-path",
            "#sixth-walking-path",
            "#seventh-walking-path",
            "#eighth-walking-path"
        ];
        
        // Use healthy person files for different paces
        const lastFiles = [files[0], files[12], files[13], files[14]]; // Various healthy gaits
        const lastLabels = [labelTexts[0], labelTexts[13], labelTexts[14], labelTexts[15]]; // Healthy labels
        
        // Animate the healthy walking patterns on the right side
        animateWalkingPaths([lastFiles[0]], [rightSvgIds[0]], 0, [lastLabels[0]]);
        animateWalkingPaths([lastFiles[1]], [rightSvgIds[1]], 0, [lastLabels[1]]);
        animateWalkingPaths([lastFiles[2]], [rightSvgIds[2]], 0, [lastLabels[2]]);
        animateWalkingPaths([lastFiles[3]], [rightSvgIds[3]], 0, [lastLabels[3]]);
    } else if (step === 10) {
        // last description
        d3.select("#description").text(descriptions[9]);
        // Delay the scroll prompt appearance by 3 seconds (3000 milliseconds)
        setTimeout(() => {
            d3.select("#scroll-prompt")
                .transition()
                .duration(1000)  // Fade in over 1 second
                .style("opacity", 1);
        }, 1000);  // 3-second delay
    } else {
        d3.select("#visualization-container").style("pointer-events", "none");
    }
});
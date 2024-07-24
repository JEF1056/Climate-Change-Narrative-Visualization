document.addEventListener("DOMContentLoaded", function() {
    const margin = {top: 20, right: 30, bottom: 50, left: 70};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#visualization-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.value));

    let currentScene = 1;

    function setupScene(data, title, yLabel, annotations) {
        x.domain(d3.extent(data, d => d.Year));
        y.domain([d3.min(data, d => d.value) - 1, d3.max(data, d => d.value) + 1]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#28a745")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "axis-label")
            .text(yLabel);

        svg.append("text")
            .attr("transform", `translate(${width / 2},${height + margin.top + 20})`) // Adjusted y position
            .attr("class", "axis-label")
            .text("Year");

        document.getElementById("chart-title").innerText = title;

        annotations.forEach(annotation => {
            // Calculate positions
            const xPos = x(annotation.Year);
            const yPos = y(annotation.value);

            // Annotation line coordinates
            const lineEndX = annotation.xEnd || (annotation.direction === 'left' ? xPos - 30 : xPos + 30);
            const lineEndY = annotation.yEnd || (annotation.direction === 'up' ? yPos - 30 : (annotation.direction === 'down' ? yPos + 30 : yPos));

            // Create annotation line
            svg.append("line")
                .attr("x1", xPos)
                .attr("y1", yPos)
                .attr("x2", lineEndX)
                .attr("y2", lineEndY)
                .attr("class", "annotation-line");

            // Create annotation text
            svg.append("text")
                .attr("x", lineEndX)
                .attr("y", lineEndY - 10) // Slightly adjust y for vertical alignment
                .attr("class", "annotation")
                .text(annotation.text)
                .style("text-anchor", annotation.direction === 'left' ? "end" : "start")
                .style("dominant-baseline", "middle");
        });
    }

    function processCSV(file, yLabel, title, annotations) {
        d3.csv(file, d3.autoType).then(data => {
            data.forEach(d => d.value = +d[yLabel]);
            setupScene(data.map(d => ({Year: +d.Year, value: d.value})), title, yLabel, annotations);
        });
    }

    function updateScene(scene) {
        svg.selectAll("*").remove();
        let annotations, file, yLabel, title;
        if (scene === 1) {
            file = "processed_temperature.csv";
            yLabel = "Temperature (°C)";
            title = "Global Temperature Trends";
            annotations = [
                {Year: 2023, value: 14.8, direction: 'left', text: "Recent high temperature"},
                {Year: 1960, value: 13.9, direction: 'up', text: "Starting point, also the lowest point"}
            ];
            document.getElementById("scene-description").innerText = "This scene highlights global temperature trends over the past decades, showing the steady rise in temperature anomalies.";
        } else if (scene === 2) {
            file = "processed_co2.csv";
            yLabel = "CO2";
            title = "CO2 Emissions Over Time";
            annotations = [
                {Year: 2023, value: 32, direction: 'left', text: "Peak CO2 levels"},
                {Year: 1960, value: 10, direction: 'up', text: "Initial CO2 levels"}
            ];
            document.getElementById("scene-description").innerText = "This scene illustrates the rise in CO2 emissions over the past decades. Notice how the increase in CO2 emissions is correlated with the increase in global temperatures.";
        } else if (scene === 3) {
            file = "processed_ice.csv";
            yLabel = "IceExtent";
            title = "Ice Extent Over Time";
            annotations = [
                {Year: 1960, value: 16, direction: 'up', text: "Initial ice extent"},
                {Year: 2023, value: 14.7, direction: 'left', text: "Recent ice extent"}
            ];
            document.getElementById("scene-description").innerText = "This scene shows the reduction in ice extent over the past decades. Once again, notice how the decrease in the ice extent is mirrored by the increase in both global temperatures and CO2 levels.";
        }
        processCSV(file, yLabel, title, annotations);
    }

    document.getElementById("scene1-btn").addEventListener("click", () => {
        currentScene = 1;
        updateScene(currentScene);
    });

    document.getElementById("scene2-btn").addEventListener("click", () => {
        currentScene = 2;
        updateScene(currentScene);
    });

    document.getElementById("scene3-btn").addEventListener("click", () => {
        currentScene = 3;
        updateScene(currentScene);
    });

    updateScene(currentScene);
});
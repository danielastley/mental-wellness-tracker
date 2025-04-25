document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const storageKey = 'wellnessCheckins'; // Keep key name in case needed elsewhere, but data comes from server now
    const canvasElement = document.getElementById('moodRadarChart');
    const chartContainer = document.getElementById('chartContainer');
    const noDataMessage = document.getElementById('noDataMessage');
    const timelineDotsContainer = document.getElementById('timelineDots');
    const alertMessageDiv = document.getElementById('alertMessage');
    const timelineContainer = document.getElementById('timelineContainer');

    // --- Global Variables ---
    let wellnessChart = null; // Variable to hold the Chart instance
    let checkins = []; // To store loaded check-ins

    // --- Utility Functions ---
    // Function to map 0-100 mood value to 1-5 scale for dot color CSS class
    function mapValueToDotColorScale(value) {
        const val = parseInt(value); // Ensure it's a number
        if (isNaN(val)) return 3; // Fallback if value is not a number
        if (val <= 15) return 1; // 0-15 -> 1
        if (val <= 35) return 2; // 16-35 -> 2
        if (val <= 65) return 3; // 36-65 -> 3 (Wider range for neutral)
        if (val <= 85) return 4; // 66-85 -> 4
        if (val > 85) return 5;  // 86-100 -> 5
        return 3; // Default fallback
    }

    // --- Function to Check for Alerts (Using 0-100 scale thresholds) ---
    function checkAlerts(checkinData) {
        if (!alertMessageDiv || !checkinData) {
             console.log("Alert check skipped: Missing alertDiv or checkinData");
             return;
        }

        let alertText = "";
        // Use original sleep_hours, but mood/energy/anxiety are now 0-100
        const { mood, energy, anxiety, sleep_hours } = checkinData;

        // Adjusted thresholds for 0-100 scale
        const maniaRisk = (sleep_hours !== undefined && sleep_hours <= 3) && energy >= 75; // e.g., <=3 hrs sleep, >=75 energy
        const depressionRisk = mood <= 20 && energy <= 30; // e.g., <=20 mood, <=30 energy
        const highAnxiety = anxiety >= 75; // e.g., >=75 anxiety

        // Build the alert message
        if (maniaRisk && depressionRisk) {
            alertText = "Patterns suggest potential risk for a mixed state. Please review your data carefully.";
        } else if (maniaRisk) {
            alertText = "Patterns suggest potential mania risk (low sleep, high energy). Please review your data carefully.";
        } else if (depressionRisk) {
            alertText = "Patterns suggest potential depression risk (low mood, low energy). Please review your data carefully.";
        }
        // Optional: Alert for high anxiety alone
        // else if (highAnxiety) { alertText = "High level of anxiety/irritability detected. Remember coping strategies."; }

        // Show or hide the alert div
        if (alertText) {
            alertMessageDiv.textContent = alertText;
            alertMessageDiv.style.display = 'block';
             console.log("Alert displayed:", alertText);
        } else {
            alertMessageDiv.style.display = 'none';
             console.log("No alert conditions met for current data.");
        }
    }


    // --- Function to Update the Chart (Using 0-100 scale data) ---
    function updateChart(checkinData, index) {
        if (!wellnessChart || !checkinData) {
            console.error("UpdateChart skipped: Missing chart instance or checkinData");
            return; // Safety check
        }
        console.log(`Updating chart for index ${index} with 0-100 data`);

        // Format date for display (can customize later for timezone)
        const chartDate = new Date(checkinData.timestamp).toLocaleDateString();

        // Update the USER'S data dataset (index 0) - Use 0-100 values
        // Plotting Sleep Restfulness instead of Sleep Hours
        wellnessChart.data.datasets[0].data = [
            checkinData.mood,            // 0-100
            checkinData.energy,          // 0-100
            checkinData.anxiety,         // 0-100
            checkinData.sleep_restfulness, // 0-100
            checkinData.focus            // 0-100
        ];
        wellnessChart.data.datasets[0].label = `Check-in: ${chartDate}`;

        // Refresh the chart
        wellnessChart.update();
        console.log("wellnessChart.update() called.");

        // Update selected dot style
        document.querySelectorAll('.timeline-dot').forEach((dot) => {
            // Ensure comparison uses numbers if needed, dataset.index is string
            dot.classList.toggle('selected', parseInt(dot.dataset.index) === index);
        });
         console.log(`Selected class updated for dot index ${index}.`);

        // Check for alerts based on the currently displayed data
        checkAlerts(checkinData);
    }


    // --- Function to Create Timeline Dots (Mapping mood for color) ---
    function createTimelineDots(checkinsData) {
        if (!timelineDotsContainer) {
            console.error("Timeline dots container not found! Cannot create dots.");
            return;
        }
        // console.log(`Inside createTimelineDots. Found container:`, timelineDotsContainer);
        timelineDotsContainer.innerHTML = ''; // Clear any existing dots
        // console.log(`Cleared timeline container. Starting loop for ${checkinsData.length} checkins.`);

        checkinsData.forEach((checkin, index) => {
            // console.log(`Looping for index ${index}, checkin mood (0-100): ${checkin.mood}`);

            const dot = document.createElement('span');
            dot.classList.add('timeline-dot');
            dot.dataset.index = index; // Store index as string
            // Map 0-100 mood back to 1-5 scale JUST for the color class
            dot.dataset.mood = mapValueToDotColorScale(checkin.mood);
            // console.log(` -> Created dot element, data-mood set to: ${dot.dataset.mood}`);

            // Add tooltip SPAN INSIDE the dot SPAN
            const tooltip = document.createElement('span');
            tooltip.classList.add('tooltip-text');
            tooltip.textContent = new Date(checkin.timestamp).toLocaleDateString(); // Set tooltip text to date
            dot.appendChild(tooltip);
            // console.log(` -> Added tooltip to dot`);

            // Add click listener to the DOT
            dot.addEventListener('click', () => {
                // console.log(`Dot clicked! Index: ${index}`);
                updateChart(checkin, index); // Pass the correct checkin object and index
            });

            // Append the dot (which contains the tooltip) to the container
            try {
                timelineDotsContainer.appendChild(dot);
                // console.log(` -> Appended dot ${index} to container.`);
            } catch (error) {
                console.error(` -> FAILED to append dot ${index} to container:`, error);
            }
        });

        // console.log(`Finished loop in createTimelineDots. Final container HTML:`, timelineDotsContainer.innerHTML);
        console.log(`Timeline dots created. Total dots expected: ${checkinsData.length}. Dots in DOM: ${timelineDotsContainer.children.length}`);
    }


    // --- Main Logic (Initialization - Loads data from server) ---
    async function initializeDashboard() { // Make function async to use await
        console.log("--- Running initializeDashboard ---");

        // --- 1. Load Data FROM SERVER ---
        console.log("Attempting to fetch check-ins from server...");
        try {
            // Fetch data from the PHP script
            const response = await fetch('get_checkins.php'); // Assumes PHP is in the same directory

            // Check for HTTP errors (like 404 Not Found, 500 Server Error)
            if (!response.ok) {
                const errorText = await response.text().catch(() => `Status ${response.status}`); // Try get error text
                throw new Error(`Server responded with: ${errorText}`);
            }

            // Parse the JSON response body
            checkins = await response.json();

            // Basic validation: Ensure we received an array
            if (!Array.isArray(checkins)) {
                 console.warn("Data received from server is not an array. Resetting to empty.");
                 checkins = [];
            }

            console.log(`Fetched ${checkins.length} check-ins from server.`);
            // console.log("Parsed checkins data:", checkins); // Log if needed for debugging

        } catch (error) {
            console.error("Error fetching check-in data:", error);
            // Display a user-friendly error message on the page
            if (noDataMessage) {
                 noDataMessage.textContent = `Error loading data: ${error.message}. Please try refreshing.`;
                 noDataMessage.style.display = 'block';
                 noDataMessage.style.color = '#dc3545'; // Make error message red
            }
            // Hide chart and timeline containers if data loading failed
            if (chartContainer) chartContainer.style.display = 'none';
            if (timelineContainer) timelineContainer.style.display = 'none';
            return; // Stop initialization if fetch fails
        }
        // --- END OF FETCH LOGIC ---


        // --- 2. Check if Data Array is Empty ---
        if (checkins.length === 0) {
            console.log("Condition met: No check-ins received from server.");
            if (chartContainer) chartContainer.style.display = 'none';
            if (timelineContainer) timelineContainer.style.display = 'none';
            // Show the standard "No data" message if fetch succeeded but returned empty
            if (noDataMessage) {
                noDataMessage.textContent = 'No check-in data found yet. Go make your first entry!';
                noDataMessage.style.display = 'block';
                noDataMessage.style.color = '#777'; // Reset color to default
            }
            return; // Stop execution
        } else {
            // Data exists, ensure elements are visible
            console.log("Condition met: Check-ins found via fetch.");
            if (chartContainer) chartContainer.style.display = 'block';
            if (timelineContainer) timelineContainer.style.display = 'block';
            if (noDataMessage) noDataMessage.style.display = 'none'; // Hide 'no data' message
        }

        // --- 3. Verify Core HTML Elements Exist ---
        console.log("Canvas element:", canvasElement);
        console.log("Timeline dots container:", timelineDotsContainer);
        console.log("Alert message div:", alertMessageDiv);
        if (!canvasElement || !timelineDotsContainer || !alertMessageDiv || !timelineContainer) {
            console.error("CRITICAL: One or more required HTML elements not found. Dashboard cannot render properly.");
            // Optionally display an error message to the user here too
            return;
        }


        // --- 4. Get Latest Check-in for Initial View ---
        const latestCheckin = checkins[checkins.length - 1];
        const latestIndex = checkins.length - 1;
        console.log("Latest checkin for initial view (index " + latestIndex + "):", latestCheckin);


        // --- 5. Prepare Chart Data & Options (Using 0-100 scale) ---
        const baselineData = { // Baseline for 0-100 scale
            mood: 50, energy: 50, anxiety: 30, sleep_restfulness: 75, focus: 50
        };
        // console.log("Baseline data (0-100 scale):", baselineData);

        const initialChartData = {
            labels: ['Mood', 'Energy', 'Anxiety', 'Restfulness', 'Focus'], // Labels match plotted data
            datasets: [
                { // Dataset 0: User's data (populated by updateChart)
                    label: '', data: [], fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)', pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgb(54, 162, 235)',
                    order: 1
                },
                { // Dataset 1: Baseline data
                    label: 'Baseline (Example)',
                    data: [ baselineData.mood, baselineData.energy, baselineData.anxiety, baselineData.sleep_restfulness, baselineData.focus ],
                    fill: false, borderColor: 'rgba(108, 117, 125, 0.5)', borderDash: [5, 5],
                    pointRadius: 0, pointHitRadius: 0, order: 2
                }
            ]
        };
        // console.log("Initial chart data object prepared:", initialChartData);

        // Chart options using 0-100 scale
        const chartOptions = {
            scales: {
                r: { // Radial axis
                    angleLines: { display: true },
                    suggestedMin: 0,    // Scale starts at 0
                    suggestedMax: 100,  // Scale ends at 100
                    ticks: { stepSize: 20 }, // Ticks every 20 units
                    pointLabels: { font: { size: 14 } }
                }
            },
            plugins: { // Keep tooltip/legend filters
                legend: { position: 'top' },
                tooltip: {
                    enabled: true,
                    filter: function(tooltipItem) { return tooltipItem.datasetIndex === 0; }
                }
            },
            animation: false // Disable animation for faster updates on click
        };
        // console.log("Chart options object prepared (0-100 scale):", chartOptions);


        // --- 6. Create or Update the Chart Instance ---
        // Destroy existing chart if page is reloaded dynamically
        if (wellnessChart) {
             console.log("Destroying existing chart instance before creating new one.");
             wellnessChart.destroy();
        }

        console.log("Attempting to create Chart instance...");
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
            console.error("Failed to get 2D context from canvas! Cannot create chart.");
            return; // Stop if no context
        }

        try {
            wellnessChart = new Chart(ctx, {
                type: 'radar',
                data: initialChartData, // Start with empty user data
                options: chartOptions
            });
            console.log("Chart instance CREATED successfully.");

            // Draw the initial chart state with the latest data
            console.log("Attempting initial chart update...");
            updateChart(latestCheckin, latestIndex); // Populate user data, update labels, check alerts
            console.log("Initial chart update process completed.");

        } catch (chartError) {
             console.error("!!! ERROR Creating Chart.js instance:", chartError);
             // Display error message to user?
             return; // Stop if chart creation fails
        }


        // --- 7. Create the Timeline Dots ---
        console.log("Attempting to create timeline dots...");
        createTimelineDots(checkins); // Uses the checkins array fetched from server
        console.log("Timeline dots creation process completed.");

        console.log("--- initializeDashboard finished ---");
    } // <-- End of initializeDashboard async function


    // --- Run Initialization ---
    initializeDashboard();


}); // <-- End of DOMContentLoaded listener
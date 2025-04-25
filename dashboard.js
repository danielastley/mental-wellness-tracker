document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections (Keep as is) ---
    const storageKey = 'wellnessCheckins';
    const canvasElement = document.getElementById('moodRadarChart');
    const chartContainer = document.getElementById('chartContainer');
    const noDataMessage = document.getElementById('noDataMessage');
    const timelineDotsContainer = document.getElementById('timelineDots');
    const alertMessageDiv = document.getElementById('alertMessage');
    const timelineContainer = document.getElementById('timelineContainer');

    // --- Global Variables (Keep as is) ---
    let wellnessChart = null;
    let checkins = [];

    // --- Utility Functions ---
    // REMOVED: normalizeSleepHours (no longer directly plotted)

    // NEW: Function to map 0-100 mood value to 1-5 scale for dot color
    function mapValueToDotColorScale(value) {
        const val = parseInt(value);
        if (val <= 15) return 1;
        if (val <= 35) return 2;
        if (val <= 65) return 3;
        if (val <= 85) return 4;
        if (val > 85) return 5;
        return 3; // Default
    }

    // --- Function to Check for Alerts (MODIFIED thresholds) ---
    function checkAlerts(checkinData) {
        if (!alertMessageDiv || !checkinData) {
             console.log("Alert check skipped: Missing alertDiv or checkinData");
             return;
        }

        let alertText = "";
        // Use original sleep_hours for checks, but mood/energy/anxiety are now 0-100
        const { mood, energy, anxiety, sleep_hours } = checkinData;

        // Adjusted thresholds for 0-100 scale
        const maniaRisk = (sleep_hours !== undefined && sleep_hours <= 3) && energy >= 75; // e.g., <=3 hrs sleep, >=75 energy
        const depressionRisk = mood <= 20 && energy <= 30; // e.g., <=20 mood, <=30 energy
        const highAnxiety = anxiety >= 75; // e.g., >=75 anxiety

        // Build the alert message (logic remains same)
        if (maniaRisk && depressionRisk) {
            alertText = "Patterns suggest potential risk for a mixed state. Please review your data carefully.";
        } else if (maniaRisk) {
            alertText = "Patterns suggest potential mania risk (low sleep, high energy). Please review your data carefully.";
        } else if (depressionRisk) {
            alertText = "Patterns suggest potential depression risk (low mood, low energy). Please review your data carefully.";
        }
        // Optional: Alert for high anxiety alone
        // else if (highAnxiety) { alertText = "High level of anxiety/irritability detected."; }

        // Show or hide the alert div (logic remains same)
        if (alertText) {
            alertMessageDiv.textContent = alertText;
            alertMessageDiv.style.display = 'block';
             console.log("Alert displayed:", alertText);
        } else {
            alertMessageDiv.style.display = 'none';
             console.log("No alert conditions met for current data.");
        }
    }


    // --- Function to Update the Chart (MODIFIED data points) ---
    function updateChart(checkinData, index) {
        if (!wellnessChart || !checkinData) {
            console.error("UpdateChart skipped: Missing chart instance or checkinData");
            return;
        }
        console.log(`Updating chart for index ${index} with 0-100 data`);

        // REMOVED: normalizeSleepHours call

        const chartDate = new Date(checkinData.timestamp).toLocaleDateString(); // Can format later for London time

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

        wellnessChart.update();
        console.log("wellnessChart.update() called.");

        // Update selected dot style (logic remains same)
        document.querySelectorAll('.timeline-dot').forEach((dot) => {
            dot.classList.toggle('selected', parseInt(dot.dataset.index) === index);
        });
         console.log(`Selected class updated for dot index ${index}.`);

        checkAlerts(checkinData); // Check alerts on updated data
    }


    // --- Function to Create Timeline Dots (MODIFIED mood mapping for color) ---
    function createTimelineDots(checkinsData) {
        if (!timelineDotsContainer) {
            console.error("Timeline dots container not found! Cannot create dots.");
            return;
        }
        // console.log(`Inside createTimelineDots. Found container:`, timelineDotsContainer); // Optional: Keep logging if needed
        timelineDotsContainer.innerHTML = ''; // Clear any existing dots
        // console.log(`Cleared timeline container. Starting loop for ${checkinsData.length} checkins.`); // Optional logging

        checkinsData.forEach((checkin, index) => {
            // console.log(`Looping for index ${index}, checkin mood (0-100): ${checkin.mood}`); // Optional logging

            const dot = document.createElement('span'); // CREATE A SPAN
            dot.classList.add('timeline-dot');          // ADD THE CLASS
            dot.dataset.index = index;                  // Set index attribute
            dot.dataset.mood = mapValueToDotColorScale(checkin.mood); // Set mood attribute for color

            // console.log(` -> Created dot element, data-mood set to: ${dot.dataset.mood}`); // Optional logging

            // Add tooltip SPAN INSIDE the dot SPAN
            const tooltip = document.createElement('span');
            tooltip.classList.add('tooltip-text');
            tooltip.textContent = new Date(checkin.timestamp).toLocaleDateString(); // Set tooltip text to date
            dot.appendChild(tooltip); // Append tooltip INSIDE dot

            // Add click listener to the DOT
            dot.addEventListener('click', () => {
                // console.log(`Dot clicked! Index: ${index}`); // Optional logging
                updateChart(checkin, index);
            });

            // Append the dot (which contains the tooltip) to the container
            try {
                timelineDotsContainer.appendChild(dot);
                // console.log(` -> Appended dot ${index} to container.`); // Optional logging
            } catch (error) {
                console.error(` -> FAILED to append dot ${index} to container:`, error);
            }
        });

        console.log(`Finished loop in createTimelineDots. Final container HTML:`, timelineDotsContainer.innerHTML);
        console.log(`Total dots expected: ${checkinsData.length}. Dots in DOM: ${timelineDotsContainer.children.length}`);
    }


    // --- Main Logic (Initialization - MODIFIED chart config) ---
    function initializeDashboard() {
        console.log("--- Running initializeDashboard ---");

        // 1. Load Data (Keep as is)
        const checkinsString = localStorage.getItem(storageKey);
        console.log("localStorage raw string:", checkinsString ? checkinsString.substring(0, 100) + '...' : 'null');
        checkins = [];
        if (checkinsString) { try { checkins = JSON.parse(checkinsString); if (!Array.isArray(checkins)) { checkins = []; } } catch (error) { console.error("Error parsing check-in data:", error); checkins = []; } }
        console.log("Parsed checkins data (0-100 scale expected):", checkins);
        console.log("Number of checkins found:", checkins.length);

        // 2. Check if Data Exists (Keep as is)
        if (checkins.length === 0) {
            console.log("Condition met: No check-ins.");
            if (chartContainer) chartContainer.style.display = 'none';
            if (timelineContainer) timelineContainer.style.display = 'none';
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        } else {
            console.log("Condition met: Check-ins found.");
            if (chartContainer) chartContainer.style.display = 'block';
            if (timelineContainer) timelineContainer.style.display = 'block';
            if (noDataMessage) noDataMessage.style.display = 'none';
        }

        // Verify Elements (Keep as is)
        console.log("Canvas element:", canvasElement);
        console.log("Timeline dots container:", timelineDotsContainer);
        console.log("Alert message div:", alertMessageDiv);
        if (!canvasElement || !timelineDotsContainer || !alertMessageDiv || !timelineContainer) { console.error("CRITICAL: Missing HTML elements."); return; }

        // 3. Get Latest Check-in (Keep as is)
        const latestCheckin = checkins[checkins.length - 1];
        const latestIndex = checkins.length - 1;
        console.log("Latest checkin for initial view (index " + latestIndex + "):", latestCheckin);

        // 4. Prepare Initial Chart Data & Options (MODIFIED scale, labels, baseline)
        // Baseline adjusted for 0-100 scale and plotting Restfulness
        const baselineData = {
            mood: 50, energy: 50, anxiety: 30, sleep_restfulness: 75, focus: 50
        };
        console.log("Baseline data (0-100 scale):", baselineData);

        const initialChartData = {
            // Updated labels to reflect plotted data
            labels: ['Mood', 'Energy', 'Anxiety', 'Restfulness', 'Focus'],
            datasets: [
                { // Dataset 0: User's data (empty initially)
                    label: '', data: [], fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)', pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgb(54, 162, 235)',
                    order: 1
                },
                { // Dataset 1: Baseline data (0-100 scale)
                    label: 'Baseline (Example)',
                    // Updated data points to match labels and scale
                    data: [ baselineData.mood, baselineData.energy, baselineData.anxiety, baselineData.sleep_restfulness, baselineData.focus ],
                    fill: false, borderColor: 'rgba(108, 117, 125, 0.5)', borderDash: [5, 5],
                    pointRadius: 0, pointHitRadius: 0, order: 2
                }
            ]
        };
        console.log("Initial chart data object prepared:", initialChartData);

        // MODIFIED chart scale options
        const chartOptions = {
            scales: {
                r: { // Radial axis
                    angleLines: { display: true },
                    suggestedMin: 0,    // Scale starts at 0
                    suggestedMax: 100,  // Scale ends at 100
                    ticks: {
                        stepSize: 20 // Ticks every 20 units (0, 20, 40, 60, 80, 100)
                    },
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
            animation: false
        };
        console.log("Chart options object prepared (0-100 scale):", chartOptions);

        // 5. Create Chart Instance (Keep logic, ensure destruction if exists)
        if (wellnessChart) { wellnessChart.destroy(); }
        console.log("Attempting to create Chart instance...");
        const ctx = canvasElement.getContext('2d');
        if (!ctx) { console.error("Failed to get 2D context!"); return; }

        try {
            wellnessChart = new Chart(ctx, { type: 'radar', data: initialChartData, options: chartOptions });
            console.log("Chart instance CREATED successfully:", wellnessChart);
            console.log("Attempting initial chart update...");
            updateChart(latestCheckin, latestIndex); // Draw initial state
            console.log("Initial chart update process completed.");
        } catch (chartError) { console.error("!!! ERROR Creating Chart.js instance:", chartError); return; }

        // 6. Create Timeline Dots (Keep logic)
        console.log("Attempting to create timeline dots...");
        createTimelineDots(checkins);
        console.log("Timeline dots creation process completed.");

        console.log("--- initializeDashboard finished ---");
    } // End of initializeDashboard

    // --- Run Initialization ---
    initializeDashboard();

}); // End of DOMContentLoaded listener
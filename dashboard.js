document.addEventListener('DOMContentLoaded', () => {
    // Keep existing element selections
    const storageKey = 'wellnessCheckins';
    const canvasElement = document.getElementById('moodRadarChart');
    const chartContainer = document.getElementById('chartContainer');
    const noDataMessage = document.getElementById('noDataMessage');
    const timelineDotsContainer = document.getElementById('timelineDots');
    const alertMessageDiv = document.getElementById('alertMessage'); // Get the alert div

    let wellnessChart = null;
    let checkins = [];

    // --- Utility Functions (keep normalizeSleepHours) ---
    function normalizeSleepHours(hours) {
        // ... (keep existing function) ...
    }

    // --- NEW: Function to Check for Alerts ---
    function checkAlerts(checkinData) {
        if (!alertMessageDiv || !checkinData) return;

        let alertText = "";
        const { mood, energy, anxiety, sleep_hours } = checkinData; // Destructure for easier access

        // Define risk patterns (adjust thresholds as needed)
        const maniaRisk = (sleep_hours !== undefined && sleep_hours <= 3) && energy >= 4; // Example: Low sleep + High energy
        const depressionRisk = mood <= 1 && energy <= 2; // Example: Very low mood + Low energy
        const highAnxiety = anxiety >= 4; // Example: High anxiety

        // Build the alert message
        if (maniaRisk && depressionRisk) {
            alertText = "Patterns suggest potential risk for a mixed state. Please review your data carefully.";
        } else if (maniaRisk) {
            alertText = "Patterns suggest potential mania risk (low sleep, high energy). Please review your data carefully.";
        } else if (depressionRisk) {
            alertText = "Patterns suggest potential depression risk (low mood, low energy). Please review your data carefully.";
        } else if (highAnxiety) {
            // Optional: Alert for high anxiety alone
            // alertText = "High level of anxiety/irritability detected. Remember coping strategies.";
        }

        // Show or hide the alert div
        if (alertText) {
            alertMessageDiv.textContent = alertText;
            alertMessageDiv.style.display = 'block';
             console.log("Alert displayed:", alertText);
        } else {
            alertMessageDiv.style.display = 'none';
             console.log("No alert conditions met.");
        }
    }


    // --- Function to Update the Chart (Modified) ---
    function updateChart(checkinData, index) {
        if (!wellnessChart || !checkinData) return;

        const normalizedSleep = normalizeSleepHours(checkinData.sleep_hours);
        const chartDate = new Date(checkinData.timestamp).toLocaleDateString();

        // Update the USER'S data dataset (index 0)
        wellnessChart.data.datasets[0].data = [
            checkinData.mood,
            checkinData.energy,
            checkinData.anxiety,
            normalizedSleep,
            checkinData.focus
        ];
        wellnessChart.data.datasets[0].label = `Check-in: ${chartDate}`;

        // Refresh the chart
        wellnessChart.update();

        // Update selected dot style (keep this logic)
        document.querySelectorAll('.timeline-dot').forEach((dot, dotIndex) => {
            dot.classList.toggle('selected', dotIndex === index);
        });

        // --- NEW: Check for alerts based on the currently displayed data ---
        checkAlerts(checkinData);

        console.log(`Chart updated to show check-in from ${chartDate}`);
    }

    // --- Function to Create Timeline Dots (keep as is) ---
    function createTimelineDots(checkinsData) {
        // ... (keep existing function) ...
    }

    // --- Main Logic (Modified for Baseline Dataset) ---
    function initializeDashboard() {
        // 1. Load Data (keep as is)
        const checkinsString = localStorage.getItem(storageKey);
        // ... (keep parsing logic) ...

        // 2. Check if Data Exists (keep as is)
         if (checkins.length === 0) {
            // ... (keep no data logic) ...
            return;
        } else {
            // ... (keep show elements logic) ...
        }

        // 3. Get Latest Check-in for Initial View (keep as is)
        const latestCheckin = checkins[checkins.length - 1];
        const latestIndex = checkins.length - 1;

        // --- 4. Prepare Initial Chart Data & Options (MODIFIED) ---

        // Define the baseline data points (adjust as needed for "normal")
        const baselineData = {
            mood: 3,
            energy: 3,
            anxiety: 2,
            sleep_hours_normalized: 4, // e.g., representing 7-8 hours
            focus: 3
        };

        const initialChartData = {
            labels: ['Mood', 'Energy', 'Anxiety', 'Sleep (Hrs)', 'Focus'],
            datasets: [
                { // Dataset 0: User's data (will be updated by updateChart)
                    label: '', // Set by updateChart
                    data: [],  // Set by updateChart
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', // User: Blue fill
                    borderColor: 'rgb(54, 162, 235)',          // User: Blue border
                    pointBackgroundColor: 'rgb(54, 162, 235)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(54, 162, 235)',
                    order: 1 // Ensure user data is drawn on top
                },
                { // Dataset 1: Baseline data (static)
                    label: 'Baseline (Example)',
                    data: [
                        baselineData.mood,
                        baselineData.energy,
                        baselineData.anxiety,
                        baselineData.sleep_hours_normalized,
                        baselineData.focus
                    ],
                    fill: false, // Don't fill the baseline area
                    borderColor: 'rgba(108, 117, 125, 0.5)', // Faint gray border
                    borderDash: [5, 5], // Make it dashed
                    pointRadius: 0, // Hide points for baseline
                    pointHitRadius: 0, // Prevent hover/tooltip on baseline points
                    order: 2 // Drawn behind user data
                }
            ]
        };
        const chartOptions = {
            scales: { r: { angleLines: { display: true }, suggestedMin: 1, suggestedMax: 5, ticks: { stepSize: 1 }, pointLabels: { font: { size: 14 } } } },
            plugins: {
                legend: {
                     position: 'top',
                     labels: {
                         // Optional: Filter out baseline from interactive legend clicks if desired
                         // filter: function(legendItem, chartData) { return legendItem.datasetIndex === 0; }
                     }
                },
                tooltip: {
                    enabled: true,
                    // Optional: Only show tooltips for the user's dataset
                    filter: function(tooltipItem) {
                        return tooltipItem.datasetIndex === 0;
                    }
                }
            },
            animation: false
        };

        // 5. Create the Chart Instance (keep as is)
        if (canvasElement) {
            const ctx = canvasElement.getContext('2d');
            wellnessChart = new Chart(ctx, {
                type: 'radar',
                data: initialChartData,
                options: chartOptions
            });
            console.log("Chart instance created with baseline.");

            // Draw the initial chart state with the latest data (calls updateChart, which now also calls checkAlerts)
            updateChart(latestCheckin, latestIndex);

        } else {
            console.error("Canvas element 'moodRadarChart' not found.");
            return;
        }

        // 6. Create the Timeline Dots (keep as is)
        createTimelineDots(checkins);
    }

    // --- Run Initialization ---
    initializeDashboard();

}); // End of DOMContentLoaded listener
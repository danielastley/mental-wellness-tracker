document.addEventListener('DOMContentLoaded', () => {
    const storageKey = 'wellnessCheckins';
    const canvasElement = document.getElementById('moodRadarChart');
    const chartContainer = document.getElementById('chartContainer');
    const noDataMessage = document.getElementById('noDataMessage');
    const timelineDotsContainer = document.getElementById('timelineDots'); // Get timeline container

    let wellnessChart = null; // Variable to hold the Chart instance
    let checkins = []; // To store loaded check-ins

    // --- Utility Functions ---
    function normalizeSleepHours(hours) {
        if (hours === undefined || hours === null) return 3; // Handle missing data
        if (hours <= 2) return 1;
        if (hours <= 4) return 2;
        if (hours <= 6) return 3;
        if (hours <= 8) return 4;
        if (hours >= 9) return 5;
        return 3; // Default
    }

    // --- Function to Update the Chart ---
    function updateChart(checkinData, index) {
        if (!wellnessChart || !checkinData) return; // Safety check

        const normalizedSleep = normalizeSleepHours(checkinData.sleep_hours);
        const chartDate = new Date(checkinData.timestamp).toLocaleDateString();

        // Update chart data
        wellnessChart.data.datasets[0].data = [
            checkinData.mood,
            checkinData.energy,
            checkinData.anxiety,
            normalizedSleep,
            checkinData.focus
        ];
        wellnessChart.data.datasets[0].label = `Check-in: ${chartDate}`; // Update label

        // Refresh the chart
        wellnessChart.update();

        // Update selected dot style
        document.querySelectorAll('.timeline-dot').forEach((dot, dotIndex) => {
            if (dotIndex === index) {
                dot.classList.add('selected');
            } else {
                dot.classList.remove('selected');
            }
        });
         console.log(`Chart updated to show check-in from ${chartDate}`);
    }

    // --- Function to Create Timeline Dots ---
    function createTimelineDots(checkinsData) {
        if (!timelineDotsContainer) return;
        timelineDotsContainer.innerHTML = ''; // Clear any existing dots

        checkinsData.forEach((checkin, index) => {
            const dot = document.createElement('span');
            dot.classList.add('timeline-dot');
            dot.dataset.index = index; // Store index to retrieve data later
            dot.dataset.mood = checkin.mood; // Add mood data for CSS color styling

            // Add tooltip
            const tooltip = document.createElement('span');
            tooltip.classList.add('tooltip-text');
            tooltip.textContent = new Date(checkin.timestamp).toLocaleDateString();
            dot.appendChild(tooltip);

            // Add click listener
            dot.addEventListener('click', () => {
                updateChart(checkin, index); // Update chart with data for this dot's index
            });

            timelineDotsContainer.appendChild(dot);
        });
         console.log(`${checkinsData.length} timeline dots created.`);
    }

    // --- Main Logic ---
    function initializeDashboard() {
        // 1. Load Data
        const checkinsString = localStorage.getItem(storageKey);
        if (checkinsString) {
            try {
                checkins = JSON.parse(checkinsString);
                if (!Array.isArray(checkins)) checkins = [];
            } catch (error) {
                console.error("Error parsing check-in data:", error);
                checkins = [];
            }
        }

        // 2. Check if Data Exists
        if (checkins.length === 0) {
            console.log("No check-in data found.");
            if (chartContainer) chartContainer.style.display = 'none';
            if (timelineContainer) timelineContainer.style.display = 'none'; // Hide timeline too
            if (noDataMessage) noDataMessage.style.display = 'block';
            return;
        } else {
             // Ensure chart and timeline are visible if data exists
             if (chartContainer) chartContainer.style.display = 'block';
             if (timelineContainer) timelineContainer.style.display = 'block'; // Show timeline
             if (noDataMessage) noDataMessage.style.display = 'none';
        }

        // 3. Get Latest Check-in for Initial View
        const latestCheckin = checkins[checkins.length - 1];
        const latestIndex = checkins.length - 1;

        // 4. Prepare Initial Chart Data & Options (same as before)
        const initialChartData = {
            labels: ['Mood', 'Energy', 'Anxiety', 'Sleep (Hrs)', 'Focus'],
            datasets: [{
                // Data and label will be set initially here, and updated by updateChart()
                label: '', // Will be set below
                data: [],  // Will be set below
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)'
            }]
        };
        const chartOptions = {
            scales: { r: { angleLines: { display: true }, suggestedMin: 1, suggestedMax: 5, ticks: { stepSize: 1 }, pointLabels: { font: { size: 14 } } } },
            plugins: { legend: { position: 'top' }, tooltip: { enabled: true } },
            animation: false // Optional: Disable animation for faster updates on click
        };

        // 5. Create the Chart Instance
        if (canvasElement) {
            const ctx = canvasElement.getContext('2d');
            wellnessChart = new Chart(ctx, { // Assign to our global variable
                type: 'radar',
                data: initialChartData,
                options: chartOptions
            });
            console.log("Chart instance created.");

            // Draw the initial chart state with the latest data
            updateChart(latestCheckin, latestIndex);

        } else {
            console.error("Canvas element 'moodRadarChart' not found.");
            return; // Stop if canvas is missing
        }

        // 6. Create the Timeline Dots
        createTimelineDots(checkins);
    }

    // --- Run Initialization ---
    initializeDashboard();

}); // End of DOMContentLoaded listener
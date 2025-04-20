document.addEventListener('DOMContentLoaded', () => {
    const storageKey = 'wellnessCheckins'; // Same key used in script.js
    const canvasElement = document.getElementById('moodRadarChart');
    const chartContainer = document.getElementById('chartContainer');
    const noDataMessage = document.getElementById('noDataMessage');

    // --- 1. Load Data from localStorage ---
    const checkinsString = localStorage.getItem(storageKey);
    let checkins = [];

    if (checkinsString) {
        try {
            checkins = JSON.parse(checkinsString);
            if (!Array.isArray(checkins)) {
                checkins = []; // Reset if data is corrupted
            }
        } catch (error) {
            console.error("Error parsing check-in data from localStorage:", error);
            checkins = [];
        }
    }

    // --- 2. Check if Data Exists ---
    if (checkins.length === 0) {
        // No data found, show message and hide chart container
        console.log("No check-in data found.");
        if(chartContainer) chartContainer.style.display = 'none';
        if(noDataMessage) noDataMessage.style.display = 'block';
        return; // Stop script execution if no data
    }

    // --- 3. Get the Most Recent Check-in ---
    // Assuming the last item in the array is the most recent
    const latestCheckin = checkins[checkins.length - 1];
    console.log("Latest Check-in Data:", latestCheckin);

    // --- 4. Normalize Sleep Hours (as per requirement) ---
    function normalizeSleepHours(hours) {
        if (hours <= 2) return 1;
        if (hours <= 4) return 2;
        if (hours <= 6) return 3;
        if (hours <= 8) return 4;
        if (hours >= 9) return 5;
        return 3; // Default to neutral if undefined or unexpected
    }

    const normalizedSleep = normalizeSleepHours(latestCheckin.sleep_hours);

    // --- 5. Prepare Data for Chart.js ---
    const chartData = {
        labels: [
            'Mood',         // Corresponds to latestCheckin.mood
            'Energy',       // Corresponds to latestCheckin.energy
            'Anxiety',      // Corresponds to latestCheckin.anxiety
            'Sleep (Hrs)', // Corresponds to normalizedSleep
            'Focus'         // Corresponds to latestCheckin.focus
        ],
        datasets: [{
            label: `Check-in: ${new Date(latestCheckin.timestamp).toLocaleDateString()}`, // Label for this dataset
            data: [
                latestCheckin.mood,
                latestCheckin.energy,
                latestCheckin.anxiety,
                normalizedSleep, // Use the normalized value
                latestCheckin.focus
            ],
            fill: true, // Fill the area inside the radar lines
            backgroundColor: 'rgba(54, 162, 235, 0.2)', // Light blue fill
            borderColor: 'rgb(54, 162, 235)', // Blue border
            pointBackgroundColor: 'rgb(54, 162, 235)', // Blue points
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
        }]
    };

    // --- 6. Configure Chart Options ---
    const chartOptions = {
        scales: {
            r: { // 'r' is the radial axis (the spokes)
                angleLines: { display: true },
                suggestedMin: 1, // Start axis at 1
                suggestedMax: 5, // End axis at 5
                ticks: {
                    stepSize: 1, // Show ticks for 1, 2, 3, 4, 5
                    // Optional: Customize tick labels if needed
                    // callback: function(value, index, values) { return value + ' stars'; }
                },
                pointLabels: {
                   font: {
                       size: 14 // Increase font size for axis labels (Mood, Energy, etc.)
                   }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top', // Position the legend at the top
            },
            tooltip: {
                enabled: true // Show tooltips on hover
            }
        }
        // You can add many more customization options here if needed
    };

    // --- 7. Create and Render the Chart ---
    if (canvasElement) {
        const ctx = canvasElement.getContext('2d'); // Get the drawing context
        new Chart(ctx, {
            type: 'radar',      // Specify the chart type
            data: chartData,    // Provide the data prepared above
            options: chartOptions // Provide the configuration options
        });
        console.log("Radar chart rendered.");
    } else {
        console.error("Canvas element 'moodRadarChart' not found.");
    }

}); // End of DOMContentLoaded listener
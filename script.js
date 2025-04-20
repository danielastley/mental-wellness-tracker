// Wait for the HTML document to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Select HTML Elements ---
    const checkinForm = document.getElementById('checkinForm');

    // Sliders
    const moodSlider = document.getElementById('moodSlider');
    const energySlider = document.getElementById('energySlider');
    const anxietySlider = document.getElementById('anxietySlider');
    const sleepRestfulnessSlider = document.getElementById('sleepRestfulnessSlider');
    const focusSlider = document.getElementById('focusSlider');

    // Label Spans (to display slider values)
    const moodValueLabel = document.getElementById('moodValueLabel');
    const energyValueLabel = document.getElementById('energyValueLabel');
    const anxietyValueLabel = document.getElementById('anxietyValueLabel');
    const sleepRestfulnessValueLabel = document.getElementById('sleepRestfulnessValueLabel');
    const focusValueLabel = document.getElementById('focusValueLabel');

    // Other Inputs
    const sleepHoursInput = document.getElementById('sleepHoursInput');
    const notesTextarea = document.getElementById('notesTextarea');

    // --- 2. Define Label Mappings ---
    // Store the text labels for each slider value (1-5)
    // Note: Index 0 is unused, we use indices 1-5 to match slider values
    const moodLabels = ["", "Severely Depressed", "Low Mood", "Neutral", "Elevated", "Euphoric"];
    const energyLabels = ["", "Exhausted", "Low Energy", "Balanced", "High Energy", "Over-energized"];
    const anxietyLabels = ["", "Calm", "Slightly Anxious", "Moderate", "Very Anxious", "Panicked/Frustrated"];
    const sleepRestfulnessLabels = ["", "Exhausted", "Poorly Rested", "Okay", "Well Rested", "Rested"];
    const focusLabels = ["", "Brain Fog/Stuck", "Distracted", "Neutral", "Sharp", "Racing Thoughts"];

    // --- 3. Function to Update Slider Label ---
    function updateLabel(sliderElement, labelElement, labelsArray) {
        const value = sliderElement.value; // Get the current slider value (as a string)
        labelElement.textContent = labelsArray[value]; // Update the label's text
    }

    // --- 4. Attach Event Listeners to Sliders ---
    // Add listener for 'input' event (fires whenever the value changes)
    moodSlider.addEventListener('input', () => updateLabel(moodSlider, moodValueLabel, moodLabels));
    energySlider.addEventListener('input', () => updateLabel(energySlider, energyValueLabel, energyLabels));
    anxietySlider.addEventListener('input', () => updateLabel(anxietySlider, anxietyValueLabel, anxietyLabels));
    sleepRestfulnessSlider.addEventListener('input', () => updateLabel(sleepRestfulnessSlider, sleepRestfulnessValueLabel, sleepRestfulnessLabels));
    focusSlider.addEventListener('input', () => updateLabel(focusSlider, focusValueLabel, focusLabels));

    // --- 5. Initialize Labels on Page Load ---
    // Call updateLabel once for each slider to set the initial text based on default values
    updateLabel(moodSlider, moodValueLabel, moodLabels);
    updateLabel(energySlider, energyValueLabel, energyLabels);
    updateLabel(anxietySlider, anxietyValueLabel, anxietyLabels);
    updateLabel(sleepRestfulnessSlider, sleepRestfulnessValueLabel, sleepRestfulnessLabels);
    updateLabel(focusSlider, focusValueLabel, focusLabels);

    // --- 6. Handle Form Submission ---
    checkinForm.addEventListener('submit', (event) => {
        event.preventDefault(); // IMPORTANT: Prevent the default form submission (page reload)

        // Create an object to hold the check-in data
        const checkInData = {
            timestamp: new Date().toISOString(), // Record the time of submission in standard format
            mood: parseInt(moodSlider.value), // Convert string value to integer
            energy: parseInt(energySlider.value),
            anxiety: parseInt(anxietySlider.value),
            sleep_hours: parseInt(sleepHoursInput.value) || 0, // Use 0 if input is empty
            sleep_restfulness: parseInt(sleepRestfulnessSlider.value),
            focus: parseInt(focusSlider.value),
            notes: notesTextarea.value.trim() // Get notes, remove extra whitespace
        };

        // --- Temporary Action: Log data to console ---
        console.log("Check-in Data Submitted:");
        console.log(checkInData);
        alert("Check-in recorded! Data logged to console."); // Simple user feedback

        // --- TODO (Later Steps) ---
        // 1. Save `checkInData` to localStorage.
        // 2. Optionally, send `checkInData` to a server.
        // 3. Clear the form or provide better visual feedback.
        // 4. Navigate to the dashboard view (once we build it).

        // For now, we could optionally reset the form fields
        // checkinForm.reset();
        // updateLabel(moodSlider, moodValueLabel, moodLabels); // Re-initialize labels if resetting
        // ... re-initialize other labels ...
    });

}); // End of DOMContentLoaded listener
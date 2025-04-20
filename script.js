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

 // --- NEW: Save data to localStorage ---
 try {
    // Define the key we'll use to store our data in localStorage
    const storageKey = 'wellnessCheckins';

    // 1. Get existing data (if any)
    const existingDataString = localStorage.getItem(storageKey);

    // 2. Parse existing data or initialize an empty array
    let checkins = [];
    if (existingDataString) {
        checkins = JSON.parse(existingDataString);
        // Basic validation: ensure it's an array
        if (!Array.isArray(checkins)) {
            console.warn("Invalid data found in localStorage, resetting.");
            checkins = [];
        }
    }

    // 3. Add the new check-in data to the array
    checkins.push(checkInData);

    // 4. Convert the updated array back to a JSON string
    const updatedDataString = JSON.stringify(checkins);

    // 5. Store the updated JSON string in localStorage
    localStorage.setItem(storageKey, updatedDataString);

    // --- Provide User Feedback ---
    console.log("Check-in saved successfully to localStorage:", checkInData);
    alert("Check-in saved! 🎉"); // Give positive feedback

    // --- Optional: Reset the form after successful submission ---
    checkinForm.reset(); // Resets all form fields to their default values
    // Re-initialize labels after reset
    updateLabel(moodSlider, moodValueLabel, moodLabels);
    updateLabel(energySlider, energyValueLabel, energyLabels);
    updateLabel(anxietySlider, anxietyValueLabel, anxietyLabels);
    updateLabel(sleepRestfulnessSlider, sleepRestfulnessValueLabel, sleepRestfulnessLabels);
    updateLabel(focusSlider, focusValueLabel, focusLabels);
    // Note: The sleep hours input and textarea will also be reset by form.reset()

} catch (error) {
    // --- Handle Potential Errors (e.g., localStorage full, invalid JSON) ---
    console.error("Error saving check-in data:", error);
    alert("Sorry, there was an error saving your check-in. Please try again.");
}

// --- TODO (Later Steps) ---
// 1. Build the Dashboard/Visualization screen.
// 2. Load data from localStorage onto the Dashboard.
// 3. Implement sending data to your server (if desired).
});

}); // End of DOMContentLoaded listener
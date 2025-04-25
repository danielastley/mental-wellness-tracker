$(document).ready(function() {

    // --- 1. Select DOM Elements (Keep as is) ---
    const checkinForm = document.getElementById('checkinForm');
    const pages = document.querySelectorAll('.page');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitButton = document.getElementById('submitButton');
    const moodDescriptionEl = document.getElementById('moodDescription');
    const moodValueInputEl = document.getElementById('moodValueInput');
    const energyDescriptionEl = document.getElementById('energyDescription');
    const energyValueInputEl = document.getElementById('energyValueInput');
    const anxietyDescriptionEl = document.getElementById('anxietyDescription');
    const anxietyValueInputEl = document.getElementById('anxietyValueInput');
    const restfulnessDescriptionEl = document.getElementById('restfulnessDescription');
    const restfulnessValueInputEl = document.getElementById('restfulnessValueInput');
    const focusDescriptionEl = document.getElementById('focusDescription');
    const focusValueInputEl = document.getElementById('focusValueInput');
    const sleepHoursInput = document.getElementById('sleepHoursInput');
    const notesTextarea = document.getElementById('notesTextarea');

    // --- 2. Pagination State (Keep as is) ---
    let currentPageIndex = 0;
    const totalPages = pages.length;

    // --- 3. Description Data (Keep as is) ---
    const moodDescriptions = ["Severely Depressed", "Very Low Mood", "Low Mood", "Slightly Low", "Neutral Mood", "Okay", "Slightly Elevated", "Elevated Mood", "Very High", "Euphoric/Manic"];
    const energyDescriptions = ["Completely Exhausted", "Very Low Energy", "Low Energy", "Slightly Tired", "Balanced Energy", "Okay Energy", "Slightly High Energy", "High Energy", "Very High Energy", "Over-energized/Wired"];
    const anxietyDescriptions = ["Perfectly Calm", "Very Calm", "Calm / Relaxed", "Slightly Anxious", "Moderately Anxious", "Noticeably Anxious", "High Anxiety", "Very High Anxiety", "Severe Anxiety", "Panicked / Overwhelmed"];
    const restfulnessDescriptions = ["Felt Awake All Night", "Very Poor Sleep", "Poor Sleep Quality", "Slightly Tired Still", "Okay / Neutral", "Fairly Rested", "Rested", "Well Rested", "Very Well Rested", "Perfectly Rested"];
    const focusDescriptions = ["Complete Brain Fog", "Very Distracted", "Distracted / Foggy", "Slightly Distracted", "Neutral Focus", "Fairly Focused", "Focused", "Very Focused", "Hyperfocused", "Racing Thoughts"];

    // --- 4. Helper Functions (Keep getDescriptionIndex) ---
    function getDescriptionIndex(value) {
        if (value >= 100) return 9;
        return Math.max(0, Math.min(9, Math.floor(value / 10)));
    }

    // --- 5. Update Display Functions (Keep as is) ---
    function updateMoodDisplay(value) { moodDescriptionEl.textContent = moodDescriptions[getDescriptionIndex(value)]; moodValueInputEl.value = value; }
    function updateEnergyDisplay(value) { energyDescriptionEl.textContent = energyDescriptions[getDescriptionIndex(value)]; energyValueInputEl.value = value; }
    function updateAnxietyDisplay(value) { anxietyDescriptionEl.textContent = anxietyDescriptions[getDescriptionIndex(value)]; anxietyValueInputEl.value = value; }
    function updateRestfulnessDisplay(value) { restfulnessDescriptionEl.textContent = restfulnessDescriptions[getDescriptionIndex(value)]; restfulnessValueInputEl.value = value; }
    function updateFocusDisplay(value) { focusDescriptionEl.textContent = focusDescriptions[getDescriptionIndex(value)]; focusValueInputEl.value = value; }

  // --- 6. Slider Initialization (ADJUST ANGLES for Top Semi-circle) ---
  function initializeSliders() {
    const sliderOptions = {
        radius: 110,
        width: 20,
        handleSize: "+0",
        handleShape: "round",
        circleShape: "pie",      // Keep pie shape for the track
        sliderType: "min-range", // Keep min-range for fill
        // CHANGED ANGLES: 9 o'clock to 3 o'clock (top semi-circle)
        startAngle: -45,    // Start at 9 o'clock
        endAngle: "+180",   // Sweep 180 degrees counter-clockwise
        // -----
        value: 50,         // Default 0-100 value (should be top-center)
        min: 0,
        max: 100,
        step: 1,
        showTooltip: true, // For center text
        // svgMode: true // Keep commented out
    };

    // Initialize all sliders with these options...
    // Mood Slider
    $("#moodSliderContainer").roundSlider({
        ...sliderOptions,
        tooltipFormat: function() { return "Mood"; },
        create: function(args) { updateMoodDisplay(args.value); },
        valueChange: function(args) { updateMoodDisplay(args.value); },
        drag: function(args) { updateMoodDisplay(args.value); }
    });

    // Energy Slider
    $("#energySliderContainer").roundSlider({
         ...sliderOptions,
        tooltipFormat: function() { return "Energy"; },
        create: function(args) { updateEnergyDisplay(args.value); },
        valueChange: function(args) { updateEnergyDisplay(args.value); },
        drag: function(args) { updateEnergyDisplay(args.value); }
     });
    // Anxiety Slider
    $("#anxietySliderContainer").roundSlider({
        ...sliderOptions,
        tooltipFormat: function() { return "Anxiety"; },
        create: function(args) { updateAnxietyDisplay(args.value); },
        valueChange: function(args) { updateAnxietyDisplay(args.value); },
        drag: function(args) { updateAnxietyDisplay(args.value); }
    });
    // Restfulness Slider
    $("#restfulnessSliderContainer").roundSlider({
        ...sliderOptions,
        tooltipFormat: function() { return "How Rested?"; },
        create: function(args) { updateRestfulnessDisplay(args.value); },
        valueChange: function(args) { updateRestfulnessDisplay(args.value); },
        drag: function(args) { updateRestfulnessDisplay(args.value); }
    });
    // Focus Slider
    $("#focusSliderContainer").roundSlider({
        ...sliderOptions,
        tooltipFormat: function() { return "Focus"; },
        create: function(args) { updateFocusDisplay(args.value); },
        valueChange: function(args) { updateFocusDisplay(args.value); },
        drag: function(args) { updateFocusDisplay(args.value); }
    });

    console.log("Round sliders re-initialized (circleShape: pie, type: min-range, top semi-circle angles).");}

    // --- 7. Pagination Logic (Keep as is) ---
    function showPage(index) {
        pages.forEach((page, i) => page.classList.toggle('active', i === index));
        prevBtn.disabled = (index === 0);
        nextBtn.style.display = (index === totalPages - 1) ? 'none' : 'inline-block';
        submitButton.style.display = (index === totalPages - 1) ? 'inline-block' : 'none';
        currentPageIndex = index;
        console.log(`Showing page ${currentPageIndex}`);
    }
    function navigatePage(direction) {
        let newIndex = currentPageIndex + direction;
        if (newIndex >= 0 && newIndex < totalPages) showPage(newIndex);
    }
    prevBtn.addEventListener('click', () => navigatePage(-1));
    nextBtn.addEventListener('click', () => navigatePage(1));

    // --- 8. Form Submission (SEND TO SERVER) ---
    checkinForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default page reload

        // Create the check-in data object (using 0-100 values)
        const checkInData = {
            timestamp: new Date().toISOString(), // UTC Standard
            mood: parseInt(moodValueInputEl.value),
            energy: parseInt(energyValueInputEl.value),
            anxiety: parseInt(anxietyValueInputEl.value),
            sleep_hours: parseFloat(sleepHoursInput.value) || 0,
            sleep_restfulness: parseInt(restfulnessValueInputEl.value),
            focus: parseInt(focusValueInputEl.value),
            notes: notesTextarea.value.trim()
        };

        // --- NEW: Send data to server using fetch ---
        console.log("Attempting to send data to server:", checkInData);
        submitButton.disabled = true; // Disable button during submission
        submitButton.textContent = 'Saving...';

        fetch('save_checkin.php', { // URL of your PHP script on the SAME server
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Tell server we're sending JSON
                'Accept': 'application/json'       // Tell server we expect JSON back
            },
            body: JSON.stringify(checkInData) // Convert JS object to JSON string
        })
        .then(response => {
            // Check if the response status indicates success (e.g., 200 OK)
            if (!response.ok) {
                 // If server response is not ok, try to get error message, then throw
                 return response.json().catch(() => { // Try parsing JSON error first
                      throw new Error(`Server responded with status ${response.status}`);
                 }).then(errorData => {
                     throw new Error(errorData.message || `Server responded with status ${response.status}`);
                 });
            }
            return response.json(); // Parse the JSON response from PHP
        })
        .then(data => {
            // Check the status message from our PHP script
            if (data.status === 'success') {
                console.log("Server confirmed save:", data.message);
                alert("Check-in saved! 🎉");

                // --- Reset form (same logic as before) ---
                 moodValueInputEl.value = 50;
                 energyValueInputEl.value = 50;
                 anxietyValueInputEl.value = 50;
                 restfulnessValueInputEl.value = 50;
                 focusValueInputEl.value = 50;
                 sleepHoursInput.value = 8;
                 notesTextarea.value = '';

                 $("#moodSliderContainer").roundSlider("option", "value", 50);
                 $("#energySliderContainer").roundSlider("option", "value", 50);
                 $("#anxietySliderContainer").roundSlider("option", "value", 50);
                 $("#restfulnessSliderContainer").roundSlider("option", "value", 50);
                 $("#focusSliderContainer").roundSlider("option", "value", 50);

                 showPage(0); // Navigate back to the first page

            } else {
                 // Server reported an error in its JSON response
                 throw new Error(data.message || 'Server reported an unspecified error.');
            }
        })
        .catch(error => {
            // Handle network errors or errors thrown from .then blocks
            console.error("Error saving check-in data:", error);
            alert(`Sorry, there was an error saving your check-in: ${error.message}`);
        })
        .finally(() => {
             // Re-enable button regardless of success or failure
             submitButton.disabled = false;
             submitButton.textContent = 'Done! ✅';
        });
    }); // End of submit listener


    // --- 9. Initial Setup (Keep as is) ---
    initializeSliders();
    showPage(0);

    console.log("Check-in page initialized.");

}); // End of jQuery $(document).ready
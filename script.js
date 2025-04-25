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

    // --- 8. Form Submission (MODIFIED) ---
    checkinForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // REMOVED: mapSliderValueToScale function

        // Create the check-in data object - SAVE 0-100 VALUES DIRECTLY
        const checkInData = {
             // Storing UTC timestamp remains best practice. Display formatting happens later.
            timestamp: new Date().toISOString(),
            mood: parseInt(moodValueInputEl.value),         // Save 0-100
            energy: parseInt(energyValueInputEl.value),       // Save 0-100
            anxiety: parseInt(anxietyValueInputEl.value),     // Save 0-100
            sleep_hours: parseFloat(sleepHoursInput.value) || 0, // Still direct value
            sleep_restfulness: parseInt(restfulnessValueInputEl.value), // Save 0-100
            focus: parseInt(focusValueInputEl.value),       // Save 0-100
            notes: notesTextarea.value.trim()
        };

         // --- Save data to localStorage (Keep existing logic) ---
        try {
            const storageKey = 'wellnessCheckins';
            const existingDataString = localStorage.getItem(storageKey);
            let checkins = [];
            if (existingDataString) {
                checkins = JSON.parse(existingDataString);
                if (!Array.isArray(checkins)) { checkins = []; }
            }
            checkins.push(checkInData);
            const updatedDataString = JSON.stringify(checkins);
            localStorage.setItem(storageKey, updatedDataString);

            console.log("Check-in saved (0-100 scale):", checkInData);
            alert("Check-in saved! 🎉");

            // --- Reset form (Keep existing logic) ---
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

        } catch (error) {
            console.error("Error saving check-in data:", error);
            alert("Sorry, there was an error saving your check-in.");
        }
    });


    // --- 9. Initial Setup (Keep as is) ---
    initializeSliders();
    showPage(0);

    console.log("Check-in page initialized.");

}); // End of jQuery $(document).ready
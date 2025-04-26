$(document).ready(function() {

    // --- 1. Select DOM Elements ---
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

    // --- 2. Pagination State ---
    let currentPageIndex = 0;
    const totalPages = pages.length;

    // --- 3. Description Data ---
    const moodDescriptions = ["Severely Depressed", "Very Low Mood", "Low Mood", "Slightly Low", "Neutral Mood", "Okay", "Slightly Elevated", "Elevated Mood", "Very High", "Euphoric/Manic"];
    const energyDescriptions = ["Completely Exhausted", "Very Low Energy", "Low Energy", "Slightly Tired", "Balanced Energy", "Okay Energy", "Slightly High Energy", "High Energy", "Very High Energy", "Over-energized/Wired"];
    const anxietyDescriptions = ["Perfectly Calm", "Very Calm", "Calm / Relaxed", "Slightly Anxious", "Moderately Anxious", "Noticeably Anxious", "High Anxiety", "Very High Anxiety", "Severe Anxiety", "Panicked / Overwhelmed"];
    const restfulnessDescriptions = ["Felt Awake All Night", "Very Poor Sleep", "Poor Sleep Quality", "Slightly Tired Still", "Okay / Neutral", "Fairly Rested", "Rested", "Well Rested", "Very Well Rested", "Perfectly Rested"];
    const focusDescriptions = ["Complete Brain Fog", "Very Distracted", "Distracted / Foggy", "Slightly Distracted", "Neutral Focus", "Fairly Focused", "Focused", "Very Focused", "Hyperfocused", "Racing Thoughts"];

    // --- 4. Helper Functions ---
    function getDescriptionIndex(value) {
        if (value >= 100) return 9;
        return Math.max(0, Math.min(9, Math.floor(value / 10)));
    }

    // Helper Function to Calculate Rainbow Color
    function getColorForValue(value) {
        const percent = Math.max(0, Math.min(100, value)) / 100; // Normalize value to 0-1
        const colors = [ // Blue -> Cyan -> Green -> Yellow -> Orange -> Red
            { offset: 0,   color: { r: 0,   g: 0,   b: 255 } },
            { offset: 0.2, color: { r: 0,   g: 255, b: 255 } },
            { offset: 0.4, color: { r: 0,   g: 255, b: 0   } },
            { offset: 0.6, color: { r: 255, g: 255, b: 0   } },
            { offset: 0.8, color: { r: 255, g: 165, b: 0   } },
            { offset: 1.0, color: { r: 255, g: 0,   b: 0   } }
        ];
        let c1, c2;
        for (let i = 0; i < colors.length - 1; i++) {
            if (percent >= colors[i].offset && percent <= colors[i+1].offset) {
                c1 = colors[i];
                c2 = colors[i+1];
                break;
            }
        }
        // Ensure c1 and c2 are assigned, defaulting to the first segment if percent is 0
        if (!c1 && percent === 0) {
             c1 = colors[0];
             c2 = colors[1];
        }
        // Fallback if something still goes wrong
        if (!c1 || !c2) {
            console.warn("Color interpolation failed for value:", value);
            return 'rgb(128, 128, 128)';
         }

        // Calculate interpolation factor carefully avoiding division by zero if offsets are same
        let factor = 0;
        if (c2.offset > c1.offset) {
             factor = (percent - c1.offset) / (c2.offset - c1.offset);
        } else if (percent === c1.offset) {
            factor = 0; // Exactly at the start color
        } else {
             factor = 1; // Assume end color if offsets are the same but percent matches
        }


        const r = Math.round(c1.color.r + factor * (c2.color.r - c1.color.r));
        const g = Math.round(c1.color.g + factor * (c2.color.g - c1.color.g));
        const b = Math.round(c1.color.b + factor * (c2.color.b - c1.color.b));

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Renamed Helper function to update handle AND range color
    function updateSliderColors(sliderInstance, value) {
        const color = getColorForValue(value);
        const sliderControl = $(sliderInstance.control); // Cache jQuery object

        // Update Handle Background
        const handle = sliderControl.find(".rs-handle");
        if (handle.length > 0) {
            handle.css("background-color", color);
        }

        // Update Range Color (Handles both non-SVG and potential SVG path)
        const rangeElement = sliderControl.find(".rs-range-color"); // Standard div range
        const rangePath = sliderControl.find(".rs-range path");     // SVG path range

        if (rangeElement.length > 0) {
            rangeElement.css("background-color", color); // Use background for div
             // console.log('Set rangeElement background:', color); // Debug log
        }
        if (rangePath.length > 0) {
             rangePath.css("fill", color); // Use fill for SVG path
             // console.log('Set rangePath fill:', color); // Debug log
        }

        // Log if neither range element was found (for debugging)
        if (rangeElement.length === 0 && rangePath.length === 0) {
             console.warn("Could not find range element (.rs-range-color or .rs-range path) for slider:", sliderControl);
        }
    }

    // --- 5. Update Display Functions (Update text description based on value) ---
    function updateMoodDisplay(value) { moodDescriptionEl.textContent = moodDescriptions[getDescriptionIndex(value)]; moodValueInputEl.value = value; }
    function updateEnergyDisplay(value) { energyDescriptionEl.textContent = energyDescriptions[getDescriptionIndex(value)]; energyValueInputEl.value = value; }
    function updateAnxietyDisplay(value) { anxietyDescriptionEl.textContent = anxietyDescriptions[getDescriptionIndex(value)]; anxietyValueInputEl.value = value; }
    function updateRestfulnessDisplay(value) { restfulnessDescriptionEl.textContent = restfulnessDescriptions[getDescriptionIndex(value)]; restfulnessValueInputEl.value = value; }
    function updateFocusDisplay(value) { focusDescriptionEl.textContent = focusDescriptions[getDescriptionIndex(value)]; focusValueInputEl.value = value; }

    // --- 6. Slider Initialization (Calls updateSliderColors) ---
    function initializeSliders() {
        const sliderOptions = {
            radius: 110, width: 20, handleSize: "+0", handleShape: "round",
            circleShape: "pie", sliderType: "min-range",
            startAngle: -45, angle: 270, // Keep working angles
            value: 50, min: 0, max: 100, step: 1,
            showTooltip: false, // Using separate div for text
            // svgMode: true // Keep OFF unless specifically needed and tested
        };

        // Mood Slider
        $("#moodSliderInstance").roundSlider({
            ...sliderOptions,
            create: function(args) { updateMoodDisplay(args.value); updateSliderColors(this, args.value); },
            valueChange: function(args) { updateMoodDisplay(args.value); updateSliderColors(this, args.value); },
            drag: function(args) { updateMoodDisplay(args.value); updateSliderColors(this, args.value); }
        });
        // Energy Slider
        $("#energySliderInstance").roundSlider({
            ...sliderOptions,
             create: function(args) { updateEnergyDisplay(args.value); updateSliderColors(this, args.value); },
             valueChange: function(args) { updateEnergyDisplay(args.value); updateSliderColors(this, args.value); },
             drag: function(args) { updateEnergyDisplay(args.value); updateSliderColors(this, args.value); }
         });
        // Anxiety Slider
        $("#anxietySliderInstance").roundSlider({
             ...sliderOptions,
             create: function(args) { updateAnxietyDisplay(args.value); updateSliderColors(this, args.value); },
             valueChange: function(args) { updateAnxietyDisplay(args.value); updateSliderColors(this, args.value); },
             drag: function(args) { updateAnxietyDisplay(args.value); updateSliderColors(this, args.value); }
        });
        // Restfulness Slider
        $("#restfulnessSliderInstance").roundSlider({
             ...sliderOptions,
             create: function(args) { updateRestfulnessDisplay(args.value); updateSliderColors(this, args.value); },
             valueChange: function(args) { updateRestfulnessDisplay(args.value); updateSliderColors(this, args.value); },
             drag: function(args) { updateRestfulnessDisplay(args.value); updateSliderColors(this, args.value); }
        });
        // Focus Slider
        $("#focusSliderInstance").roundSlider({
             ...sliderOptions,
             create: function(args) { updateFocusDisplay(args.value); updateSliderColors(this, args.value); },
             valueChange: function(args) { updateFocusDisplay(args.value); updateSliderColors(this, args.value); },
             drag: function(args) { updateFocusDisplay(args.value); updateSliderColors(this, args.value); }
        });

        console.log("Round sliders initialized with dynamic handle AND range color.");
    }

    // --- 7. Pagination Logic ---
    function showPage(index) {
        pages.forEach((page, i) => page.classList.toggle('active', i === index));
        prevBtn.disabled = (index === 0);
        nextBtn.style.display = (index === totalPages - 1) ? 'none' : 'inline-block';
        submitButton.style.display = (index === totalPages - 1) ? 'inline-block' : 'none';
        currentPageIndex = index;
        // console.log(`Showing page ${currentPageIndex}`);
    }
    function navigatePage(direction) {
        let newIndex = currentPageIndex + direction;
        if (newIndex >= 0 && newIndex < totalPages) showPage(newIndex);
    }
    prevBtn.addEventListener('click', () => navigatePage(-1));
    nextBtn.addEventListener('click', () => navigatePage(1));

    // --- 8. Form Submission (SEND TO SERVER) ---
    checkinForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const checkInData = {
            timestamp: new Date().toISOString(),
            mood: parseInt(moodValueInputEl.value), energy: parseInt(energyValueInputEl.value), anxiety: parseInt(anxietyValueInputEl.value),
            sleep_hours: parseFloat(sleepHoursInput.value) || 0, sleep_restfulness: parseInt(restfulnessValueInputEl.value), focus: parseInt(focusValueInputEl.value),
            notes: notesTextarea.value.trim()
        };

        console.log("Attempting to send data to server:", checkInData);
        submitButton.disabled = true; submitButton.textContent = 'Saving...';

        fetch('save_checkin.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(checkInData)
        })
        .then(response => {
            if (!response.ok) { return response.json().catch(() => { throw new Error(`Server responded with status ${response.status}`); }).then(errorData => { throw new Error(errorData.message || `Server responded with status ${response.status}`); }); }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                console.log("Server confirmed save:", data.message); alert("Check-in saved! 🎉");
                // Reset form
                moodValueInputEl.value = 50; energyValueInputEl.value = 50; anxietyValueInputEl.value = 50; restfulnessValueInputEl.value = 50; focusValueInputEl.value = 50;
                sleepHoursInput.value = 8; notesTextarea.value = '';
                // Also reset slider visuals
                $("#moodSliderInstance").roundSlider("option", "value", 50); $("#energySliderInstance").roundSlider("option", "value", 50); $("#anxietySliderInstance").roundSlider("option", "value", 50); $("#restfulnessSliderInstance").roundSlider("option", "value", 50); $("#focusSliderInstance").roundSlider("option", "value", 50);
                 // Explicitly update colors for reset value (might be needed if 'create' doesn't fire on reset)
                 updateSliderColors($("#moodSliderInstance").data("roundSlider"), 50);
                 updateSliderColors($("#energySliderInstance").data("roundSlider"), 50);
                 updateSliderColors($("#anxietySliderInstance").data("roundSlider"), 50);
                 updateSliderColors($("#restfulnessSliderInstance").data("roundSlider"), 50);
                 updateSliderColors($("#focusSliderInstance").data("roundSlider"), 50);

                showPage(0); // Navigate back to first page
            } else { throw new Error(data.message || 'Server reported an unspecified error.'); }
        })
        .catch(error => { console.error("Error saving check-in data:", error); alert(`Sorry, there was an error saving your check-in: ${error.message}`); })
        .finally(() => { submitButton.disabled = false; submitButton.textContent = 'Done! ✅'; });
    }); // End of submit listener

    // --- 9. Initial Setup ---
    initializeSliders();
    showPage(0);
    console.log("Check-in page initialized.");

}); // End of jQuery $(document).ready
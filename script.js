document.addEventListener('DOMContentLoaded', () => {
  let selectedRsvp = '';
  let guestName = '';
  let guestPhone = '';

  // ── Apple-style drum roll time picker with collapsible toggle ──────
  function initTimePicker(hourId, minId, ampmId, hiddenId, triggerId, dropdownId, defaultHourIdx, defaultAmpmIdx) {
    const ITEM_H      = 44;
    const PAD         = 2;
    const CONTAINER_H = 180;
    // scrollTop needed to center real item[idx] in container:
    // = (PAD + idx) * ITEM_H + ITEM_H/2  - CONTAINER_H/2
    // = PAD * ITEM_H - (CONTAINER_H - ITEM_H) / 2  + idx * ITEM_H
    const SNAP_OFFSET = PAD * ITEM_H - Math.floor((CONTAINER_H - ITEM_H) / 2);
    // = 2*44 - floor(136/2) = 88 - 68 = 20

    const hourCol   = document.getElementById(hourId);
    const minCol    = document.getElementById(minId);
    const ampmCol   = document.getElementById(ampmId);
    const hidden    = document.getElementById(hiddenId);
    const trigger   = document.getElementById(triggerId);
    const dropdown  = document.getElementById(dropdownId);
    if (!hourCol || !minCol || !ampmCol || !hidden || !trigger || !dropdown) return;

    let opened = false;

    function buildCol(col, items) {
      col.innerHTML = '';
      for (let i = 0; i < PAD; i++) {
        const d = document.createElement('div');
        d.className = 'picker-item picker-pad';
        col.appendChild(d);
      }
      items.forEach(val => {
        const d = document.createElement('div');
        d.className = 'picker-item';
        d.textContent = val;
        col.appendChild(d);
      });
      for (let i = 0; i < PAD; i++) {
        const d = document.createElement('div');
        d.className = 'picker-item picker-pad';
        col.appendChild(d);
      }
    }

    const hours   = Array.from({length: 12}, (_, i) => String(i + 1));
    const minutes = Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'));
    const ampmArr = ['AM', 'PM'];

    buildCol(hourCol, hours);
    buildCol(minCol,  minutes);
    buildCol(ampmCol, ampmArr);

    // Correctly center real item[idx] in the container
    function scrollTo(col, idx) {
      col.scrollTop = SNAP_OFFSET + idx * ITEM_H;
    }

    // Correctly decode scrollTop back to real item index
    function getIdx(col, max) {
      return Math.max(0, Math.min(Math.round((col.scrollTop - SNAP_OFFSET) / ITEM_H), max - 1));
    }

    function syncHidden() {
      const h = hours[getIdx(hourCol, hours.length)];
      const m = minutes[getIdx(minCol, minutes.length)];
      const a = ampmArr[getIdx(ampmCol, ampmArr.length)];
      const val = `${h}:${m} ${a}`;
      hidden.value = val;
      trigger.value = val;
    }

    [hourCol, minCol, ampmCol].forEach(col =>
      col.addEventListener('scroll', syncHidden, { passive: true })
    );

    // Toggle dropdown open/close on trigger click
    trigger.addEventListener('click', () => {
      const isHidden = dropdown.classList.contains('hidden');
      // Close all time dropdowns first
      document.querySelectorAll('.time-picker-dropdown').forEach(d => d.classList.add('hidden'));
      document.querySelectorAll('.time-trigger').forEach(t => t.classList.remove('active'));

      if (isHidden) {
        dropdown.classList.remove('hidden');
        trigger.classList.add('active');
        // Only set default positions on first open; preserve selection on re-open
        if (!opened) {
          scrollTo(hourCol, defaultHourIdx);
          scrollTo(minCol, 0);
          scrollTo(ampmCol, defaultAmpmIdx);
          opened = true;
        }
        syncHidden();
      }
    });

    syncHidden();
  }

  // Arrival time — default 12:00 PM
  initTimePicker('picker-hour', 'picker-minute', 'picker-ampm', 'time', 'time-trigger-arrival', 'time-dropdown-arrival', 11, 1);
  // Departure time — default 12:00 PM
  initTimePicker('picker-dep-hour', 'picker-dep-minute', 'picker-dep-ampm', 'dep-time', 'time-trigger-departure', 'time-dropdown-departure', 11, 1);
  // ───────────────────────────────────────────────────────────────────

  // Screen navigation helper
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Countdown timer to Nov 12, 2026 12:00 IST
  const targetDate = new Date('2026-11-12T12:00:00+05:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      document.getElementById('days').innerText = '00';
      document.getElementById('hours').innerText = '00';
      document.getElementById('minutes').innerText = '00';
      document.getElementById('seconds').innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Hero RSVP button → go to RSVP screen
  const startRsvpBtn = document.getElementById('startRsvp');
  if (startRsvpBtn) {
    startRsvpBtn.addEventListener('click', () => {
      showScreen('rsvp');
    });
  }

  // Back buttons
  document.querySelectorAll('.nav .back').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-go') || 'rsvp';
      showScreen(target);
    });
  });

  // Filter events based on arrival & departure dates
  function filterEvents() {
    const arrival = document.getElementById('arrival');
    const departure = document.getElementById('departure');
    const eventsSection = document.getElementById('eventsSection');
    if (!arrival || !departure || !eventsSection) return;

    const arrivalVal = arrival.value;
    const departureVal = departure.value;

    // Hide entire section until both dates are selected
    if (!arrivalVal || !departureVal) {
      eventsSection.classList.add('hidden');
      return;
    }
    eventsSection.classList.remove('hidden');

    // Extract day numbers
    const arrDay = parseInt(arrivalVal);
    const depDay = parseInt(departureVal);

    // Event date map: date the event falls on
    const eventDates = {
      'event-mayra': 12,
      'event-sangeet': 12,
      'event-haldi': 13,
      'event-reception': 13
    };

    Object.entries(eventDates).forEach(([id, eventDay]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const checkbox = el.querySelector('input[type="checkbox"]');

      // Show event only if guest is present on that day
      const visible = arrDay <= eventDay && depDay >= eventDay;
      el.style.display = visible ? '' : 'none';
      if (!visible && checkbox) {
        checkbox.checked = false;
      }
    });
  }

  const arrivalSel = document.getElementById('arrival');
  const departureSel = document.getElementById('departure');
  if (arrivalSel) arrivalSel.addEventListener('change', filterEvents);
  if (departureSel) departureSel.addEventListener('change', filterEvents);

  // Submit data to Google Sheets
  async function submitToSheets(data) {
    const url = typeof GOOGLE_SCRIPT_URL !== 'undefined' ? GOOGLE_SCRIPT_URL : '';
    if (!url) throw new Error('Google Script URL is missing.');
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    const response = await fetch(url, { method: 'POST', body: formData });
    return response.json();
  }

  // Show success screen with custom message
  function showSuccess(rsvp) {
    if (rsvp === 'No') {
      const successTitle = document.getElementById('successTitle');
      const successText = document.getElementById('successText');
      if (successTitle) successTitle.innerText = "We'll miss you!";
      if (successText) successText.innerText = "#MillieRaghavKoMillie";
    }
    showScreen('success');
  }

  // RSVP YES / NO buttons on Screen 2
  document.querySelectorAll('.rsvp-option').forEach(btn => {
    btn.addEventListener('click', async () => {
      const nameInput = document.getElementById('rsvpName');
      const phoneInput = document.getElementById('rsvpPhone');
      const rsvpError = document.getElementById('rsvpError');

      // Validate name & phone
      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';

      if (!name) {
        if (rsvpError) rsvpError.innerText = 'Please enter your full name.';
        if (nameInput) nameInput.focus();
        return;
      }

      if (!phone) {
        if (rsvpError) rsvpError.innerText = 'Please enter your phone number.';
        if (phoneInput) phoneInput.focus();
        return;
      }

      // Phone validation: strip non-digits. Should be 10 digits (or 12 digits if +91 is included)
      let digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
        digitsOnly = digitsOnly.slice(2);
      }

      if (digitsOnly.length !== 10) {
        if (rsvpError) rsvpError.innerText = 'Please enter a valid 10-digit mobile number after +91.';
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (rsvpError) rsvpError.innerText = '';

      // Store for later use — save only 10-digit number (strip +91)
      guestName = name;
      guestPhone = digitsOnly; // already validated 10-digit clean number
      selectedRsvp = btn.getAttribute('data-rsvp');

      if (selectedRsvp === 'No') {
        // Submit immediately with just name, phone, RSVP=No
        btn.disabled = true;
        try {
          await submitToSheets({
            rsvp: 'No',
            name: guestName,
            phone: guestPhone
          });
        } catch (err) {
          console.error('Submission error:', err);
        } finally {
          btn.disabled = false;
        }
        showSuccess('No');
      } else {
        // YES → go to details form
        showScreen('details');
      }
    });
  });

  // Details form submission (YES flow)
  const rsvpForm = document.getElementById('rsvpForm');
  const submitButton = document.getElementById('submitButton');
  const submitText = document.getElementById('submitText');
  const spinner = document.getElementById('spinner');
  const errorMsg = document.getElementById('error');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.innerText = '';

      // Honeypot anti-spam check
      const trap = rsvpForm.querySelector('input[name="website"]');
      if (trap && trap.value) return;

      const formData = new FormData(rsvpForm);

      submitButton.disabled = true;
      if (submitText) submitText.innerText = 'SUBMITTING...';
      if (spinner) spinner.classList.remove('hidden');

      try {
        const url = typeof GOOGLE_SCRIPT_URL !== 'undefined' ? GOOGLE_SCRIPT_URL : '';
        if (!url) throw new Error('Google Script URL is missing.');

        // Include name & phone collected from Screen 2
        formData.append('rsvp', 'Yes');
        formData.append('name', guestName);
        formData.append('phone', guestPhone);

        const response = await fetch(url, { method: 'POST', body: formData });
        const result = await response.json();

        if (result.ok) {
          showSuccess('Yes');
        } else {
          throw new Error(result.message || 'Error submitting RSVP');
        }
      } catch (err) {
        console.error('RSVP Submission Error:', err);
        // Fallback: still show success
        showSuccess('Yes');
      } finally {
        submitButton.disabled = false;
        if (submitText) submitText.innerText = 'CONFIRM RSVP';
        if (spinner) spinner.classList.add('hidden');
      }
    });
  }
});

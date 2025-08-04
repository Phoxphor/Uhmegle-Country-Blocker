// ==UserScript==
// @name         Country Blocker
// @namespace    https://uhmegle.com/
// @version      V1.45
// @description  Blocks countries on omegle
// @author       Phoxphor
// @match        https://uhmegle.com/text/
// @match        https://uhmegle.com/video/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  if (window.countryBlockerInjected) return;
  window.countryBlockerInjected = true;

  // --- Country Groups Definition ---
  const GROUPS = [
    {
      name: "Indian Subcontinent",
      key: "indian_subcontinent",
      countries: [
        "India", "Pakistan", "Bangladesh", "Nepal", "Sri Lanka", "Maldives", "Bhutan"
      ]
    },
    {
      name: "Muslim-Majority Countries",
      key: "muslim_majority",
      countries: [
        "Afghanistan", "Albania", "Algeria", "Azerbaijan", "Bahrain", "Bangladesh", "Brunei", "Burkina Faso", "Chad", "Comoros", "Djibouti", "Egypt", "Gambia", "Guinea", "Indonesia", "Iran", "Iraq", "Jordan", "Kazakhstan", "Kosovo", "Kuwait", "Kyrgyzstan", "Lebanon", "Libya", "Malaysia", "Maldives", "Mali", "Mauritania", "Morocco", "Niger", "Nigeria", "Oman", "Pakistan", "Palestine State", "Qatar", "Saudi Arabia", "Senegal", "Somalia", "Sudan", "Syria", "Tajikistan", "Tunisia", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Yemen"
      ]
    },
    {
      name: "East Asia",
      key: "east_asia",
      countries: [
        "China", "Japan", "South Korea", "North Korea", "Mongolia", "Taiwan"
      ]
    },
    {
      name: "Southeast Asia",
      key: "southeast_asia",
      countries: [
        "Brunei", "Cambodia", "Indonesia", "Laos", "Malaysia", "Myanmar (formerly Burma)", "Philippines", "Singapore", "Thailand", "Timor-Leste", "Vietnam"
      ]
    },
    {
      name: "South Asia",
      key: "south_asia",
      countries: [
        "India", "Pakistan", "Bangladesh", "Nepal", "Sri Lanka", "Maldives", "Bhutan"
      ]
    },
    {
      name: "Central Asia",
      key: "central_asia",
      countries: [
        "Kazakhstan", "Kyrgyzstan", "Tajikistan", "Turkmenistan", "Uzbekistan"
      ]
    },
    {
      name: "Middle East",
      key: "middle_east",
      countries: [
        "Bahrain", "Cyprus", "Egypt", "Iran", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Oman", "Palestine State", "Qatar", "Saudi Arabia", "Syria", "Turkey", "United Arab Emirates", "Yemen"
      ]
    },
    {
      name: "Africa",
      key: "africa",
      countries: [
        "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo (Congo-Brazzaville)", "Democratic Republic of the Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
      ]
    },
    {
      name: "North America",
      key: "north_america",
      countries: [
        "Canada", "United States", "Mexico", "Greenland"
      ]
    },
    {
      name: "Central America",
      key: "central_america",
      countries: [
        "Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Panama"
      ]
    },
    {
      name: "Caribbean",
      key: "caribbean",
      countries: [
        "Antigua and Barbuda", "Bahamas", "Barbados", "Cuba", "Dominica", "Dominican Republic", "Grenada", "Haiti", "Jamaica", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago"
      ]
    },
    {
      name: "South America",
      key: "south_america",
      countries: [
        "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"
      ]
    },
    {
      name: "Europe",
      key: "europe",
      countries: [
        "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia (Czech Republic)", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Holy See"
      ]
    },
    {
      name: "Pacific Islands",
      key: "pacific_islands",
      countries: [
        "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"
      ]
    },
    {
      name: "Western Countries",
      key: "western_countries",
      countries: [
        "Australia", "Austria", "Belgium", "Canada", "Denmark", "Finland", "France", "Germany", "Ireland", "Italy", "Netherlands", "New Zealand", "Norway", "Spain", "Sweden", "Switzerland", "United Kingdom", "United States"
      ]
    }
  ];

  // All countries list (for search/all mode)
  const allCountries = [...new Set(GROUPS.flatMap(g => g.countries))].sort();

  // Default blocked: Indian Subcontinent, Muslim-Majority, Southeast Asia, Middle East, Central Asia but you can easily change this
  const defaultBlocked = [...new Set([
    ...GROUPS.find(g => g.key === "indian_subcontinent").countries,
    ...GROUPS.find(g => g.key === "muslim_majority").countries,
    ...GROUPS.find(g => g.key === "southeast_asia").countries,
    ...GROUPS.find(g => g.key === "middle_east").countries,
    ...GROUPS.find(g => g.key === "central_asia").countries
  ])];

  // --- Styles ---
  const style = document.createElement('style');
  style.textContent = `
    #countryBlockerGUI {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      width: 240px;
      background: rgba(24,24,28,0.98);
      color: #f3f3f3;
      font-family: 'Inter', Arial, sans-serif;
      font-size: 13px;
      border-radius: 10px;
      box-shadow: 0 2px 16px #0006;
      z-index: 999999;
      user-select: none;
      display: flex;
      flex-direction: column;
      max-height: 340px;
      overflow: hidden;
      border: 1px solid #23232a;
      transition: box-shadow 0.2s;
    }
    #countryBlockerGUI:hover {
      box-shadow: 0 4px 24px #000a;
    }
    #countryBlockerHeader {
      background: transparent;
      padding: 0 8px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      font-size: 14px;
      border-bottom: 1px solid #23232a;
      letter-spacing: 0.02em;
      cursor: pointer;
      user-select: none;
    }
    #countryBlockerHeader span {
      flex: 1;
      text-align: left;
      color: #b6b6c9;
      font-size: 13px;
      font-weight: 500;
      padding-left: 2px;
    }
    #countryBlockerToggle {
      background: none;
      border: none;
      color: #b6b6c9;
      width: 28px;
      height: 28px;
      font-size: 18px;
      line-height: 18px;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 2px;
      margin-right: -4px;
      outline: none;
    }
    #countryBlockerToggle:hover {
      background: #23232a;
      color: #fff;
    }
    #countryBlockerSearch {
      width: 100%;
      box-sizing: border-box;
      margin: 6px 0 4px 0;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #23232a;
      background: #18181c;
      color: #f3f3f3;
      font-size: 13px;
      outline: none;
      transition: border 0.15s;
      display: none;
    }
    #countryBlockerSearch:focus {
      border: 1.5px solid #4e8cff;
      background: #20202a;
    }
    #countryBlockerContent {
      overflow-y: auto;
      padding: 4px 8px 4px 8px;
      background: transparent;
      display: none; /* Start minimized */
      flex-direction: column;
      gap: 2px;
      max-height: 180px;
      min-height: 0;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }
  `;
  document.head.appendChild(style);

  style.textContent = `
    #countryBlockerGUI {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      width: 240px;
      background: rgba(24,24,28,0.98);
      color: #f3f3f3;
      font-family: 'Inter', Arial, sans-serif;
      font-size: 13px;
      border-radius: 10px;
      box-shadow: 0 2px 16px #0006;
      z-index: 999999;
      user-select: none;
      display: flex;
      flex-direction: column;
      max-height: 340px;
      overflow: hidden;
      border: 1px solid #23232a;
      transition: box-shadow 0.2s;
    }
    #countryBlockerGUI:hover {
      box-shadow: 0 4px 24px #000a;
    }
    #countryBlockerHeader {
      background: transparent;
      padding: 0 8px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      font-size: 14px;
      border-bottom: 1px solid #23232a;
      letter-spacing: 0.02em;
      cursor: pointer;
      user-select: none;
    }
    #countryBlockerHeader span {
      flex: 1;
      text-align: left;
      color: #b6b6c9;
      font-size: 13px;
      font-weight: 500;
      padding-left: 2px;
    }
    #countryBlockerToggle {
      background: none;
      border: none;
      color: #b6b6c9;
      width: 28px;
      height: 28px;
      font-size: 18px;
      line-height: 18px;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 2px;
      margin-right: -4px;
      outline: none;
    }
    #countryBlockerToggle:hover {
      background: #23232a;
      color: #fff;
    }
    #countryBlockerSearch {
      width: 100%;
      box-sizing: border-box;
      margin: 6px 0 4px 0;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #23232a;
      background: #18181c;
      color: #f3f3f3;
      font-size: 13px;
      outline: none;
      transition: border 0.15s;
      display: none;
    }
    #countryBlockerSearch:focus {
      border: 1.5px solid #4e8cff;
      background: #20202a;
    }
    #countryBlockerContent {
      overflow-y: auto;
      padding: 4px 8px 4px 8px;
      background: transparent;
      display: none; /* Start minimized */
      flex-direction: column;
      gap: 2px;
      max-height: 180px;
      min-height: 0;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }
    .cb-group-btn {
      background: #23232a;
      border: none;
      color: #b6b6c9;
      padding: 6px 10px;
      border-radius: 6px;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      font-size: 13px;
      margin-bottom: 4px;
      margin-top: 2px;
      width: 100%;
      text-align: left;
      transition: background 0.15s, color 0.15s;
      outline: none;
      display: block;
    }
    .cb-group-btn:hover {
      background: #4e8cff;
      color: #fff;
    }
    .cb-back-btn {
      background: #23232a;
      border: none;
      color: #b6b6c9;
      padding: 3px 10px;
      border-radius: 6px;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      font-size: 12px;
      margin-bottom: 6px;
      margin-top: 2px;
      width: auto;
      transition: background 0.15s, color 0.15s;
      outline: none;
      display: inline-block;
    }
    .cb-back-btn:hover {
      background: #4e8cff;
      color: #fff;
    }
    .cb-blockall-btn {
      background: #4e8cff;
      border: none;
      color: #fff;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      user-select: none;
      font-weight: 600;
      font-size: 13px;
      margin-top: 8px;
      width: 100%;
      transition: background 0.15s, color 0.15s;
      outline: none;
      display: block;
    }
    .cb-blockall-btn:hover {
      background: #23232a;
      color: #b6b6c9;
    }
    #countryBlockerContent label {
      display: flex;
      align-items: center;
      cursor: pointer;
      user-select: none;
      font-size: 13px;
      padding: 2px 0;
      border-radius: 4px;
      transition: background 0.12s;
    }
    #countryBlockerContent label:hover {
      background: #23232a;
    }
    #countryBlockerContent input[type=checkbox] {
      margin-right: 7px;
      accent-color: #4e8cff;
      cursor: pointer;
      width: 14px;
      height: 14px;
      border-radius: 3px;
      border: 1px solid #23232a;
      background: #23232a;
      transition: border 0.12s;
    }
    #countryBlockerFooter {
      padding: 4px 8px 6px 8px;
      background: transparent;
      border-top: 1px solid #23232a;
      display: none; /* Start minimized */
      justify-content: flex-end;
      align-items: center;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }
    #countryBlockerFooter button {
      background: #23232a;
      border: none;
      color: #b6b6c9;
      padding: 3px 10px;
      border-radius: 6px;
      cursor: pointer;
      user-select: none;
      font-weight: 500;
      font-size: 12px;
      transition: background 0.15s, color 0.15s;
      outline: none;
    }
    #countryBlockerFooter button:hover {
      background: #4e8cff;
      color: #fff;
    }
    @media (max-width: 500px) {
      #countryBlockerGUI { left: 50vw; right: auto; width: 98vw; min-width: 0; max-width: 99vw; transform: translateX(-50%); }
    }
  `;
  document.head.appendChild(style);

  // --- Utility ---
  function normalizeCountryName(name) {
    return typeof name === "string" ? name.trim().toLowerCase() : '';
  }

  // --- GUI Elements ---
  const gui = document.createElement('div');
  gui.id = 'countryBlockerGUI';

  // --- Header ---
  const header = document.createElement('div');
  header.id = 'countryBlockerHeader';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = 'Country Blocker';
  header.appendChild(titleSpan);
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'countryBlockerToggle';
  toggleBtn.textContent = '+';
  header.appendChild(toggleBtn);
  gui.appendChild(header);

  // Search input (only in "All Countries" mode)
  const searchInput = document.createElement('input');
  searchInput.id = 'countryBlockerSearch';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search...';
  searchInput.autocomplete = 'off';
  gui.appendChild(searchInput);

  // Content container
  const content = document.createElement('div');
  content.id = 'countryBlockerContent';
  gui.appendChild(content);

  // Footer
  const footer = document.createElement('div');
  footer.id = 'countryBlockerFooter';
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear';
  footer.appendChild(clearBtn);
  gui.appendChild(footer);

  document.body.appendChild(gui);

  // --- State ---
  let blockedCountries;
  const stored = localStorage.getItem('uhmegleBlockedCountries');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        blockedCountries = parsed;
      } else {
        blockedCountries = [...defaultBlocked];
      }
    } catch (e) {
      blockedCountries = [...defaultBlocked];
    }
  } else {
    blockedCountries = [...defaultBlocked];
  }

  // --- Save/Load ---
  function saveBlocked() {
    try {
      localStorage.setItem('uhmegleBlockedCountries', JSON.stringify(blockedCountries));
    } catch (e) {
      console.error("Country Blocker: Failed to save blocked countries to localStorage.", e);
    }
  }

  // --- GUI Navigation State ---
  // null = group list, otherwise group key or "all"
  let currentView = null;

  // --- GUI Rendering ---
  function renderGroupList() {
    content.innerHTML = '';
    searchInput.style.display = 'none';
    for (const group of GROUPS) {
      const btn = document.createElement('button');
      btn.className = 'cb-group-btn';
      btn.textContent = group.name;
      btn.onclick = () => {
        currentView = group.key;
        renderGroup(group);
      };
      content.appendChild(btn);
    }
    // All Countries button
    const allBtn = document.createElement('button');
    allBtn.className = 'cb-group-btn';
    allBtn.textContent = 'All Countries';
    allBtn.onclick = () => {
      currentView = 'all';
      renderAllCountries();
    };
    content.appendChild(allBtn);
  }

  function createCountryCheckbox(country) {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const isBlocked = blockedCountries.some(c => normalizeCountryName(c) === normalizeCountryName(country));
    checkbox.checked = isBlocked;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (!blockedCountries.some(c => normalizeCountryName(c) === normalizeCountryName(country))) {
          blockedCountries.push(country);
        }
      } else {
        blockedCountries = blockedCountries.filter(c => normalizeCountryName(c) !== normalizeCountryName(country));
      }
      saveBlocked();
      // Update all checkboxes in this view
      if (currentView === 'all') {
        renderAllCountries();
      } else {
        const group = GROUPS.find(g => g.key === currentView);
        if (group) renderGroup(group);
      }
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(country));
    return label;
  }

  function renderGroup(group) {
    content.innerHTML = '';
    // Back button, generally cant belive this was a after thought
    const backBtn = document.createElement('button');
    backBtn.className = 'cb-back-btn';
    backBtn.textContent = '← Back';
    backBtn.onclick = () => {
      currentView = null;
      renderGroupList();
    };
    content.appendChild(backBtn);

    // List of countries
    for (const country of group.countries) {
      content.appendChild(createCountryCheckbox(country));
    }

    // Block all button
    const blockAllBtn = document.createElement('button');
    blockAllBtn.className = 'cb-blockall-btn';
    blockAllBtn.textContent = `Block all (${group.name})`;
    blockAllBtn.onclick = () => {
      for (const country of group.countries) {
        if (!blockedCountries.some(c => normalizeCountryName(c) === normalizeCountryName(country))) {
          blockedCountries.push(country);
        }
      }
      saveBlocked();
      renderGroup(group);
    };
    content.appendChild(blockAllBtn);

    searchInput.style.display = 'none';
  }

  function renderAllCountries() {
    content.innerHTML = '';
    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'cb-back-btn';
    backBtn.textContent = '← Back';
    backBtn.onclick = () => {
      currentView = null;
      renderGroupList();
    };
    content.appendChild(backBtn);

    // Search input
    searchInput.style.display = 'block';

    // List of countries (filtered)
    const filter = searchInput.value.trim().toLowerCase();
    for (const country of allCountries) {
      if (!filter || country.toLowerCase().includes(filter)) {
        content.appendChild(createCountryCheckbox(country));
      }
    }

    // Block all button
    const blockAllBtn = document.createElement('button');
    blockAllBtn.className = 'cb-blockall-btn';
    blockAllBtn.textContent = `Block all (All Countries)`;
    blockAllBtn.onclick = () => {
      for (const country of allCountries) {
        if (!blockedCountries.some(c => normalizeCountryName(c) === normalizeCountryName(country))) {
          blockedCountries.push(country);
        }
      }
      saveBlocked();
      renderAllCountries();
    };
    content.appendChild(blockAllBtn);
  }

  // --- GUI Toggle ---
  function toggleGUI() {
    const isVisible = content.style.display !== 'none';
    if (isVisible) {
      content.style.display = 'none';
      footer.style.display = 'none';
      searchInput.style.display = 'none';
      toggleBtn.textContent = '+';
    } else {
      content.style.display = 'flex';
      footer.style.display = 'flex';
      toggleBtn.textContent = '–';
      if (currentView === 'all') {
        searchInput.style.display = 'block';
      } else {
        searchInput.style.display = 'none';
      }
      // Render current view
      if (currentView === null) {
        renderGroupList();
      } else if (currentView === 'all') {
        renderAllCountries();
      } else {
        const group = GROUPS.find(g => g.key === currentView);
        if (group) renderGroup(group);
      }
    }
  }

  // --- Skip Function --
  // This likely isnt perfect feel free to make fun off me for how i did this it wasnt working suck it lmfao
  function trySkip() {
    setTimeout(() => {
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true });
      document.dispatchEvent(escEvent);
      setTimeout(() => {
        document.dispatchEvent(escEvent);
      }, 100);
    }, 500);
    return true;
  }

  function getCountryName() {
    const el = document.getElementById('countryName');
    if (!el) return null;
    return (el.textContent || '').trim();
  }

  function setupCountryObserver() {
    const countryNameEl = document.getElementById('countryName');
    if (!countryNameEl) {
      console.warn('Country Blocker: #countryName element not found on page.');
      return;
    }
    const observerCallback = (mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const country = getCountryName();
          if (!country) return;
          //  Do not assign to const blockedCountries, use the let variable
          if (Array.isArray(blockedCountries) && blockedCountries.some(c => normalizeCountryName(c) === normalizeCountryName(country))) {
            console.log(`[Country Blocker] Auto skipping blocked country: ${country}`);
            trySkip();
          }
        }
      }
    };
    const observer = new MutationObserver(observerCallback);
    observer.observe(countryNameEl, {
      characterData: true,
      subtree: true,
      childList: true,
    });
  }

  // --- Footer Buttons ---
  clearBtn.addEventListener('click', () => {
    blockedCountries = [];
    saveBlocked();
    // Rerender current view
    if (currentView === null) {
      renderGroupList();
    } else if (currentView === 'all') {
      renderAllCountries();
    } else {
      const group = GROUPS.find(g => g.key === currentView);
      if (group) renderGroup(group);
    }
  });

  // --- Header Toggle ---
  toggleBtn.addEventListener('click', toggleGUI);

  // --- Search input event ---
  searchInput.addEventListener('input', () => {
    if (currentView === 'all') renderAllCountries();
  });

  // --- Initial load: update list and start minimized ---
  searchInput.style.display = 'none';
  content.style.display = 'none';
  footer.style.display = 'none';
  currentView = null;
  renderGroupList();

  // --- Setup observer for country changes ---
  setupCountryObserver();

  // --- Also check on initial load if current stranger should be skipped ---
  const initialCountry = getCountryName();
  if (initialCountry && blockedCountries.some(c => normalizeCountryName(c) === normalizeCountryName(initialCountry))) {
    console.log(`[Country Blocker] Auto skipping blocked country on load: ${initialCountry}`);
    trySkip();
  }

  // --- Expose for debugging or manual control ---
  window.countryBlocker = {
    get blockedCountries() { return blockedCountries; },
    allCountries,
    GROUPS,
    renderGroupList,
    renderAllCountries,
    toggleGUI,
  };
})();

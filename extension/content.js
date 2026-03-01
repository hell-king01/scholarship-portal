let sidebar = null;

function createSidebar(userData) {
    if (sidebar) {
        sidebar.remove();
        sidebar = null;
        return;
    }

    sidebar = document.createElement('div');
    sidebar.id = 'scholar-match-assistant-sidebar';

    const header = document.createElement('div');
    header.className = 'sma-header';
    header.innerHTML = `
    <h3 class="sma-title">ScholarMatch Co-Pilot</h3>
    <button class="sma-close-btn" id="sma-close">&times;</button>
  `;

    const content = document.createElement('div');
    content.className = 'sma-content';

    const fields = [
        { label: 'Aadhar Number', value: userData.aadhar || 'XXXX-XXXX-XXXX' },
        { label: 'Full Name', value: userData.fullName || 'Not Profiled' },
        { label: 'Date of Birth', value: userData.dob || 'Not Set' },
        { label: 'Gender', value: userData.gender || 'Not Set' },
        { label: 'Annual Income', value: `₹${userData.income || 0}` },
        { label: 'State', value: userData.state || 'Not Set' },
        { label: 'Category', value: userData.category || 'Not Set' },
        { label: 'Education Level', value: userData.education || 'Not Set' },
        { label: 'Percentage', value: userData.percentage ? `${userData.percentage}%` : 'Not Set' },
        { label: 'Disability', value: userData.disability || 'No' },
        { label: 'Institution', value: userData.institution || 'Not Set' },
        { label: 'Course', value: userData.course || 'Not Set' }
    ];

    fields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'sma-field';
        fieldDiv.innerHTML = `
      <div class="sma-label">${field.label}</div>
      <div class="sma-value">${field.value}</div>
      <button class="sma-copy-btn" data-value="${field.value}">
        <svg fill="#64748b" width="16" height="16" viewBox="0 0 24 24"><path d="M16 1h-11c-1.1 0-2 .9-2 2v14h2v-14h11v-2zm3 4h-11c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2zm0 16h-11v-14h11v14z"/></svg>
      </button>
    `;
        content.appendChild(fieldDiv);
    });

    const autofillBtn = document.createElement('button');
    autofillBtn.className = 'sma-autofill-btn';
    autofillBtn.innerHTML = '⚡ Auto-Fill Scholarship Form';
    autofillBtn.style.cssText = 'width: 100%; padding: 10px; background: #0f172a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;';
    autofillBtn.onclick = () => autoFillPage(userData);

    content.appendChild(autofillBtn);

    const footer = document.createElement('div');
    footer.className = 'sma-footer';
    footer.innerText = 'ScholarMatch Extension 2026';

    sidebar.appendChild(header);
    sidebar.appendChild(content);
    sidebar.appendChild(footer);
    document.body.appendChild(sidebar);

    // Add event listeners
    document.getElementById('sma-close').onclick = () => {
        sidebar.remove();
        sidebar = null;
    };

    function autoFillPage(data) {
        let filledCount = 0;
        const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');

        inputs.forEach(input => {
            // Check placeholders, ids, names, and aria-labels, and nearest labels
            let labelText = '';
            if (input.id) {
                const label = document.querySelector(`label[for="${input.id}"]`);
                if (label) labelText = label.innerText;
            }
            if (!labelText) labelText = input.closest('label')?.innerText || '';

            const nameAttr = (input.name || input.id || input.placeholder || input.getAttribute('aria-label') || input.className || labelText).toLowerCase();
            let valueToSet = null;

            // Name (Avoid Username)
            if ((nameAttr.includes('name') || nameAttr.includes('first')) && !nameAttr.includes('user')) {
                valueToSet = data.fullName;
            }
            // Aadhar
            else if (nameAttr.includes('aadhar') || nameAttr.includes('uid')) {
                valueToSet = data.aadhar;
            }
            // Gender
            else if (nameAttr.includes('gender') || nameAttr.includes('sex')) {
                valueToSet = data.gender;
            }
            // Splitted DOB Date
            else if (nameAttr.includes('dd') || nameAttr.includes('day')) {
                valueToSet = data.dob ? data.dob.split('-')[2] : null;
            }
            else if (nameAttr.includes('mm') || nameAttr.includes('month')) {
                valueToSet = data.dob ? data.dob.split('-')[1] : null;
            }
            else if (nameAttr.includes('yyyy') || nameAttr.includes('year')) {
                valueToSet = data.dob ? data.dob.split('-')[0] : null;
            }
            // Full DOB Date
            else if (nameAttr.includes('dob') || nameAttr.includes('birth') || nameAttr.includes('date')) {
                valueToSet = data.dob;
            }
            // Income
            else if (nameAttr.includes('income')) {
                valueToSet = data.income;
            }
            // State
            else if (nameAttr.includes('state')) {
                valueToSet = data.state;
            }
            // Category/Caste
            else if (nameAttr.includes('category') || nameAttr.includes('caste')) {
                valueToSet = data.category;
            }
            // Percentage
            else if (nameAttr.includes('percent') || nameAttr.includes('marks')) {
                valueToSet = data.percentage;
            }
            // Institution
            else if (nameAttr.includes('institution') || nameAttr.includes('college')) {
                valueToSet = data.institution;
            }
            // Course
            else if (nameAttr.includes('course')) {
                valueToSet = data.course;
            }

            if (!valueToSet) return;

            const setNativeValue = (element, value) => {
                const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
                const prototype = Object.getPrototypeOf(element);
                const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

                if (valueSetter && valueSetter !== prototypeValueSetter) {
                    prototypeValueSetter.call(element, value);
                } else if (valueSetter) {
                    valueSetter.call(element, value);
                } else {
                    element.value = value;
                }
            };

            if (input.tagName.toLowerCase() === 'select') {
                const options = Array.from(input.options);
                const matchingOption = options.find(opt => {
                    const optText = opt.text.toLowerCase();
                    const optVal = opt.value.toLowerCase();
                    const target = String(valueToSet).toLowerCase();
                    if (target === 'male' && (optText === 'm' || optVal === 'm')) return true;
                    if (target === 'female' && (optText === 'f' || optVal === 'f')) return true;
                    return optText.includes(target) || optVal.includes(target);
                });
                if (matchingOption && (!input.value || input.value === '' || input.value === '0' || input.value.includes('Select'))) {
                    setNativeValue(input, matchingOption.value);
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    filledCount++;
                }
            } else if (!input.value) {
                if (input.type === 'date' && typeof valueToSet === 'string') {
                    setNativeValue(input, valueToSet);
                } else if (input.type === 'radio' && input.value.toLowerCase() === String(valueToSet).toLowerCase()) {
                    input.checked = true;
                } else {
                    setNativeValue(input, valueToSet);
                }

                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                filledCount++;
            }
        });

        autofillBtn.innerHTML = `✅ Filled ${filledCount} fields!`;
        setTimeout(() => {
            autofillBtn.innerHTML = '⚡ Auto-Fill Scholarship Form';
        }, 2500);
    }

    const copyBtns = sidebar.querySelectorAll('.sma-copy-btn');
    copyBtns.forEach(btn => {
        btn.onclick = () => {
            const textToCopy = btn.getAttribute('data-value');
            navigator.clipboard.writeText(textToCopy);

            const originalIcon = btn.innerHTML;
            btn.innerHTML = '<svg fill="#10b981" width="16" height="16" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
            setTimeout(() => btn.innerHTML = originalIcon, 2000);
        };
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleSidebar") {
        chrome.storage.local.get(['userData'], (data) => {
            if (data.userData) {
                createSidebar(data.userData);
            } else {
                alert("Please connect your account in the extension popup first!");
            }
        });
    }
});

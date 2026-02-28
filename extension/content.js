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
        { label: 'Annual Income', value: `₹${userData.income || 0}` },
        { label: 'State', value: userData.state || 'Not Set' },
        { label: 'Category', value: userData.category || 'Not Set' },
        { label: 'Education Level', value: userData.education || 'Not Set' }
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

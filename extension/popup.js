const SUPABASE_URL = 'https://vemskadgdfktywjodxop.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbXNrYWRnZGZrdHl3am9keG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTkxMzQsImV4cCI6MjA4Njc5NTEzNH0.o3EV4diqJNnLIsS4hC1C5E1qi-XUhXQt-NoHNRYvfeU';

document.addEventListener('DOMContentLoaded', async () => {
    const loginButton = document.getElementById('login-btn');
    const toggleButton = document.getElementById('toggle-sidebar');
    const logoutButton = document.getElementById('logout-btn');
    const userIdInput = document.getElementById('user-id-input');
    const loggedInView = document.getElementById('logged-in-view');
    const loggedOutView = document.getElementById('logged-out-view');
    const userDisplay = document.getElementById('user-display');
    const demoBtn = document.createElement('button');
    demoBtn.innerText = '✨ Demo Quick Connect';
    demoBtn.className = 'btn btn-secondary';
    demoBtn.style.marginBottom = '8px';
    loggedOutView.prepend(demoBtn);

    demoBtn.onclick = () => {
        alert('Please go to your Profile Dashboard and click "Copy Sync Code" to test this extension natively!');
    };

    // Check if we already have a user in storage
    const stored = await chrome.storage.local.get(['userId', 'userData']);
    if (stored.userId && stored.userData) {
        showLoggedIn(stored.userData);
    } else {
        // Automatically hide logged in view on start if no data
        loggedInView.style.display = 'none';
        loggedOutView.style.display = 'block';
    }

    loginButton.addEventListener('click', async () => {
        const userId = userIdInput.value.trim();
        if (!userId) {
            alert('Please enter your User ID');
            return;
        }

        loginButton.disabled = true;
        loginButton.innerText = 'Connecting...';

        try {
            // Decode the Base64 token
            const decodedString = atob(userId);
            const userData = JSON.parse(decodedString);

            if (userData && userData.id && userData.fullName) {
                await chrome.storage.local.set({ userId: userData.id, userData });
                showLoggedIn(userData);
            } else {
                throw new Error("Invalid token format");
            }
        } catch (error) {
            console.error("Token Error:", error);
            alert('Invalid Sync Token. Please make sure you copied the entire token from your ScholarMatch Dashboard.');
        } finally {
            loginButton.disabled = false;
            loginButton.innerText = 'Secure Connect';
        }
    });

    toggleButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSidebar" });
        });
    });

    logoutButton.addEventListener('click', async () => {
        await chrome.storage.local.remove(['userId', 'userData']);
        loggedInView.style.display = 'none';
        loggedOutView.style.display = 'block';
    });

    function showLoggedIn(userData) {
        userDisplay.innerText = `Logged in as ${userData.fullName}`;
        loggedOutView.style.display = 'none';
        loggedInView.style.display = 'block';
    }
});

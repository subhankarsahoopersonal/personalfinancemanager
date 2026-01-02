/* ============================================
   Firebase Configuration & Data Management
   ============================================

   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com/
   2. Create a new project (or use existing one)
   3. Add a Web App to your project
   4. Copy your Firebase config below
   5. Enable Firestore Database in your Firebase Console
   6. Set Firestore rules to allow read/write (for testing)

   ============================================ */

// ⚠️ REPLACE THIS WITH YOUR FIREBASE CONFIG ⚠️
const firebaseConfig = {
    apiKey: "AIzaSyDMGVtUOQxyNHz8Iw8TYJl7xlpQyZkYrUk",
    authDomain: "finance-manager-6969.firebaseapp.com",
    projectId: "finance-manager-6969",
    storageBucket: "finance-manager-6969.firebasestorage.app",
    messagingSenderId: "467834434338",
    appId: "1:467834434338:web:46b5f6a9bd6d40d94e2b7b",
    measurementId: "G-PYE7RNJP4T"
};

// Initialize Firebase (will be done after SDK loads)
let db = null;
let auth = null;
let firebaseInitialized = false;
let currentUser = null;

// Initialize Firebase when SDK is ready
function initializeFirebase() {
    if (typeof firebase !== 'undefined' && !firebaseInitialized) {
        try {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            auth = firebase.auth();

            // Enable offline persistence for better reliability
            db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
                console.log('Persistence error (non-critical):', err.code);
            });

            firebaseInitialized = true;
            console.log('✅ Firebase initialized successfully!');

            // Setup auth state listener
            setupAuthStateListener();

            return true;
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            showNotification('Using local data (Firebase offline)', 'warning');
            refreshUI();
            return false;
        }
    }
    return false;
}

/* ============================================
   AUTHENTICATION FUNCTIONS
   ============================================ */

// Auth state listener
function setupAuthStateListener() {
    auth.onAuthStateChanged((user) => {
        currentUser = user;

        const landingPage = document.getElementById('landing-page');
        const loginPage = document.getElementById('login-page');
        const appContainer = document.getElementById('app-container');

        if (user) {
            // User is logged in - show dashboard
            console.log('✅ User logged in:', user.email);
            if (landingPage) landingPage.style.display = 'none';
            if (loginPage) loginPage.style.display = 'none';
            if (appContainer) appContainer.style.display = 'flex';

            // Update sidebar with user info
            updateSidebarUserFromAuth(user);

            // Load user data
            loadAllData();
        } else {
            // User is logged out - show landing page
            console.log('👤 User logged out');
            if (landingPage) landingPage.style.display = 'block';
            if (loginPage) loginPage.style.display = 'none';
            if (appContainer) appContainer.style.display = 'none';
        }
    });
}

// Show auth page (sign in or sign up)
function showAuthPage(tab = 'signin') {
    const landingPage = document.getElementById('landing-page');
    const loginPage = document.getElementById('login-page');

    if (landingPage) landingPage.style.display = 'none';
    if (loginPage) loginPage.style.display = 'flex';

    // Switch to the correct tab
    const signinTab = document.querySelector('.login-tab[data-tab="signin"]');
    const signupTab = document.querySelector('.login-tab[data-tab="signup"]');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');

    if (tab === 'signup') {
        signinTab?.classList.remove('active');
        signupTab?.classList.add('active');
        signinForm?.classList.remove('active');
        signupForm?.classList.add('active');
    } else {
        signinTab?.classList.add('active');
        signupTab?.classList.remove('active');
        signinForm?.classList.add('active');
        signupForm?.classList.remove('active');
    }
}

// Make showAuthPage globally available
window.showAuthPage = showAuthPage;

// Sign up with email/password and save display name
async function signUpWithEmail(email, password, displayName) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update Firebase profile with display name
        await user.updateProfile({
            displayName: displayName
        });

        // Save user data to Firestore
        if (db) {
            await db.collection('users').doc(user.uid).set({
                displayName: displayName,
                email: email,
                createdAt: new Date().toISOString()
            });
        }

        console.log('✅ Account created:', user.email, 'Name:', displayName);
        showNotification('Account created successfully!', 'success');
        return { success: true, user: user };
    } catch (error) {
        console.error('❌ Sign up error:', error);
        return { success: false, error: getAuthErrorMessage(error.code) };
    }
}

// Sign in with email/password
async function signInWithEmail(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ User signed in:', userCredential.user.email);
        showNotification('Welcome back!', 'success');
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('❌ Sign in error:', error);
        return { success: false, error: getAuthErrorMessage(error.code) };
    }
}

// Sign out
async function signOutUser() {
    try {
        await auth.signOut();
        console.log('✅ User signed out');
        showNotification('Logged out successfully', 'success');
        return { success: true };
    } catch (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// Get user-friendly error messages
function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Try signing in.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/invalid-credential': 'Invalid email or password.'
    };
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// Update sidebar with authenticated user info
function updateSidebarUserFromAuth(user) {
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const sidebarUsername = document.getElementById('sidebar-username');
    const sidebarEmail = document.getElementById('sidebar-email');

    if (user) {
        const displayName = user.displayName || user.email.split('@')[0];
        const initial = displayName.charAt(0).toUpperCase();

        if (sidebarAvatar) sidebarAvatar.innerHTML = `<span>${initial}</span>`;
        if (sidebarUsername) sidebarUsername.textContent = displayName;
        if (sidebarEmail) sidebarEmail.textContent = user.email;

        // Save to localStorage for settings page
        localStorage.setItem('dashboard-settings', JSON.stringify({
            displayName: displayName,
            currency: getCurrentCurrency()
        }));
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

// Handle logout
async function handleLogout() {
    if (!auth) {
        showNotification('Auth not initialized', 'error');
        return;
    }

    await signOutUser();
}

// Make functions globally available
window.togglePassword = togglePassword;
window.handleLogout = handleLogout;

// Setup logout button event listener
function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    setupLogoutButton();
});

/* ============================================
   DATA MODELS & DEFAULT DATA
   ============================================ */

// Default data structure (fresh start for new users)
const defaultData = {
    stats: {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        investments: 0,
        balanceChange: 0,
        incomeChange: 0,
        expensesChange: 0,
        investmentsChange: 0
    },
    transactions: [],
    goals: [],
    portfolio: [],
    spending: {
        Housing: 0,
        Food: 0,
        Transport: 0,
        Shopping: 0,
        Entertainment: 0,
        Others: 0
    },
    revenue: {
        week: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            revenue: [0, 0, 0, 0, 0, 0, 0],
            expenses: [0, 0, 0, 0, 0, 0, 0]
        },
        month: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            revenue: [0, 0, 0, 0],
            expenses: [0, 0, 0, 0]
        },
        year: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            expenses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    }
};

// Current data (either from Firebase or local)
let currentData = JSON.parse(JSON.stringify(defaultData));

/* ============================================
   FIREBASE CRUD OPERATIONS
   ============================================ */

// Load all data from Firebase
async function loadAllData() {
    if (!firebaseInitialized || !db) {
        console.log('Using local default data');
        refreshUI();
        return;
    }

    try {
        // Load stats
        const statsDoc = await db.collection('dashboard').doc('stats').get();
        if (statsDoc.exists) {
            currentData.stats = statsDoc.data();
        }

        // Load transactions
        const transactionsSnapshot = await db.collection('transactions').orderBy('date', 'desc').limit(10).get();
        if (!transactionsSnapshot.empty) {
            currentData.transactions = transactionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        // Load goals
        const goalsSnapshot = await db.collection('goals').get();
        if (!goalsSnapshot.empty) {
            currentData.goals = goalsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        // Load portfolio
        const portfolioSnapshot = await db.collection('portfolio').get();
        if (!portfolioSnapshot.empty) {
            currentData.portfolio = portfolioSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        }

        // Load spending categories
        const spendingDoc = await db.collection('dashboard').doc('spending').get();
        if (spendingDoc.exists) {
            currentData.spending = spendingDoc.data();
        }

        console.log('✅ Data loaded from Firebase');
        showNotification('Connected to Firebase!', 'success');
        refreshUI();

    } catch (error) {
        console.error('Error loading data:', error);

        // Check if it's a permission error
        if (error.code === 'permission-denied') {
            showNotification('Firebase: Set Firestore rules to allow read/write', 'warning');
        } else if (error.message && error.message.includes('offline')) {
            showNotification('Using local data (offline mode)', 'warning');
        } else {
            showNotification('Using local data', 'warning');
        }

        // Fall back to local default data
        refreshUI();
    }
}

// Save stats to Firebase
async function saveStats(stats) {
    currentData.stats = { ...currentData.stats, ...stats };

    if (firebaseInitialized && db) {
        try {
            await db.collection('dashboard').doc('stats').set(currentData.stats);
            console.log('Stats saved to Firebase');
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    refreshStatsUI();
}

// Add/Update transaction
async function saveTransaction(transaction) {
    const isNew = !transaction.id;

    if (firebaseInitialized && db) {
        try {
            if (isNew) {
                const docRef = await db.collection('transactions').add(transaction);
                transaction.id = docRef.id;
            } else {
                await db.collection('transactions').doc(transaction.id).set(transaction);
            }
            console.log('Transaction saved to Firebase');
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    } else {
        if (isNew) {
            transaction.id = Date.now().toString();
        }
    }

    // Update local data
    const existingIndex = currentData.transactions.findIndex(t => t.id === transaction.id);
    if (existingIndex >= 0) {
        currentData.transactions[existingIndex] = transaction;
    } else {
        currentData.transactions.unshift(transaction);
    }

    // Keep only last 10 transactions in memory
    currentData.transactions = currentData.transactions.slice(0, 10);

    refreshTransactionsUI();
    showNotification('Transaction saved!', 'success');
}

// Delete transaction
async function deleteTransaction(id) {
    if (firebaseInitialized && db) {
        try {
            await db.collection('transactions').doc(id).delete();
            console.log('Transaction deleted from Firebase');
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }

    currentData.transactions = currentData.transactions.filter(t => t.id !== id);
    refreshTransactionsUI();
    showNotification('Transaction deleted!', 'success');
}

// Add/Update goal
async function saveGoal(goal) {
    const isNew = !goal.id;

    if (firebaseInitialized && db) {
        try {
            if (isNew) {
                const docRef = await db.collection('goals').add(goal);
                goal.id = docRef.id;
            } else {
                await db.collection('goals').doc(goal.id).set(goal);
            }
            console.log('Goal saved to Firebase');
        } catch (error) {
            console.error('Error saving goal:', error);
        }
    } else {
        if (isNew) {
            goal.id = Date.now().toString();
        }
    }

    const existingIndex = currentData.goals.findIndex(g => g.id === goal.id);
    if (existingIndex >= 0) {
        currentData.goals[existingIndex] = goal;
    } else {
        currentData.goals.push(goal);
    }

    refreshGoalsUI();
    showNotification('Goal saved!', 'success');
}

// Delete goal
async function deleteGoal(id) {
    if (firebaseInitialized && db) {
        try {
            await db.collection('goals').doc(id).delete();
            console.log('Goal deleted from Firebase');
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    }

    currentData.goals = currentData.goals.filter(g => g.id !== id);
    refreshGoalsUI();
    showNotification('Goal deleted!', 'success');
}

// Save spending categories
async function saveSpending(spending) {
    currentData.spending = spending;

    if (firebaseInitialized && db) {
        try {
            await db.collection('dashboard').doc('spending').set(spending);
            console.log('Spending saved to Firebase');
        } catch (error) {
            console.error('Error saving spending:', error);
        }
    }

    refreshSpendingChartUI();
}

/* ============================================
   UI REFRESH FUNCTIONS
   ============================================ */

function refreshUI() {
    refreshStatsUI();
    refreshTransactionsUI();
    refreshGoalsUI();
    refreshPortfolioUI();
    // Charts are refreshed through their own functions
}

function refreshStatsUI() {
    const stats = currentData.stats;

    // Total Balance
    const balanceCard = document.getElementById('total-balance-card');
    if (balanceCard) {
        balanceCard.querySelector('.stat-value').textContent = formatCurrency(stats.totalBalance);
        const changeEl = balanceCard.querySelector('.stat-change');
        changeEl.className = `stat-change ${stats.balanceChange >= 0 ? 'positive' : 'negative'}`;
        changeEl.innerHTML = getChangeHTML(stats.balanceChange);
    }

    // Monthly Income
    const incomeCard = document.getElementById('income-card');
    if (incomeCard) {
        incomeCard.querySelector('.stat-value').textContent = formatCurrency(stats.monthlyIncome);
        const changeEl = incomeCard.querySelector('.stat-change');
        changeEl.className = `stat-change ${stats.incomeChange >= 0 ? 'positive' : 'negative'}`;
        changeEl.innerHTML = getChangeHTML(stats.incomeChange);
    }

    // Monthly Expenses
    const expensesCard = document.getElementById('expenses-card');
    if (expensesCard) {
        expensesCard.querySelector('.stat-value').textContent = formatCurrency(stats.monthlyExpenses);
        const changeEl = expensesCard.querySelector('.stat-change');
        changeEl.className = `stat-change ${stats.expensesChange >= 0 ? 'positive' : 'negative'}`;
        changeEl.innerHTML = getChangeHTML(stats.expensesChange);
    }

    // Investments
    const investmentsCard = document.getElementById('investments-card');
    if (investmentsCard) {
        investmentsCard.querySelector('.stat-value').textContent = formatCurrency(stats.investments);
        const changeEl = investmentsCard.querySelector('.stat-change');
        changeEl.className = `stat-change ${stats.investmentsChange >= 0 ? 'positive' : 'negative'}`;
        changeEl.innerHTML = getChangeHTML(stats.investmentsChange);
    }
}

function refreshTransactionsUI() {
    const container = document.querySelector('.transactions-list');
    if (!container) return;

    container.innerHTML = currentData.transactions.map(t => `
        <div class="transaction-item" data-id="${t.id}">
            <div class="transaction-icon ${t.category}">
                ${getCategoryIcon(t.category)}
            </div>
            <div class="transaction-details">
                <span class="transaction-name">${t.name}</span>
                <span class="transaction-date">${formatDate(t.date)}</span>
            </div>
            <span class="transaction-amount ${t.amount >= 0 ? 'positive' : 'negative'}">
                ${t.amount >= 0 ? '+' : ''}${formatCurrency(Math.abs(t.amount))}
            </span>
        </div>
    `).join('');

    // Add click handlers for editing
    container.querySelectorAll('.transaction-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            const transaction = currentData.transactions.find(t => t.id === id);
            if (transaction) {
                openTransactionModal(transaction);
            }
        });
    });
}

function refreshGoalsUI() {
    const container = document.querySelector('.goals-list');
    if (!container) return;

    container.innerHTML = currentData.goals.map(g => {
        const percent = Math.round((g.current / g.target) * 100);
        return `
        <div class="goal-item" data-id="${g.id}">
            <div class="goal-info">
                <span class="goal-name">${g.name}</span>
                <span class="goal-target">${formatCurrency(g.current)} of ${formatCurrency(g.target)}</span>
            </div>
            <div class="goal-progress">
                <div class="progress-bar ${g.color || ''}">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <span class="progress-percent">${percent}%</span>
            </div>
        </div>
    `}).join('');

    // Add click handlers for editing
    container.querySelectorAll('.goal-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            const goal = currentData.goals.find(g => g.id === id);
            if (goal) {
                openGoalModal(goal);
            }
        });
    });
}

function refreshPortfolioUI() {
    const container = document.querySelector('.portfolio-assets');
    if (!container) return;

    container.innerHTML = currentData.portfolio.map(a => `
        <div class="asset-item">
            <div class="asset-info">
                <span class="asset-symbol">${a.symbol}</span>
                <span class="asset-name">${a.name}</span>
            </div>
            <div class="asset-value">
                <span class="asset-price">$${a.price.toFixed(2)}</span>
                <span class="asset-change ${a.change >= 0 ? 'positive' : 'negative'}">
                    ${a.change >= 0 ? '+' : ''}${a.change}%
                </span>
            </div>
        </div>
    `).join('');
}

function refreshSpendingChartUI() {
    if (window.spendingChart) {
        const labels = Object.keys(currentData.spending);
        const data = Object.values(currentData.spending);
        window.spendingChart.data.labels = labels;
        window.spendingChart.data.datasets[0].data = data;
        window.spendingChart.update();
    }
}

/* ============================================
   HELPER FUNCTIONS
   ============================================ */

// Get current currency from settings
function getCurrentCurrency() {
    try {
        const saved = localStorage.getItem('dashboard-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            return settings.currency || 'USD';
        }
    } catch (e) { }
    return 'USD';
}

// Currency locale mapping
const currencyLocales = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'INR': 'en-IN'
};

function formatCurrency(amount) {
    const currency = getCurrentCurrency();
    const locale = currencyLocales[currency] || 'en-US';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getChangeHTML(change) {
    const isPositive = change >= 0;
    const icon = isPositive
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>';
    return `${icon}${isPositive ? '+' : ''}${change}%`;
}

function getCategoryIcon(category) {
    const icons = {
        shopping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
        income: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
        food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
        transfer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="7 17 7 7 17 7"/></svg>',
        subscription: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg>',
        entertainment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
        transport: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
        utilities: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 7 19.5v-15A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 16a2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 2.5 2.5v3.5a2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1-2.5-2.5z"/></svg>'
    };
    return icons[category] || icons.shopping;
}

/* ============================================
   NOTIFICATION SYSTEM
   ============================================ */

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => notification.remove(), 3000);
}

/* ============================================
   MODAL SYSTEM
   ============================================ */

// Create modal container
function createModalContainer() {
    if (document.getElementById('modal-container')) return;

    const container = document.createElement('div');
    container.id = 'modal-container';
    container.className = 'modal-container';
    container.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content"></div>
    `;
    document.body.appendChild(container);

    // Close on backdrop click
    container.querySelector('.modal-backdrop').addEventListener('click', closeModal);
}

function openModal(content) {
    createModalContainer();
    const container = document.getElementById('modal-container');
    container.querySelector('.modal-content').innerHTML = content;
    container.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const container = document.getElementById('modal-container');
    if (container) {
        container.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Transaction Modal
function openTransactionModal(transaction = null) {
    const isEdit = transaction !== null;
    const existingTags = isEdit && transaction.tags ? transaction.tags : [];
    const allTags = ['bill', 'car', 'essentials', 'extra', 'freelance', 'housing', 'monthly', 'restaurant', 'social'];

    const modalContent = `
        <div class="modal-box" style="min-width: 450px;">
            <div class="modal-header">
                <h3>${isEdit ? 'Edit Transaction' : 'Add Transaction'}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <form id="transaction-form">
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" name="name" value="${isEdit ? transaction.name : ''}" required placeholder="e.g. Grocery Shopping">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Amount ($)</label>
                        <input type="number" name="amount" value="${isEdit ? Math.abs(transaction.amount) : ''}" required step="0.01" min="0" placeholder="e.g. 50.00">
                    </div>
                    <div class="form-group">
                        <label>Type</label>
                        <select name="type" required id="transaction-type-select">
                            <option value="expense" ${!isEdit || transaction.type === 'expense' || transaction.amount < 0 ? 'selected' : ''}>Expense</option>
                            <option value="income" ${isEdit && (transaction.type === 'income' || transaction.amount > 0) ? 'selected' : ''}>Income</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select name="category" required>
                        <option value="bill" ${isEdit && transaction.category === 'bill' ? 'selected' : ''}>Bill</option>
                        <option value="education" ${isEdit && transaction.category === 'education' ? 'selected' : ''}>Education</option>
                        <option value="entertainment" ${isEdit && transaction.category === 'entertainment' ? 'selected' : ''}>Entertainment</option>
                        <option value="food" ${isEdit && transaction.category === 'food' ? 'selected' : ''}>Food</option>
                        <option value="grocery" ${isEdit && transaction.category === 'grocery' ? 'selected' : ''}>Grocery</option>
                        <option value="healthcare" ${isEdit && transaction.category === 'healthcare' ? 'selected' : ''}>Healthcare</option>
                        <option value="housing" ${isEdit && transaction.category === 'housing' ? 'selected' : ''}>Housing</option>
                        <option value="income" ${isEdit && transaction.category === 'income' ? 'selected' : ''}>Income</option>
                        <option value="personal" ${isEdit && transaction.category === 'personal' ? 'selected' : ''}>Personal</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" name="date" value="${isEdit ? transaction.date : new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label>Tags (click to select)</label>
                    <div class="tag-options" id="tag-options">
                        ${allTags.map(tag => `
                            <span class="tag-option ${existingTags.includes(tag) ? 'selected' : ''}" data-tag="${tag}">${tag}</span>
                        `).join('')}
                    </div>
                    <input type="hidden" name="tags" id="selected-tags" value="${existingTags.join(',')}">
                </div>
                <div class="modal-actions">
                    ${isEdit ? '<button type="button" class="btn-delete" onclick="handleDeleteTransaction(\'' + transaction.id + '\')">Delete</button>' : ''}
                    <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn-save">Save</button>
                </div>
                <input type="hidden" name="id" value="${isEdit ? transaction.id : ''}">
            </form>
        </div>
    `;

    openModal(modalContent);

    // Tag selection handler
    document.querySelectorAll('.tag-option').forEach(tagEl => {
        tagEl.addEventListener('click', function () {
            this.classList.toggle('selected');
            updateSelectedTags();
        });
    });

    function updateSelectedTags() {
        const selected = Array.from(document.querySelectorAll('.tag-option.selected')).map(el => el.dataset.tag);
        document.getElementById('selected-tags').value = selected.join(',');
    }

    // Form submit handler
    document.getElementById('transaction-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const type = formData.get('type');
        const amount = parseFloat(formData.get('amount'));
        const tags = formData.get('tags') ? formData.get('tags').split(',').filter(t => t) : [];

        const transactionData = {
            id: formData.get('id') || null,
            name: formData.get('name'),
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            type: type,
            category: formData.get('category'),
            date: formData.get('date'),
            tags: tags
        };
        saveTransaction(transactionData);
        closeModal();
    });
}

// Goal Modal
function openGoalModal(goal = null) {
    const isEdit = goal !== null;
    const modalContent = `
        <div class="modal-box">
            <div class="modal-header">
                <h3>${isEdit ? 'Edit Goal' : 'Add Goal'}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <form id="goal-form">
                <div class="form-group">
                    <label>Goal Name</label>
                    <input type="text" name="name" value="${isEdit ? goal.name : ''}" required placeholder="e.g. Emergency Fund">
                </div>
                <div class="form-group">
                    <label>Current Amount ($)</label>
                    <input type="number" name="current" value="${isEdit ? goal.current : ''}" required step="0.01" placeholder="e.g. 5000">
                </div>
                <div class="form-group">
                    <label>Target Amount ($)</label>
                    <input type="number" name="target" value="${isEdit ? goal.target : ''}" required step="0.01" placeholder="e.g. 10000">
                </div>
                <div class="form-group">
                    <label>Color Theme</label>
                    <select name="color">
                        <option value="primary" ${isEdit && goal.color === 'primary' ? 'selected' : ''}>Purple (Primary)</option>
                        <option value="vacation" ${isEdit && goal.color === 'vacation' ? 'selected' : ''}>Cyan (Vacation)</option>
                        <option value="car" ${isEdit && goal.color === 'car' ? 'selected' : ''}>Orange (Savings)</option>
                        <option value="investment" ${isEdit && goal.color === 'investment' ? 'selected' : ''}>Green (Investment)</option>
                    </select>
                </div>
                <div class="modal-actions">
                    ${isEdit ? '<button type="button" class="btn-delete" onclick="handleDeleteGoal(\'' + goal.id + '\')">Delete</button>' : ''}
                    <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn-save">Save</button>
                </div>
                <input type="hidden" name="id" value="${isEdit ? goal.id : ''}">
            </form>
        </div>
    `;

    openModal(modalContent);

    // Form submit handler
    document.getElementById('goal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const goalData = {
            id: formData.get('id') || null,
            name: formData.get('name'),
            current: parseFloat(formData.get('current')),
            target: parseFloat(formData.get('target')),
            color: formData.get('color')
        };
        saveGoal(goalData);
        closeModal();
    });
}

// Delete handlers (global functions for onclick)
window.handleDeleteTransaction = function (id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        deleteTransaction(id);
        closeModal();
    }
};

window.handleDeleteGoal = function (id) {
    if (confirm('Are you sure you want to delete this goal?')) {
        deleteGoal(id);
        closeModal();
    }
};

// Stats Modal
function openStatsModal() {
    const stats = currentData.stats;
    const modalContent = `
        <div class="modal-box">
            <div class="modal-header">
                <h3>Edit Financial Stats</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <form id="stats-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Total Balance ($)</label>
                        <input type="number" name="totalBalance" value="${stats.totalBalance}" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Balance Change (%)</label>
                        <input type="number" name="balanceChange" value="${stats.balanceChange}" required step="0.1">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Monthly Income ($)</label>
                        <input type="number" name="monthlyIncome" value="${stats.monthlyIncome}" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Income Change (%)</label>
                        <input type="number" name="incomeChange" value="${stats.incomeChange}" required step="0.1">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Monthly Expenses ($)</label>
                        <input type="number" name="monthlyExpenses" value="${stats.monthlyExpenses}" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Expenses Change (%)</label>
                        <input type="number" name="expensesChange" value="${stats.expensesChange}" required step="0.1">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Investments ($)</label>
                        <input type="number" name="investments" value="${stats.investments}" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Investments Change (%)</label>
                        <input type="number" name="investmentsChange" value="${stats.investmentsChange}" required step="0.1">
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn-save">Save</button>
                </div>
            </form>
        </div>
    `;

    openModal(modalContent);

    document.getElementById('stats-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const statsData = {
            totalBalance: parseFloat(formData.get('totalBalance')),
            balanceChange: parseFloat(formData.get('balanceChange')),
            monthlyIncome: parseFloat(formData.get('monthlyIncome')),
            incomeChange: parseFloat(formData.get('incomeChange')),
            monthlyExpenses: parseFloat(formData.get('monthlyExpenses')),
            expensesChange: parseFloat(formData.get('expensesChange')),
            investments: parseFloat(formData.get('investments')),
            investmentsChange: parseFloat(formData.get('investmentsChange'))
        };
        saveStats(statsData);
        closeModal();
        showNotification('Stats updated!', 'success');
    });
}

/* ============================================
   INITIALIZE ON LOAD
   ============================================ */

// Try to initialize Firebase when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Firebase SDK is loaded
    setTimeout(() => {
        initializeFirebase();
    }, 500);
});

// Export functions for external use
window.FinanceDB = {
    saveStats,
    saveTransaction,
    deleteTransaction,
    saveGoal,
    deleteGoal,
    saveSpending,
    loadAllData,
    openTransactionModal,
    openGoalModal,
    openStatsModal,
    currentData: () => currentData
};

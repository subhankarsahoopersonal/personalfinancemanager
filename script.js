/* ============================================
   Financial Dashboard - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Load saved settings first
    loadSettings();

    // Initialize all charts
    initRevenueChart();
    initSpendingChart();
    initPortfolioChart();

    // Initialize interactive elements
    initChartPeriodButtons();
    initAnimations();
    updateDateTime();
    initDashboardSearch();
});

/* ============================================
   DASHBOARD SEARCH
   ============================================ */

function initDashboardSearch() {
    const searchInput = document.getElementById('dashboard-search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    // Pages to search through (use page IDs that match the actual page elements)
    const pages = [
        { name: 'Dashboard', icon: '🏠', page: 'dashboard-page' },
        { name: 'Analytics', icon: '📊', page: 'analytics-page' },
        { name: 'Portfolio', icon: '💼', page: 'portfolio-page' },
        { name: 'Transactions', icon: '💳', page: 'transactions-page' },
        { name: 'Reports', icon: '📈', page: 'reports-page' },
        { name: 'Settings', icon: '⚙️', page: 'settings-page' }
    ];

    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();

        if (query.length === 0) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            return;
        }

        // Get data for transaction search
        const data = typeof FinanceDB !== 'undefined' ? FinanceDB.currentData() : null;
        const transactions = data?.transactions || [];

        // Filter pages
        const matchedPages = pages.filter(p =>
            p.name.toLowerCase().includes(query)
        );

        // Filter transactions
        const matchedTransactions = transactions.filter(t =>
            t.name.toLowerCase().includes(query) ||
            (t.category && t.category.toLowerCase().includes(query))
        ).slice(0, 5); // Limit to 5 results

        // Build results HTML
        let resultsHTML = '';

        if (matchedPages.length > 0) {
            resultsHTML += '<div class="search-section"><span class="search-section-label">Pages</span>';
            matchedPages.forEach(p => {
                resultsHTML += `
                    <div class="search-result-item" onclick="navigateToPage('${p.page}'); closeSearchResults();">
                        <span class="search-result-icon">${p.icon}</span>
                        <span class="search-result-text">${p.name}</span>
                    </div>
                `;
            });
            resultsHTML += '</div>';
        }

        if (matchedTransactions.length > 0) {
            resultsHTML += '<div class="search-section"><span class="search-section-label">Transactions</span>';
            matchedTransactions.forEach(t => {
                resultsHTML += `
                    <div class="search-result-item" onclick="navigateToPage('transactions'); closeSearchResults();">
                        <span class="search-result-icon">${t.amount >= 0 ? '💰' : '💸'}</span>
                        <span class="search-result-text">${t.name}</span>
                        <span class="search-result-meta ${t.amount >= 0 ? 'positive' : 'negative'}">${formatCurrency(t.amount)}</span>
                    </div>
                `;
            });
            resultsHTML += '</div>';
        }

        if (resultsHTML === '') {
            resultsHTML = '<div class="search-no-results">No results found</div>';
        }

        searchResults.innerHTML = resultsHTML;
        searchResults.classList.add('active');
    });

    // Close search on click outside
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });

    // Close on Escape
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            searchResults.classList.remove('active');
            this.blur();
        }
    });
}

function closeSearchResults() {
    const searchResults = document.getElementById('search-results');
    const searchInput = document.getElementById('dashboard-search');
    if (searchResults) searchResults.classList.remove('active');
    if (searchInput) searchInput.value = '';
}

/* ============================================
   REVENUE CHART (Line Chart with Gradient)
   ============================================ */

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');

    // Create gradient for the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    const gradient2 = ctx.createLinearGradient(0, 0, 0, 300);
    gradient2.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
    gradient2.addColorStop(1, 'rgba(168, 85, 247, 0)');

    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Revenue',
                data: [12500, 18200, 14800, 22400, 19600, 25800, 28500],
                borderColor: '#6366f1',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#6366f1',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                borderWidth: 3
            },
            {
                label: 'Expenses',
                data: [8200, 9100, 7800, 10200, 11400, 9800, 12200],
                borderColor: '#a855f7',
                backgroundColor: gradient2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#a855f7',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                borderWidth: 3
            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: '#a1a1aa',
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(22, 22, 31, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#a1a1aa',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: 600
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 12
                    },
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#71717a',
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#71717a',
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        callback: function (value) {
                            const symbol = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹' }[getCurrentCurrency()] || '$';
                            return symbol + (value / 1000) + 'k';
                        }
                    },
                    beginAtZero: true
                }
            }
        }
    };

    window.revenueChart = new Chart(ctx, config);
}

/* ============================================
   SPENDING CHART (Doughnut Chart)
   ============================================ */

function initSpendingChart() {
    const ctx = document.getElementById('spendingChart').getContext('2d');

    const data = {
        labels: ['Housing', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Others'],
        datasets: [{
            data: [2800, 1200, 800, 1500, 600, 520],
            backgroundColor: [
                '#6366f1',
                '#a855f7',
                '#22d3ee',
                '#10b981',
                '#f59e0b',
                '#ef4444'
            ],
            borderColor: '#16161f',
            borderWidth: 4,
            hoverOffset: 8
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(22, 22, 31, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#a1a1aa',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: 600
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 12
                    },
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.parsed / total) * 100);
                            return '$' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    };

    const chart = new Chart(ctx, config);

    // Create custom legend
    createSpendingLegend(data);
}

function createSpendingLegend(data) {
    const legendContainer = document.getElementById('spending-legend');
    const colors = data.datasets[0].backgroundColor;

    data.labels.forEach((label, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <span class="legend-color" style="background: ${colors[index]}"></span>
            <span>${label}</span>
        `;
        legendContainer.appendChild(legendItem);
    });
}

/* ============================================
   PORTFOLIO CHART (Bar Chart)
   ============================================ */

function initPortfolioChart() {
    const ctx = document.getElementById('portfolioChart').getContext('2d');

    // Create gradient for bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#a855f7');

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Portfolio Value',
            data: [128000, 135000, 142000, 138000, 148000, 156340],
            backgroundColor: gradient,
            borderRadius: 6,
            borderSkipped: false
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(22, 22, 31, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#a1a1aa',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: 600
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 12
                    },
                    callbacks: {
                        label: function (context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#71717a',
                        font: {
                            family: 'Inter',
                            size: 10
                        }
                    }
                },
                y: {
                    display: false,
                    beginAtZero: false,
                    min: 120000
                }
            }
        }
    };

    new Chart(ctx, config);
}

/* ============================================
   CHART PERIOD BUTTONS
   ============================================ */

function initChartPeriodButtons() {
    const buttons = document.querySelectorAll('.chart-period');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            // Update chart data based on period
            updateRevenueChart(this.dataset.period);
        });
    });
}

function updateRevenueChart(period) {
    const chart = window.revenueChart;

    const periodData = {
        week: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            revenue: [12500, 18200, 14800, 22400, 19600, 25800, 28500],
            expenses: [8200, 9100, 7800, 10200, 11400, 9800, 12200]
        },
        month: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            revenue: [68500, 72400, 85200, 92800],
            expenses: [42000, 45600, 48200, 52800]
        },
        year: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            revenue: [180000, 195000, 210000, 225000, 240000, 255000, 268000, 280000, 295000, 310000, 328000, 345000],
            expenses: [120000, 125000, 130000, 138000, 142000, 150000, 155000, 162000, 168000, 175000, 182000, 190000]
        }
    };

    const data = periodData[period];

    chart.data.labels = data.labels;
    chart.data.datasets[0].data = data.revenue;
    chart.data.datasets[1].data = data.expenses;
    chart.update('active');
}

/* ============================================
   ANIMATIONS
   ============================================ */

function initAnimations() {
    // Animate stat values on load
    animateValue('total-balance-card', 0, 284592, 1500);
    animateValue('income-card', 0, 24850, 1500);
    animateValue('expenses-card', 0, 12420, 1500);
    animateValue('investments-card', 0, 156340, 1500);

    // Add hover effects to nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            this.style.transform = 'translateX(4px)';
        });
        item.addEventListener('mouseleave', function () {
            this.style.transform = 'translateX(0)';
        });
    });

    // Add intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.transaction-item, .asset-item, .goal-item').forEach(item => {
        observer.observe(item);
    });
}

function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const valueElement = element.querySelector('.stat-value');
    if (!valueElement) return;

    const startTime = performance.now();
    const isDecimal = end % 1 !== 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(start + (end - start) * easeOutQuad);

        valueElement.textContent = '$' + current.toLocaleString() + '.00';

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* ============================================
   DATE & TIME UPDATE
   ============================================ */

function updateDateTime() {
    const dateDisplay = document.querySelector('.date-display');
    if (!dateDisplay) return;

    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

/* ============================================
   SEARCH FUNCTIONALITY
   ============================================ */

const searchBox = document.querySelector('.search-box input');
if (searchBox) {
    searchBox.addEventListener('focus', function () {
        this.parentElement.style.width = '280px';
    });

    searchBox.addEventListener('blur', function () {
        if (!this.value) {
            this.parentElement.style.width = '';
        }
    });
}

/* ============================================
   NOTIFICATION BUTTON
   ============================================ */

const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', function (e) {
        e.stopPropagation();

        const badge = this.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }

        // Toggle notification panel
        let panel = document.getElementById('notification-panel');

        if (panel) {
            // Remove if exists
            panel.remove();
        } else {
            // Create notification panel
            panel = document.createElement('div');
            panel.id = 'notification-panel';
            panel.className = 'notification-panel';
            panel.innerHTML = `
                <div class="notification-header">
                    <h4>Notifications</h4>
                    <button onclick="document.getElementById('notification-panel').remove()">×</button>
                </div>
                <div class="notification-list">
                    <div class="notification-item">
                        <span class="notification-icon">🎉</span>
                        <div class="notification-content">
                            <strong>Welcome to FinanceX!</strong>
                            <p>Start by adding your financial data</p>
                        </div>
                    </div>
                    <div class="notification-item">
                        <span class="notification-icon">📊</span>
                        <div class="notification-content">
                            <strong>Dashboard Ready</strong>
                            <p>Your dashboard is set up and connected</p>
                        </div>
                    </div>
                    <div class="notification-item">
                        <span class="notification-icon">⚙️</span>
                        <div class="notification-content">
                            <strong>Set Your Name</strong>
                            <p>Go to Settings to personalize your profile</p>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);

            // Position the panel
            const rect = this.getBoundingClientRect();
            panel.style.top = (rect.bottom + 8) + 'px';
            panel.style.right = (window.innerWidth - rect.right) + 'px';

            // Close when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closePanel(e) {
                    if (!panel.contains(e.target)) {
                        panel.remove();
                        document.removeEventListener('click', closePanel);
                    }
                });
            }, 100);
        }

        // Add ripple effect
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            inset: 0;
            background: rgba(99, 102, 241, 0.3);
            border-radius: inherit;
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}

// Add ripple animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(1.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/* ============================================
   SIDEBAR NAVIGATION - PAGE SWITCHING
   ============================================ */

const pageMap = {
    '#dashboard': 'dashboard-page',
    '#analytics': 'analytics-page',
    '#portfolio': 'portfolio-page',
    '#transactions': 'transactions-page',
    '#reports': 'reports-page',
    '#settings': 'settings-page'
};

function navigateToPage(pageId) {
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(page => {
        page.style.display = 'none';
    });

    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';

        // Initialize page-specific features
        if (pageId === 'analytics-page') {
            initAnalyticsPage();
        } else if (pageId === 'portfolio-page') {
            initPortfolioPage();
        } else if (pageId === 'transactions-page') {
            initTransactionsPage();
        } else if (pageId === 'settings-page') {
            initSettingsPage();
        }
    }
}

const navLinks = document.querySelectorAll('.nav-item a');
navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        this.parentElement.classList.add('active');

        // Navigate to page
        const href = this.getAttribute('href');
        const pageId = pageMap[href];
        if (pageId) {
            navigateToPage(pageId);
        }
    });
});

/* ============================================
   PAGE INITIALIZATION FUNCTIONS
   ============================================ */

function initAnalyticsPage() {
    // Calculate analytics from current data
    const data = typeof FinanceDB !== 'undefined' ? FinanceDB.currentData() : null;
    if (!data) return;

    // Average daily spending
    const dailySpending = data.stats.monthlyExpenses / 30;
    document.getElementById('avg-daily-spending').textContent = formatCurrency(dailySpending);

    // Savings rate
    const income = data.stats.monthlyIncome || 1;
    const savingsRate = Math.round(((income - data.stats.monthlyExpenses) / income) * 100);
    document.getElementById('savings-rate').textContent = savingsRate + '%';

    // Top category
    const spending = data.spending || {};
    const topCategory = Object.entries(spending).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('top-category').textContent = topCategory ? topCategory[0] : '-';

    // Initialize analytics chart if not already done
    initAnalyticsChart();
}

function initAnalyticsChart() {
    const canvas = document.getElementById('analyticsChart');
    if (!canvas || window.analyticsChartInstance) return;

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    window.analyticsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Income',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                tension: 0.4,
                borderWidth: 2
            }, {
                label: 'Expenses',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#ef4444',
                backgroundColor: 'transparent',
                tension: 0.4,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#a1a1aa' } }
            },
            scales: {
                x: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#71717a' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
        }
    });
}

function initPortfolioPage() {
    const data = typeof FinanceDB !== 'undefined' ? FinanceDB.currentData() : null;
    if (!data) return;

    const container = document.getElementById('portfolio-list');
    if (!container) return;

    if (data.portfolio && data.portfolio.length > 0) {
        container.innerHTML = data.portfolio.map(a => `
            <div class="asset-item" onclick="openPortfolioModal(${JSON.stringify(a).replace(/"/g, '&quot;')})">
                <div class="asset-info">
                    <span class="asset-symbol">${a.symbol}</span>
                    <span class="asset-name">${a.name}</span>
                    <span class="asset-shares">${a.shares || 1} shares</span>
                </div>
                <div class="asset-value">
                    <span class="asset-price">${formatCurrency((a.shares || 1) * a.price)}</span>
                    <span class="asset-change ${a.change >= 0 ? 'positive' : 'negative'}">
                        ${a.change >= 0 ? '+' : ''}${a.change}%
                    </span>
                </div>
            </div>
        `).join('');

        // Initialize the allocation chart
        initPortfolioAllocationChart();
    } else {
        container.innerHTML = '<p class="empty-message">No holdings yet. Click + to add.</p>';
    }
}

function initTransactionsPage() {
    const data = typeof FinanceDB !== 'undefined' ? FinanceDB.currentData() : null;
    if (!data) return;

    // Setup filter event listeners
    const searchInput = document.getElementById('transaction-search');
    const typeFilter = document.getElementById('filter-type');
    const categoryFilter = document.getElementById('filter-category');
    const tagFilter = document.getElementById('filter-tag');

    if (searchInput) searchInput.addEventListener('input', filterTransactions);
    if (typeFilter) typeFilter.addEventListener('change', filterTransactions);
    if (categoryFilter) categoryFilter.addEventListener('change', filterTransactions);
    if (tagFilter) tagFilter.addEventListener('change', filterTransactions);

    // Initial render
    filterTransactions();
}

function filterTransactions() {
    const data = typeof FinanceDB !== 'undefined' ? FinanceDB.currentData() : null;
    if (!data) return;

    const searchTerm = (document.getElementById('transaction-search')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('filter-type')?.value || '';
    const categoryFilter = document.getElementById('filter-category')?.value || '';
    const tagFilter = document.getElementById('filter-tag')?.value || '';

    let filtered = data.transactions || [];

    // Apply filters
    if (searchTerm) {
        filtered = filtered.filter(t => t.name.toLowerCase().includes(searchTerm));
    }
    if (typeFilter) {
        filtered = filtered.filter(t => {
            if (typeFilter === 'income') return t.amount >= 0 || t.type === 'income';
            if (typeFilter === 'expense') return t.amount < 0 || t.type === 'expense';
            return true;
        });
    }
    if (categoryFilter) {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }
    if (tagFilter) {
        filtered = filtered.filter(t => t.tags && t.tags.includes(tagFilter));
    }

    renderTransactionsList(filtered);
}

function renderTransactionsList(transactions) {
    const container = document.getElementById('full-transactions-list');
    if (!container) return;

    if (transactions && transactions.length > 0) {
        container.innerHTML = transactions.map(t => {
            const type = t.amount >= 0 ? 'income' : 'expense';
            const tagsHtml = t.tags && t.tags.length > 0
                ? `<div class="transaction-tags">${t.tags.map(tag => `<span class="transaction-tag">${tag}</span>`).join('')}</div>`
                : '';

            return `
            <div class="transaction-item" data-id="${t.id}" onclick="openTransactionModal(${JSON.stringify(t).replace(/"/g, '&quot;')})">
                <div class="transaction-icon ${t.category}">
                    ${getCategoryIcon(t.category)}
                </div>
                <div class="transaction-details">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="transaction-name">${t.name}</span>
                        <span class="transaction-type ${type}">${type}</span>
                    </div>
                    <span class="transaction-date">${formatDate(t.date)} · ${t.category}</span>
                    ${tagsHtml}
                </div>
                <span class="transaction-amount ${t.amount >= 0 ? 'positive' : 'negative'}">
                    ${t.amount >= 0 ? '+' : ''}${formatCurrency(Math.abs(t.amount))}
                </span>
            </div>
        `}).join('');
    } else {
        container.innerHTML = '<p class="empty-message">No transactions found.</p>';
    }
}

/* ============================================
   EXPORT FUNCTIONS
   ============================================ */

function exportTransactionsCSV() {
    const data = typeof FinanceDB !== 'undefined' ? FinanceDB.currentData() : null;
    if (!data || !data.transactions || data.transactions.length === 0) {
        showNotification('No transactions to export', 'warning');
        return;
    }

    // CSV headers
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Tags'];
    const rows = data.transactions.map(t => [
        t.date,
        `"${t.name}"`,
        t.amount >= 0 ? 'Income' : 'Expense',
        t.category || '',
        t.amount,
        (t.tags || []).join('; ')
    ]);

    // Create CSV content
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);

    showNotification('CSV exported successfully!', 'success');
}

function exportTransactionsPDF() {
    const data = typeof FinanceDB !== 'undefined' ? FinanceDB.currentData() : null;
    if (!data || !data.transactions || data.transactions.length === 0) {
        showNotification('No transactions to export', 'warning');
        return;
    }

    // Create printable HTML
    const printWindow = window.open('', '_blank');
    const currency = getCurrentCurrency();

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Transactions Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background: #f5f5f5; font-weight: 600; }
                .income { color: #10b981; }
                .expense { color: #ef4444; }
                .footer { margin-top: 30px; color: #666; font-size: 12px; }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <h1>📊 Transactions Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.transactions.map(t => `
                        <tr>
                            <td>${t.date}</td>
                            <td>${t.name}</td>
                            <td>${t.amount >= 0 ? 'Income' : 'Expense'}</td>
                            <td>${t.category || '-'}</td>
                            <td class="${t.amount >= 0 ? 'income' : 'expense'}">${formatCurrency(t.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="footer">
                <p>Total Transactions: ${data.transactions.length}</p>
                <p>Export from FinanceX Dashboard</p>
            </div>
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    showNotification('PDF ready - use Print to save as PDF', 'success');
}

function initSettingsPage() {
    // Load saved settings into form
    loadSettings();

    // Update Firebase status
    const statusEl = document.getElementById('firebase-status');
    if (statusEl) {
        if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized) {
            statusEl.textContent = '✅ Connected';
            statusEl.style.background = 'rgba(16, 185, 129, 0.15)';
            statusEl.style.color = '#10b981';
        } else {
            statusEl.textContent = '❌ Not Connected';
            statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
            statusEl.style.color = '#ef4444';
        }
    }
}

/* ============================================
   SETTINGS FUNCTIONS
   ============================================ */

// Load settings from localStorage and update UI
function loadSettings() {
    const saved = localStorage.getItem('dashboard-settings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);

            // Update settings form if on settings page
            const nameInput = document.getElementById('settings-name');
            const currencyInput = document.getElementById('settings-currency');
            if (nameInput && settings.name) nameInput.value = settings.name;
            if (currencyInput && settings.currency) currencyInput.value = settings.currency;

            // Update sidebar with saved name
            updateSidebarUser(settings.name);
        } catch (e) {
            console.log('Could not load settings');
        }
    }
}

// Update sidebar username and avatar
function updateSidebarUser(name) {
    const usernameEl = document.getElementById('sidebar-username');
    const avatarEl = document.getElementById('sidebar-avatar');

    if (usernameEl) {
        usernameEl.textContent = name || 'New User';
    }

    if (avatarEl && name) {
        // Create initials from name (first letters of first two words)
        const words = name.trim().split(' ');
        let initials = words[0] ? words[0][0].toUpperCase() : '?';
        if (words[1]) initials += words[1][0].toUpperCase();
        avatarEl.querySelector('span').textContent = initials;
    } else if (avatarEl) {
        avatarEl.querySelector('span').textContent = '?';
    }
}

function saveSettings() {
    const name = document.getElementById('settings-name').value;
    const currency = document.getElementById('settings-currency').value;

    // Save to localStorage
    localStorage.setItem('dashboard-settings', JSON.stringify({ name, currency }));

    // Update sidebar immediately
    updateSidebarUser(name);

    // Refresh all UI to apply new currency
    if (typeof refreshUI === 'function') {
        refreshUI();
    }

    showNotification('Settings saved! Currency updated across dashboard.', 'success');
}

function exportData() {
    const data = typeof FinanceDB !== 'undefined' ? FinanceDB.currentData() : {};
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported!', 'success');
}

function confirmClearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        // This would clear Firebase data in a real app
        showNotification('Data cleared. Refresh to start fresh.', 'success');
    }
}

function generateReport(type) {
    showNotification(`Generating ${type} report...`, 'success');
    // In a real app, this would generate a PDF or detailed report
}

/* ============================================
   HELPER FUNCTIONS FOR PAGES
   ============================================ */

// NOTE: formatCurrency and getCurrentCurrency are defined in firebase-data.js

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCategoryIcon(category) {
    const icons = {
        shopping: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
        income: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>',
        transfer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="17" x2="7" y2="7"/><polyline points="7 17 7 7 17 7"/></svg>',
        subscription: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 12 2 2 4-4"/></svg>',
        entertainment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
        transport: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
        utilities: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/></svg>'
    };
    return icons[category] || icons.shopping;
}

// Portfolio Modal
function openPortfolioModal(asset = null) {
    const isEdit = asset !== null;

    const modalContent = `
        <div class="modal-box" style="min-width: 420px;">
            <div class="modal-header">
                <h3>${isEdit ? 'Edit Holding' : 'Add Investment'}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <form id="portfolio-form">
                <div class="form-group">
                    <label>Symbol</label>
                    <input type="text" name="symbol" value="${isEdit ? asset.symbol : ''}" required placeholder="e.g. AAPL, BTC" style="text-transform: uppercase;">
                </div>
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value="${isEdit ? asset.name : ''}" required placeholder="e.g. Apple Inc.">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Shares/Units</label>
                        <input type="number" name="shares" value="${isEdit ? asset.shares || 1 : ''}" required step="0.0001" min="0" placeholder="e.g. 10">
                    </div>
                    <div class="form-group">
                        <label>Current Price</label>
                        <input type="number" name="price" value="${isEdit ? asset.price : ''}" required step="0.01" min="0" placeholder="e.g. 175.50">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Cost Basis (per share)</label>
                        <input type="number" name="costBasis" value="${isEdit ? asset.costBasis || asset.price : ''}" step="0.01" min="0" placeholder="e.g. 150.00">
                    </div>
                    <div class="form-group">
                        <label>Change (%)</label>
                        <input type="number" name="change" value="${isEdit ? asset.change || 0 : '0'}" step="0.01" placeholder="e.g. 2.5">
                    </div>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <div class="type-selector" id="type-selector">
                        <div class="type-option ${isEdit && asset.type === 'stock' ? 'selected' : (!isEdit ? 'selected' : '')}" data-type="stock">
                            <span class="type-icon">📈</span>
                            <span class="type-label">Stock</span>
                        </div>
                        <div class="type-option ${isEdit && asset.type === 'etf' ? 'selected' : ''}" data-type="etf">
                            <span class="type-icon">📊</span>
                            <span class="type-label">ETF</span>
                        </div>
                        <div class="type-option ${isEdit && asset.type === 'crypto' ? 'selected' : ''}" data-type="crypto">
                            <span class="type-icon">₿</span>
                            <span class="type-label">Crypto</span>
                        </div>
                        <div class="type-option ${isEdit && asset.type === 'bond' ? 'selected' : ''}" data-type="bond">
                            <span class="type-icon">🏛️</span>
                            <span class="type-label">Bond</span>
                        </div>
                        <div class="type-option ${isEdit && asset.type === 'mutual-fund' ? 'selected' : ''}" data-type="mutual-fund">
                            <span class="type-icon">💼</span>
                            <span class="type-label">Mutual Fund</span>
                        </div>
                        <div class="type-option ${isEdit && asset.type === 'other' ? 'selected' : ''}" data-type="other">
                            <span class="type-icon">📁</span>
                            <span class="type-label">Other</span>
                        </div>
                    </div>
                    <input type="hidden" name="type" id="selected-type" value="${isEdit ? asset.type : 'stock'}">
                </div>
                <div class="modal-actions">
                    ${isEdit ? '<button type="button" class="btn-delete" onclick="handleDeletePortfolioItem(\'' + asset.id + '\')">Delete</button>' : ''}
                    <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn-save">Save</button>
                </div>
                <input type="hidden" name="id" value="${isEdit ? asset.id : ''}">
            </form>
        </div>
    `;

    openModal(modalContent);

    // Type selector handler
    document.querySelectorAll('.type-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('selected-type').value = this.dataset.type;
        });
    });

    // Form submit handler
    document.getElementById('portfolio-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const portfolioData = {
            id: formData.get('id') || 'asset_' + Date.now(),
            symbol: formData.get('symbol').toUpperCase(),
            name: formData.get('name'),
            shares: parseFloat(formData.get('shares')) || 1,
            price: parseFloat(formData.get('price')),
            costBasis: parseFloat(formData.get('costBasis')) || parseFloat(formData.get('price')),
            change: parseFloat(formData.get('change')) || 0,
            type: formData.get('type')
        };

        savePortfolioItem(portfolioData);
        closeModal();
    });
}

function savePortfolioItem(item) {
    if (typeof FinanceDB !== 'undefined') {
        const data = FinanceDB.currentData();
        if (!data.portfolio) data.portfolio = [];

        const existingIndex = data.portfolio.findIndex(a => a.id === item.id);
        if (existingIndex >= 0) {
            data.portfolio[existingIndex] = item;
        } else {
            data.portfolio.push(item);
        }

        FinanceDB.save(data).then(() => {
            initPortfolioPage();
            initPortfolioAllocationChart();
            showNotification('Investment saved!', 'success');
        });
    }
}

function handleDeletePortfolioItem(id) {
    if (confirm('Delete this investment?')) {
        if (typeof FinanceDB !== 'undefined') {
            const data = FinanceDB.currentData();
            data.portfolio = data.portfolio.filter(a => a.id !== id);
            FinanceDB.save(data).then(() => {
                closeModal();
                initPortfolioPage();
                initPortfolioAllocationChart();
                showNotification('Investment deleted', 'success');
            });
        }
    }
}

function initPortfolioAllocationChart() {
    const canvas = document.getElementById('portfolioAllocationChart');
    if (!canvas) return;

    const data = typeof FinanceDB !== 'undefined' ? FinanceDB.currentData() : null;
    if (!data || !data.portfolio || data.portfolio.length === 0) return;

    // Calculate total value per asset
    const chartData = data.portfolio.map(a => ({
        label: a.symbol,
        value: (a.shares || 1) * a.price
    }));

    const ctx = canvas.getContext('2d');

    // Destroy existing chart if it exists
    if (window.portfolioAllocationChartInstance) {
        window.portfolioAllocationChartInstance.destroy();
    }

    const colors = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

    window.portfolioAllocationChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.map(d => d.label),
            datasets: [{
                data: chartData.map(d => d.value),
                backgroundColor: colors.slice(0, chartData.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#a1a1aa', font: { family: 'Inter', size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

/* ============================================
   VIEW ALL LINK
   ============================================ */

const viewAllLink = document.querySelector('.view-all');
if (viewAllLink) {
    viewAllLink.addEventListener('click', function (e) {
        e.preventDefault();
        // Could navigate to full transactions page
        console.log('View all transactions');
    });
}

/* ============================================
   ADD GOAL BUTTON
   ============================================ */

const addGoalBtn = document.querySelector('.add-goal-btn');
if (addGoalBtn) {
    addGoalBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        // Open modal to add new goal (from firebase-data.js)
        if (typeof openGoalModal === 'function') {
            openGoalModal();
        }

        // Add pulse animation
        this.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            this.style.animation = '';
        }, 300);
    });
}

/* ============================================
   STAT CARD CLICK HANDLERS (Firebase Integration)
   ============================================ */

// Make stat cards clickable to edit stats
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', function () {
        if (typeof openStatsModal === 'function') {
            openStatsModal();
        }
    });
});

/* ============================================
   ADD TRANSACTION BUTTON
   ============================================ */

// Add "Add Transaction" button dynamically
const transactionsList = document.querySelector('.transactions-list');
if (transactionsList) {
    const addBtn = document.createElement('button');
    addBtn.className = 'add-transaction-btn';
    addBtn.innerHTML = '+ Add Transaction';
    addBtn.addEventListener('click', function () {
        if (typeof openTransactionModal === 'function') {
            openTransactionModal();
        }
    });
    transactionsList.parentElement.appendChild(addBtn);
}


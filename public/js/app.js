let token = localStorage.getItem("ft_token");
let userName = localStorage.getItem("ft_user");
const $ = s => document.querySelector(s);
const fmt = n => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

// ── Event Listeners (Replacing inline onclicks) ──
document.addEventListener("DOMContentLoaded", () => {
    if (token) showApp();

    // Auth Tabs
    document.getElementById("tab-login").addEventListener("click", (e) => showAuthTab('login', e));
    document.getElementById("tab-register").addEventListener("click", (e) => showAuthTab('register', e));
    
    // Auth Forms
    document.getElementById("btn-login").addEventListener("click", doLogin);
    document.getElementById("btn-register").addEventListener("click", doRegister);
    
    // App Header
    document.getElementById("btn-logout").addEventListener("click", logout);
    
    // Navigation Tabs
    document.getElementById("nav-transactions").addEventListener("click", (e) => switchTab('transactions', e));
    document.getElementById("nav-budgets").addEventListener("click", (e) => switchTab('budgets', e));
    document.getElementById("nav-reports").addEventListener("click", (e) => switchTab('reports', e));
    
    // Actions
    document.getElementById("btn-add-tx").addEventListener("click", addTx);
    document.getElementById("btn-set-budget").addEventListener("click", setBudget);

    // Event Delegation for dynamic delete buttons
    document.getElementById("tx-list").addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-delete-tx")) {
            const id = e.target.getAttribute("data-id");
            delTx(id);
        }
    });
});

// ── Auth ──
function showAuthTab(tab, event) {
    document.querySelectorAll(".auth-tabs button").forEach(b => b.classList.remove("active"));
    if (event) event.target.classList.add("active");
    $("#login-form").classList.toggle("hidden", tab !== "login");
    $("#register-form").classList.toggle("hidden", tab !== "register");
    $("#auth-msg").textContent = "";
}

async function doLogin() {
    const res = await api("/auth/login", "POST", {
        email: $("#login-email").value, password: $("#login-pass").value
    });
    if (res.token) { saveAuth(res); showApp(); }
    else { $("#auth-msg").textContent = res.msg || "Login failed"; $("#auth-msg").className = "error-msg"; }
}

async function doRegister() {
    const res = await api("/auth/register", "POST", {
        name: $("#reg-name").value, email: $("#reg-email").value, password: $("#reg-pass").value
    });
    if (res.token) { saveAuth(res); showApp(); }
    else { $("#auth-msg").textContent = res.msg || "Registration failed"; $("#auth-msg").className = "error-msg"; }
}

function saveAuth(data) {
    token = data.token; userName = data.user.name;
    localStorage.setItem("ft_token", token);
    localStorage.setItem("ft_user", userName);
}

function logout() { localStorage.clear(); location.reload(); }

// ── App ──
async function showApp() {
    $("#auth-screen").classList.add("hidden");
    $("#app-screen").classList.remove("hidden");
    $("#user-name").textContent = userName || "";
    $("#tx-date").value = new Date().toISOString().slice(0, 10);
    $("#bud-month").value = new Date().toISOString().slice(0, 7);
    await loadAll();
}

async function loadAll() {
    const [dashRes, catsRes, txsRes] = await Promise.all([
        api("/dashboard"), api("/categories"), api("/transactions")
    ]);

    // Defensively extract data
    const dash = dashRes.data || dashRes;
    const cats = catsRes.data || catsRes || [];
    let txs = txsRes.data?.transactions || txsRes.transactions || txsRes.data || [];

    const paginationMeta = txsRes.data?.pagination || txsRes.pagination;
    if (paginationMeta) {
        const { page, totalPages, total } = paginationMeta;
        console.log(`Loaded page ${page} of ${totalPages} (${total} total transactions)`);
    }

    if (!Array.isArray(txs)) {
        console.error("Expected array for transactions, got:", txsRes);
        txs = [];
    }

    // Stats
    $("#s-income").textContent = fmt(dash.totalIncome || 0);
    $("#s-expense").textContent = fmt(dash.totalExpense || 0);
    $("#s-savings").textContent = fmt(dash.savings || 0);

    // Category dropdowns
    const catOpts = cats.map(c => `<option value="${c.id}">${c.name} (${c.type})</option>`).join("");
    $("#tx-cat").innerHTML = catOpts;
    $("#bud-cat").innerHTML = cats.filter(c => c.type === "expense").map(c => `<option value="${c.id}">${c.name}</option>`).join("");

    // Transactions
    if (txs.length === 0) {
        $("#tx-list").innerHTML = '<div class="empty-state">No transactions yet. Add your first one!</div>';
    } else {
        $("#tx-list").innerHTML = txs.slice(0, 15).map(t => `
            <div class="tx-item">
                <div class="tx-left">
                    <div class="tx-desc">${esc(t.description)}</div>
                    <div class="tx-meta">${t.category?.name || "—"} • ${new Date(t.date).toLocaleDateString("en-IN")}</div>
                </div>
                <div class="tx-amount ${t.type}">${t.type === "income" ? "+" : "−"}${fmt(Math.abs(t.amount))}</div>
                <div class="tx-actions"><button class="btn btn-danger btn-delete-tx" data-id="${t.id}">✕</button></div>
            </div>
        `).join("");
    }

    loadBudgets();
    loadReports();
}

// ── Transactions ──
async function addTx() {
    const body = {
        amount: parseFloat($("#tx-amount").value),
        type: $("#tx-type").value,
        description: $("#tx-desc").value,
        categoryId: parseInt($("#tx-cat").value),
        date: $("#tx-date").value
    };
    const res = await api("/transactions", "POST", body);
    if (res.id) {
        $("#tx-msg").textContent = "Transaction added!";
        $("#tx-msg").className = "success-msg";
        $("#tx-amount").value = ""; $("#tx-desc").value = "";
        await loadAll();
    } else {
        $("#tx-msg").textContent = res.msg || "Failed";
        $("#tx-msg").className = "error-msg";
    }
    setTimeout(() => $("#tx-msg").textContent = "", 3000);
}

async function delTx(id) {
    if (!confirm("Delete this transaction?")) return;
    await api(`/transactions/${id}`, "DELETE");
    await loadAll();
}

// ── Budgets ──
async function setBudget() {
    const res = await api("/budgets", "POST", {
        categoryId: parseInt($("#bud-cat").value),
        limit: parseFloat($("#bud-limit").value),
        month: $("#bud-month").value
    });
    if (res.id) {
        $("#bud-msg").textContent = "Budget set!"; $("#bud-msg").className = "success-msg";
        await loadBudgets();
    } else {
        $("#bud-msg").textContent = res.msg || "Failed"; $("#bud-msg").className = "error-msg";
    }
    setTimeout(() => $("#bud-msg").textContent = "", 3000);
}

async function loadBudgets() {
    const month = new Date().toISOString().slice(0, 7);
    const budgets = await api(`/budgets?month=${month}`);
    if (!Array.isArray(budgets) || budgets.length === 0) {
        $("#bud-list").innerHTML = '<div class="empty-state">No budgets set for this month</div>';
        return;
    }
    $("#bud-list").innerHTML = budgets.map(b => {
        const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0;
        const cls = pct >= 100 ? "over" : pct >= 75 ? "warn" : "ok";
        return `
            <div class="budget-item">
                <div class="budget-header">
                    <strong>${b.category?.name || "Category"}</strong>
                    <span>${b.exceeded ? "🔴 Exceeded" : "🟢 On Track"}</span>
                </div>
                <div class="budget-bar"><div class="budget-fill ${cls}" style="width:${pct}%"></div></div>
                <div class="budget-stats">
                    <span>Spent: ${fmt(b.spent)}</span>
                    <span>Limit: ${fmt(b.limit)}</span>
                    <span>Left: ${fmt(Math.max(b.remaining, 0))}</span>
                </div>
            </div>`;
    }).join("");
}

// ── Reports ──
async function loadReports() {
    const data = await api("/reports/monthly");
    if (!data.summary) return;
    $("#report-summary").innerHTML = `
        <div class="stat-card" style="flex:1"><div class="stat-label">Total Income</div><div class="stat-value green">${fmt(data.summary.totalIncome)}</div></div>
        <div class="stat-card" style="flex:1"><div class="stat-label">Total Expense</div><div class="stat-value red">${fmt(data.summary.totalExpense)}</div></div>
        <div class="stat-card" style="flex:1"><div class="stat-label">Net Savings</div><div class="stat-value">${fmt(data.summary.savings)}</div></div>
    `;
    if (!data.monthly || data.monthly.length === 0) {
        $("#report-list").innerHTML = '<div class="empty-state">No data yet</div>';
        return;
    }
    $("#report-list").innerHTML = data.monthly.map(m => `
        <div class="report-month">
            <div class="report-label">${m.month}</div>
            <div class="report-figures">
                <span class="green">+${fmt(m.income)}</span>
                <span class="red">−${fmt(m.expense)}</span>
                <strong>${fmt(m.balance)}</strong>
                <span style="color:var(--text-dim)">${m.transactions} txns</span>
            </div>
        </div>`).join("");
}

// ── Tabs ──
function switchTab(tab, event) {
    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    if (event) event.target.classList.add("active");
    ["transactions", "budgets", "reports"].forEach(t => {
        $(`#tab-${t}`).classList.toggle("hidden", t !== tab);
    });
}

// ── API Helper ──
async function api(path, method = "GET", body = null) {
    try {
        const opts = { method, headers: { "Content-Type": "application/json" } };
        if (token) opts.headers["Authorization"] = `Bearer ${token}`;
        if (body) opts.body = JSON.stringify(body);
        const r = await fetch(path, opts);
        if (r.status === 401) { logout(); return {}; }
        return await r.json();
    } catch (e) { console.error("API error:", e); return {}; }
}

function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

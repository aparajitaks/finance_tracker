#!/usr/bin/env node
require("dotenv").config();
const BASE = "http://localhost:3000";
let PASS = 0, FAIL = 0;
const RESULTS = [];

async function req(method, path, body, token) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (token) opts.headers["Authorization"] = `Bearer ${token}`;
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${BASE}${path}`, opts);
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: r.status, data };
}

function test(name, actual, expected) {
    const pass = actual === expected;
    if (pass) { PASS++; RESULTS.push(`  ✅ ${name}`); }
    else { FAIL++; RESULTS.push(`  ❌ ${name} — got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`); }
}

(async () => {
    const UID = `final_${Date.now()}`;
    console.log("═══════════════════════════════════════════");
    console.log("  FINANCE TRACKER — FINAL SUBMISSION TEST");
    console.log("═══════════════════════════════════════════\n");

    // ── AUTH ──
    RESULTS.push("── AUTH (6 tests) ──");
    const reg = await req("POST", "/auth/register", { name: "Alice", email: `${UID}@test.com`, password: "pass123" });
    test("Register", reg.status, 201);
    const T1 = reg.data.token;

    const dup = await req("POST", "/auth/register", { name: "X", email: `${UID}@test.com`, password: "x" });
    test("Duplicate email → 409", dup.status, 409);

    const login = await req("POST", "/auth/login", { email: `${UID}@test.com`, password: "pass123" });
    test("Login", login.status, 200);

    const badPw = await req("POST", "/auth/login", { email: `${UID}@test.com`, password: "wrong" });
    test("Wrong password → 401", badPw.status, 401);

    const badEmail = await req("POST", "/auth/login", { email: "no@no.com", password: "x" });
    test("Unknown email → 401", badEmail.status, 401);

    const missingFields = await req("POST", "/auth/register", {});
    test("Missing fields → 400", missingFields.status, 400);

    const reg2 = await req("POST", "/auth/register", { name: "Bob", email: `${UID}_bob@test.com`, password: "pass123" });
    const T2 = reg2.data.token;

    // ── CATEGORIES ──
    RESULTS.push("\n── CATEGORIES (5 tests) ──");
    const seed = await req("POST", "/categories/seed", null, T1);
    test("Seed categories", seed.status, 201);

    const cats = await req("GET", "/categories", null, T1);
    test("Get categories", cats.status, 200);
    test("Has 12+ categories", cats.data.length >= 12, true);

    const newCat = await req("POST", "/categories", { name: "Custom", type: "expense" }, T1);
    test("Create category", newCat.status, 201);

    const dupCat = await req("POST", "/categories", { name: "Custom", type: "expense" }, T1);
    test("Duplicate → 409", dupCat.status, 409);

    // ── TRANSACTIONS ──
    RESULTS.push("\n── TRANSACTIONS (18 tests) ──");
    const t1 = await req("POST", "/transactions", { amount: 50000, type: "income", description: "Salary May", date: "2026-05-01", categoryId: 1 }, T1);
    test("Create income", t1.status, 201);

    const t2 = await req("POST", "/transactions", { amount: 8000, type: "expense", description: "Rent", date: "2026-05-02", categoryId: 8 }, T1);
    test("Create expense", t2.status, 201);

    const t3 = await req("POST", "/transactions", { amount: 3000, type: "expense", description: "Food", date: "2026-05-03", categoryId: 5 }, T1);
    test("Create expense 2", t3.status, 201);

    const t4 = await req("POST", "/transactions", { amount: 1500, type: "expense", description: "Shopping", date: "2026-04-15", categoryId: 7 }, T1);
    test("Create prev month tx", t4.status, 201);

    const tzero = await req("POST", "/transactions", { amount: 0, type: "expense", description: "Zero", date: "2026-05-01", categoryId: 5 }, T1);
    test("amount=0 OK", tzero.status, 201);
    test("amount=0 value", tzero.data.amount, 0);

    const tneg = await req("POST", "/transactions", { amount: -500, type: "expense", description: "Refund", date: "2026-05-01", categoryId: 5 }, T1);
    test("Negative OK", tneg.status, 201);

    const tmiss = await req("POST", "/transactions", { amount: 100 }, T1);
    test("Missing fields → 400", tmiss.status, 400);

    const ttype = await req("POST", "/transactions", { amount: 1, type: "bad", description: "X", date: "2026-05-01", categoryId: 1 }, T1);
    test("Bad type → 400", ttype.status, 400);

    const getTx = await req("GET", "/transactions", null, T1);
    test("Get own transactions", getTx.status, 200);
    test("Only own data", getTx.data.length >= 5, true);

    const getTx2 = await req("GET", "/transactions", null, T2);
    test("User2 → 0 txs", getTx2.data.length, 0);

    // Partial update
    const upPart = await req("PUT", `/transactions/${t1.data.id}`, { amount: 55000 }, T1);
    test("Partial update amount", upPart.status, 200);
    test("Desc preserved", upPart.data.description, "Salary May");

    // Cross-user
    const crossUp = await req("PUT", `/transactions/${t1.data.id}`, { amount: 1 }, T2);
    test("Update other user → 403", crossUp.status, 403);

    const crossDel = await req("DELETE", `/transactions/${t1.data.id}`, null, T2);
    test("Delete other user → 403", crossDel.status, 403);

    const delGhost = await req("DELETE", "/transactions/99999", null, T1);
    test("Delete non-existent → 404", delGhost.status, 404);

    const delOk = await req("DELETE", `/transactions/${tzero.data.id}`, null, T1);
    test("Delete own → 200", delOk.status, 200);

    // ── DASHBOARD ──
    RESULTS.push("\n── DASHBOARD (5 tests) ──");
    const dash = await req("GET", "/dashboard", null, T1);
    test("Dashboard loads", dash.status, 200);
    test("Has totalIncome", typeof dash.data.totalIncome === "number", true);
    test("Has totalExpense", typeof dash.data.totalExpense === "number", true);
    test("Has savings", typeof dash.data.savings === "number", true);
    test("Math correct", dash.data.savings, dash.data.totalIncome - dash.data.totalExpense);

    // ── REPORTS ──
    RESULTS.push("\n── REPORTS (6 tests) ──");
    const report = await req("GET", "/reports/monthly", null, T1);
    test("Monthly report loads", report.status, 200);
    test("Has summary", !!report.data.summary, true);
    test("Has monthly array", Array.isArray(report.data.monthly), true);
    test("Multiple months", report.data.monthly.length >= 2, true);
    test("Summary has savings", typeof report.data.summary.savings === "number", true);

    const catReport = await req("GET", "/reports/categories?month=2026-05", null, T1);
    test("Category breakdown", catReport.status, 200);

    // ── BUDGETS ──
    RESULTS.push("\n── BUDGETS (7 tests) ──");
    const b1 = await req("POST", "/budgets", { categoryId: 5, limit: 2000, month: "2026-05" }, T1);
    test("Create budget", b1.status, 201);

    const b2 = await req("POST", "/budgets", { categoryId: 5, limit: 2500, month: "2026-05" }, T1);
    test("Upsert budget", b2.status, 201);
    test("Limit updated", b2.data.limit, 2500);

    const getBud = await req("GET", "/budgets?month=2026-05", null, T1);
    test("Get budgets", getBud.status, 200);
    test("Has spent", getBud.data[0]?.spent !== undefined, true);
    test("Has exceeded flag", getBud.data[0]?.exceeded !== undefined, true);

    const budMiss = await req("POST", "/budgets", { limit: 100 }, T1);
    test("Missing fields → 400", budMiss.status, 400);

    // ── PROFILE ──
    RESULTS.push("\n── PROFILE (5 tests) ──");
    const prof = await req("GET", "/profile", null, T1);
    test("Get profile", prof.status, 200);
    test("No password leaked", prof.data.password === undefined, true);

    const upProf = await req("PUT", "/profile", { name: "Alice Updated" }, T1);
    test("Update name", upProf.status, 200);
    test("Name changed", upProf.data.name, "Alice Updated");

    const dupProf = await req("PUT", "/profile", { email: `${UID}_bob@test.com` }, T1);
    test("Dup email → 409", dupProf.status, 409);

    // ── SECURITY ──
    RESULTS.push("\n── SECURITY (2 tests) ──");
    const noTok = await req("GET", "/transactions");
    test("No token → 401", noTok.status, 401);

    const badTok = await req("GET", "/transactions", null, "invalid.token.here");
    test("Bad token → 401", badTok.status, 401);

    // ── EDGE CASES ──
    RESULTS.push("\n── EDGE CASES (2 tests) ──");
    const delCatUsed = await req("DELETE", `/categories/${t2.data.categoryId}`, null, T1);
    test("Delete cat with txs → 400", delCatUsed.status, 400);

    const delCatOk = await req("DELETE", `/categories/${newCat.data.id}`, null, T1);
    test("Delete unused cat → 200", delCatOk.status, 200);

    // ── FRONTEND ──
    RESULTS.push("\n── FRONTEND (1 test) ──");
    const html = await fetch(`${BASE}/`);
    test("Frontend served", html.status, 200);

    // ═══ SUMMARY ═══
    console.log(RESULTS.join("\n"));
    console.log(`\n═══════════════════════════════════════════`);
    console.log(`  TOTAL: ${PASS + FAIL}  |  ✅ PASS: ${PASS}  |  ❌ FAIL: ${FAIL}`);
    if (FAIL === 0) console.log("  🎉 ALL TESTS PASSED — SUBMISSION READY");
    else console.log(`  ⚠️  ${FAIL} FAILURE(S) — FIX REQUIRED`);
    console.log(`═══════════════════════════════════════════\n`);
    process.exit(FAIL > 0 ? 1 : 0);
})();

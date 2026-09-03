/**
 * admin-auth.js — Shared guard for all admin pages.
 * Include as: <script src="/admin/admin-auth.js"></script>
 * Works in <head> OR end of <body>.
 */

// ── Read token ────────────────────────────────────────────────
var ADMIN_TOKEN = localStorage.getItem("adminToken") || localStorage.getItem("token");

// ── Validate immediately ──────────────────────────────────────
(function checkAdminAuth() {
    if (!ADMIN_TOKEN) {
        window.location.replace("/admin/login.html");
        return;
    }

    try {
        var parts = ADMIN_TOKEN.split(".");
        if (parts.length !== 3) throw new Error("bad token");

        var payload = JSON.parse(atob(parts[1]));

        // Expired?
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("token");
            window.location.replace("/admin/login.html?reason=expired");
            return;
        }

        // Not admin?
        if (payload.role !== "admin") {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("token");
            window.location.replace("/admin/login.html?reason=unauthorized");
            return;
        }

        // ✅ Valid — expose globally & ensure sync between adminToken and token
        localStorage.setItem("adminToken", ADMIN_TOKEN);
        localStorage.setItem("token", ADMIN_TOKEN);
        localStorage.setItem("adminRole", "admin");
        if (payload.email) localStorage.setItem("adminEmail", payload.email);
        window.ADMIN_TOKEN = ADMIN_TOKEN;
        window.ADMIN_EMAIL = payload.email || localStorage.getItem("adminEmail") || "";

    } catch (e) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        window.location.replace("/admin/login.html");
    }
})();

// ── Logout helper (callable from any admin page) ──────────────
function adminLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    window.location.replace("/admin/login.html");
}

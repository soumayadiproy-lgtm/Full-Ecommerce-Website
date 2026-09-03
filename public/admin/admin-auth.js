/**
 * admin-auth.js
 * Include in ALL admin pages as: <script src="/admin/admin-auth.js"></script>
 * Must be placed BEFORE any page-specific scripts.
 */
(function adminAuthGuard() {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

    // ── No token ──────────────────────────────────────────────
    if (!token) {
        window.location.replace("/admin/login.html");
        return;
    }

    // ── Decode JWT (client-side check — server still validates) ──
    try {
        const parts = token.split(".");
        if (parts.length !== 3) throw new Error("bad token");

        const payload = JSON.parse(atob(parts[1]));

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

        // ── Inject admin info into sidebar if available ──
        window.addEventListener("DOMContentLoaded", () => {
            const emailEl = document.getElementById("adminEmailDisplay");
            if (emailEl) emailEl.textContent = payload.email || "Admin";

            const nameEl = document.getElementById("adminNameDisplay");
            if (nameEl) nameEl.textContent = payload.name || payload.email?.split("@")[0] || "Admin";
        });

        // ── Expose token globally for API calls ──
        window.ADMIN_TOKEN = token;

    } catch (err) {
        console.warn("Admin auth guard error:", err.message);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        window.location.replace("/admin/login.html");
    }
})();

// ── Admin logout helper ───────────────────────────────────────
function adminLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminRole");
    window.location.replace("/admin/login.html");
}

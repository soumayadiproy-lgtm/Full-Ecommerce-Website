// admin.js — Admin authorization helper
(function() {
    var adminToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
    var adminRole = localStorage.getItem("adminRole");
    var user = null;
    try {
        user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch(e) {}

    var isAuthorized = false;

    if (adminRole === "admin" || (user && (user.role === "admin" || user.isAdmin === true))) {
        isAuthorized = true;
    }

    if (!isAuthorized && adminToken) {
        try {
            var parts = adminToken.split(".");
            if (parts.length === 3) {
                var payload = JSON.parse(atob(parts[1]));
                if (payload && payload.role === "admin") {
                    isAuthorized = true;
                    localStorage.setItem("adminRole", "admin");
                    if (!user || !user.role) {
                        localStorage.setItem("user", JSON.stringify({ email: payload.email, role: "admin" }));
                    }
                }
            }
        } catch(e) {}
    }

    if (!isAuthorized) {
        alert("Access Denied ❌ Admin login required.");
        window.location.href = "/admin/login.html";
    }
})();

// Safe global token without const collision
window.ADMIN_TOKEN = localStorage.getItem("adminToken") || localStorage.getItem("token") || "";

// 🔐 Login check
fetch("/check")
.then(res => res.text())
.then(data => {
    if (data === "notlogged") {
        window.location.href = "login.html";
    }
});

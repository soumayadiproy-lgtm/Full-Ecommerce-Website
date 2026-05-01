const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "admin") {
    alert("Access Denied ❌");
    window.location.href = "../login.html";
}

const token = localStorage.getItem("token");
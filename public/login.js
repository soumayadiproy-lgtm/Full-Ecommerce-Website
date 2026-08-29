const BASE_URL = "";

// 🔥 SEND OTP
function sendOTP() {
    const phone = document.getElementById("phone").value;

    if (!/^\d{10}$/.test(phone)) {
        alert("Enter valid 10 digit phone ❌");
        return;
    }

    fetch(BASE_URL + "/api/send-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
    })
    .catch(() => {
        alert("Server error ❌");
    });
}


// 🔥 VERIFY OTP + LOGIN
function verifyOTP() {
    const phone = document.getElementById("phone").value;
    const otp = document.getElementById("otp").value;

    if (!phone || !otp) {
        alert("Enter phone & OTP ❌");
        return;
    }

    fetch(BASE_URL + "/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, otp })
    })
    .then(res => res.json())
    .then(data => {

        console.log("LOGIN RESPONSE:", data);

        // ❌ ERROR
        if (!data.token) {
            alert(data.message || "Login failed ❌");
            return;
        }

        // ✅ SAVE TOKEN + USER
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("✅ Login successful");

        // 🔥 ROLE BASED REDIRECT
        if (data.user.role === "admin") {
            window.location.href = "admin.html"; // admin panel
        } else {
            window.location.href = "index.html"; // user home
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server error ❌");
    });
}
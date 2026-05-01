document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone = document.getElementById("phone").value;

    const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone })
    });

    const data = await res.json();

    alert(data.message);
});
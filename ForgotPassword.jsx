import React, { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const res = await axios.put(
                "http://localhost:5000/api/users/forgot-password",
                {
                    email,
                    newPassword
                }
            );

            setMsg(res.data.msg);

        } catch (err) {

            setMsg(
                err.response?.data?.msg ||
                "Something went wrong ❌"
            );
        }
    };

    return (
        <div style={{
            width: "350px",
            margin: "50px auto",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "10px"
        }}>

            <h2>Forgot Password</h2>

            <form onSubmit={handleSubmit}>

                <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "10px"
                    }}
                />

                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "10px"
                    }}
                />

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px"
                    }}
                >
                    Change Password
                </button>

            </form>

            <p>{msg}</p>

        </div>
    );
}
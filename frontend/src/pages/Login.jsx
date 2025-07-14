// import React from "react";
// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";

// const Login = () => {
//   const handleLoginSuccess = async (credentialResponse) => {
//     try {
//       const token = credentialResponse?.credential; // ✅ define token first
//       if (!token) {
//         throw new Error("Token not received from Google");
//       }

//       const decoded = jwtDecode(token);
//       console.log("Google user:", decoded);

//       // Send token to backend
//       const res = await axios.post("http://localhost:5000/auth/google", {
//         token,
//       });

//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));
//         alert("Login successful!");
//         window.location.href = "/home"; // Redirect to home page
//     } catch (err) {
//       console.error("Login failed:", err);
//       alert("Google login failed.");
//     }
//   };

//   return (
//       <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
//           {console.log("Google Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID)}
//       <div className="container text-center mt-5">
//         <h2 className="mb-4">Login with Google</h2>
//         <GoogleLogin
//           onSuccess={handleLoginSuccess}
//           onError={() => console.log("Login Failed")}
//         />
//       </div>
//     </GoogleOAuthProvider>
//   );
// };

// export default Login;

import React, { useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode'; // ✅ correct import for v4+
import axios from 'axios';

const Login = () => {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    /* global google */
    if (window.google && googleButtonRef.current) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleLoginSuccess,
      });

      google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
      });
    }
  }, []);

  const handleLoginSuccess = async (response) => {
    try {
      const { credential } = response;

      const decoded = jwtDecode(credential); // ✅ use named import

      const res = await axios.post("http://localhost:5001/auth/google", {
        token: credential,
      });
      console.log("Google user:", decoded);

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/";
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100vh" }}>
      <h2 className="mb-4">Login with Google</h2>
      <div ref={googleButtonRef}></div>
    </div>
  );
};

export default Login;

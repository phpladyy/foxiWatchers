import { useGoogleLogin } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Logo } from "./Logo";

export function Login({ setUserProfile, setSession }) {
  const [user, setUser] = useState(null);

  const googleAuth = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (!user) return;

    const login = async () => {
      try {
        const res = await fetch(`/.netlify/functions/login`, {
          method: "POST",
          body: JSON.stringify({ access_token: user.access_token }),
        });
        const { profile, sessionId, error } = await res.json();

        if (error) {
          console.log("fetch profile error:", error);
          return;
        }
        setSession(sessionId);
        setUserProfile(profile);
      } catch (err) {
        console.log("error:", err);
      }
    };
    login();
  }, [user, setSession, setUserProfile]);

  return (
    <div>
      <Navbar>
        <Logo/>
        <h1>Login to access webpage</h1>
        <button className="btn-login" onClick={() => googleAuth()}>
          Login
        </button>
      </Navbar>
      <div className="welcomer">Welcome</div>
    </div>
  );
}

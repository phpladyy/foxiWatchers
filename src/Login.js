import { useGoogleLogin } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { useLocalStorage } from "./useLocalStorage";
import axios from "axios";
import { SUPABASE_KEY } from "./App";
import { SUPABASE_URL } from "./App";

export function Login({ setUserProfile, setSession }) {
  const [user, setUser] = useState(null);

  const googleAuth  = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });
 
useEffect(() => {
  if (!user) return;

  axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
    {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
        Accept: "application/json",
      },
    }
  )
  .then(async (res) => {
    const userData = res.data;

    const { data: existingProfile } = await axios.get(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userData.id}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    if (existingProfile[0]) {
      // login handler
      setSession(userData.id);
      setUserProfile(existingProfile[0]);
    } else {
      // no account handler
      const { data } = await axios.post(
        `${SUPABASE_URL}/rest/v1/profiles`,
        { id: userData.id, name: userData.name ,avatar: userData.picture },
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
        }
      );
      setSession(userData.id);
      setUserProfile(data[0]);
    }
  })
  .catch((err) => console.log("error:", err.response?.data));
}, [user]);

return (
  <div>
    <Navbar>
      <h1>Login to access webpage</h1>
      <button className="btn-switch" onClick={() => googleAuth()}>Login</button>
    </Navbar>
  </div>
);
}

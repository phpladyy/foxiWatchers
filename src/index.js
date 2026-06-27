import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId="359904996298-eqqhe9n6r7bgu1b1gj206mjktb5eiop9.apps.googleusercontent.com">
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </GoogleOAuthProvider>
);

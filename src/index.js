import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from 'react-router-dom';
ReactDOM.render(

  <Auth0Provider
    domain="dev-5z6hgz09.us.auth0.com"
    clientId="gmDXmQFsq2uj2rhiQrTkcZwzrqGX9Z8o"
    redirectUri={window.location.origin}
  >
    <React.StrictMode>
      <BrowserRouter>
      <App />
      </BrowserRouter>
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

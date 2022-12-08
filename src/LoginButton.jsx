import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
  const { loginWithRedirect, loginWithPopup } = useAuth0();

  return <button className="navbar-button" onClick={() => loginWithRedirect()}>Create Account</button>;
}

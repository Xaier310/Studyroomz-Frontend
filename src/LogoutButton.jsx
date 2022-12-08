import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LogOut = () => {
  const { logout } = useAuth0();
  return <button className="navbar-button" onClick={() => logout()}>Sign Out</button>;
};

export default LogOut;

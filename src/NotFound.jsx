import React from "react";

export default function NotFound() {
    const style = {
        backgroundColor:"grey",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        height:"100%",
        overflow:"hidden"
    }
  return(
      <div style={style} className="notfound">
          <h1 style={{
              fontSize:"5rem"
          }}>Page not  found</h1>
      </div>
  );
}

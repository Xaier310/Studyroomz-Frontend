import React, { Component, useContext, useEffect, useState } from "react";
import { Route, Redirect } from "react-router-dom";
import Loading from "./Loading"
import { AppContext } from "./App";


const ProtectedRoute = ({isLoading, isAuthenticated, component: Component, ...rest }) => {
  const {
    socket,
    curRoomId
  } = useContext(AppContext);
  var roomid = window.location.href;
  if(roomid[4]==='s') roomid = roomid.substring(41);
  else roomid = roomid.substring(32);
  // for localhost3000 window.location.href.substring(32) 
  // for studyroomz window.location.href.substring(40) 
  

  return (
    <Route
      {...rest}
      render={(props) => {
        if(isLoading){
        return <Loading />;
        }
        else{
          if (isAuthenticated && sessionStorage.getItem("roomid") && sessionStorage.getItem("roomid")!=="" && sessionStorage.getItem("roomid") === roomid) {
            // console.log("proc -> "+roomid+" -> "+curRoomId);
            return (isLoading?<Loading />:<Component {...props} />)}
          else{
            sessionStorage.setItem("roomid","");
              return (
                <Redirect to={{ path: "/", state: { from: props.location } }} />
              );
          }
        }
      }}
    />
  );
};

export default ProtectedRoute;
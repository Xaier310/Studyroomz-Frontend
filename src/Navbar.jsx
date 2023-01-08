import React, { useContext, useEffect, useState } from "react";
import LoginButton from "./LoginButton";
import LogOut from "./LogoutButton";
import { useAuth0, User } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import { AppContext } from "./App";
import UnknownUserImage from "./images/UnknownUser.png";

function Navbar() {
  const {
    prevRoomId,
    socket,
    curUser,
    setCurRoomId,
    curRoomId,
  } = useContext(AppContext);
  const [isNavPopup, setIsNavPopup] = useState(false);
  const { isAuthenticated } = useAuth0();
  let history = useHistory();

  
  const prevChatRoom = (e) => {
    e.preventDefault();
    if (curUser && prevRoomId !== "") {
      var obj = {
        roomId: prevRoomId,
        nickname: curUser.nickname,
        username: curUser.email,
        type: "oldRoom",
      };
      socket.emit("join_room", obj);
      socket.on("isJoined", (isValid) => {
        if (isValid) {
          setCurRoomId(prevRoomId);
          socket.emit("addUser", curUser);
          history.push(`/chat-room/${prevRoomId}`);
        } else {
          setTimeout(() => {
            alert("Previous room has been removed");
          }, 1500);
        }
      });
    } else {
      setTimeout(() => {
        alert("No previous record found");
      }, 1500);
    }
  };

  const navPopupFn=()=>{
    let temp = isNavPopup;
    setIsNavPopup(!isNavPopup);
    if(!temp){
      let ele = document.querySelector(".navbar-child-3");
      if(ele){
        ele.classList.add("navbar-popup-overlay-button-onclick");
      }
      document.getElementById("black-overlay").classList.add("black-overlay");
      document.getElementById("root").classList.add("noscroll");
    }
    else{
      let ele = document.querySelector(".navbar-child-3");
      if(ele){
        ele.classList.remove("navbar-popup-overlay-button-onclick");
      }
      document.getElementById("black-overlay").classList.remove("black-overlay");
      document.getElementById("root").classList.remove("noscroll");
    }
  }
  
  window.addEventListener('resize', closePopup);
  function closePopup(){
    setIsNavPopup(false);
  }

  /**************TEST STUFF****************************** */
  const ActionsOnExit = (redirect_url) => {
    history.push(redirect_url);
    socket.emit("remove_me", curRoomId);
    setCurRoomId("");
    sessionStorage.setItem("roomid","");
  }


  return (
    <>
    <div className="navbar">
      <div className="navbar-child-1">
        <div className="navbar-logo" 
        onClick={()=>ActionsOnExit("/home")}
        >
          <span className="navbar-logo-dot"></span>
          <h4 className="navbar-logo-text">
            StudyRoomz
          </h4>
        </div>
      </div>
      <ul className="navbar-items">
          <li className="navbar-item-1 navbar-item-cc" 
          onClick={()=>ActionsOnExit("/home")}
          >
            <a>
              Home
            </a>
          </li>
          <li className="navbar-item-2 navbar-item-cc">
            <a onClick={prevChatRoom}>Lastroom</a>
          </li>
          <li className="navbar-item-3 navbar-item-cc" 
          onClick={()=>ActionsOnExit("/about_us")}
          >
            <a>
              About
            </a>
          </li>
          <li className="navbar-item-4 navbar-item-cc">
            <a href="#contact-us-form">Contact</a>
          </li>
        </ul>
      <div className="navbar-child-2">
        {!isAuthenticated ? <LoginButton /> : <LogOut />}
      </div>
      <div id="black-overlay" onClick={navPopupFn}></div>
      <div className="hamburger-parent" onClick={navPopupFn}>
      <div id="hamburger" className="navbar-child-3"></div>
      </div>
    </div>
    
    <AnimatePresence>
    {isNavPopup&&
     <motion.div
     initial={{
       x:"100%"
     }}
     animate={{
       x:"0%",
       transition:{
        type:'spring',
        damping:35,
        stiffness:600
      }
     }}
     exit={{
       x:"100%",
       transition:{
        delay:0.1
      }
     }}
     id="navPopup" 
     className="navbar-popup-overlay"
     >

    <div className="navbar-items">
    <motion.div
          initial={{
            x:"200%",
          }}
          animate={{
            x:"0%",
            transition:{
             duration:0.2,
             type:'spring',
             damping:35,
             stiffness:600,
             delay:0.1
           }
          }}
          exit={{
            x:"200%",
          }}
          className="navbar-item-1 navbar-item-cc"
          > 
          {curUser?
            <img src={`${curUser.picture}`} className="userImg">
            </img> : 
            <img src={UnknownUserImage} className="userImg">
            </img>
          }
          </motion.div>
          <motion.div
          initial={{
            x:"200%",
          }}
          animate={{
            x:"0%",
            transition:{
             duration:0.2,
             type:'spring',
             damping:35,
             stiffness:600,
             delay:0.1
           }
          }}
          exit={{
            x:"200%",
          }}
          className="navbar-item-1 navbar-item-cc"
          >
                 <a className="navbar-item-cc-expanded" 
                   onClick={(e) => {
                     socket.emit("remove_me", curRoomId);
                     history.push("/");
                     navPopupFn();
                   }}
                 >
                   Home
                 </a>
          </motion.div>
          <motion.div
           initial={{
            x:"200%",
          }}
          animate={{
            x:"0%",
            transition:{
             duration:0.2,
             type:'spring',
             damping:35,
             stiffness:600,
             delay:0.1
           }
          }}
          exit={{
            x:"200%",
          }}
          className="navbar-item-2 navbar-item-cc">
            <a className="navbar-item-cc-expanded" onClick={(e)=>{
              prevChatRoom(e);
              navPopupFn();}}>Lastroom</a>
          </motion.div>
          <motion.div 
           initial={{
            x:"200%",
          }}
          animate={{
            x:"0%",
            transition:{
             duration:0.2,
             type:'spring',
             damping:35,
             stiffness:600,
             delay:0.1
           }
          }}
          exit={{
            x:"200%",
          }}
          className="navbar-item-3 navbar-item-cc">
            <a
              onClick={(e) => {
                socket.emit("remove_me", curRoomId);
                history.push("/about_us");
                navPopupFn();
              }}
            >
              About
            </a>
          </motion.div>
          <motion.div 
           initial={{
            x:"200%",
          }}
          animate={{
            x:"0%",
            transition:{
             duration:0.2,
             type:'spring',
             damping:35,
             stiffness:600,
             delay:0.1
           }
          }}
          exit={{
            x:"200%",
          }}
          className="navbar-item-4 navbar-item-cc">
            <a className="navbar-item-cc-expanded" href="#contact-us-form" onClick={(e) => {
                navPopupFn();
              }}>Contact</a>
          </motion.div>
        </div>
      <div className="navbar-child-2" 
      onClick={(e) => {
                navPopupFn();
              }}>
        {!isAuthenticated ? <LoginButton /> : 
        <motion.div
        initial={{
          x:"200%",
        }}
        animate={{
          x:"0%",
          transition:{
           duration:0.2,
           type:'spring',
           damping:35,
           stiffness:600,
           delay:0.1
         }
        }}
        exit={{
          x:"300%",
        }}
        >
          <LogOut />
        </motion.div>
        }
      </div>
      {/* </div> */}
     </motion.div>
    }
    </AnimatePresence>
      </>
  );
  {
    /* <button className="navbar-button">Create Account</button> */
  }
}
// className="navbar-popup-overlay"
export default Navbar;

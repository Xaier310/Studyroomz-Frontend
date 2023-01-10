import React, { Component, useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import AOS from "aos";
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import { AppContext } from "./App";
import { useHistory } from "react-router-dom";
import { Picker, NimblePicker } from "emoji-mart"
import "emoji-mart/css/emoji-mart.css"
import data from 'emoji-mart/data/google.json'

import emoji from "./images/emoji.png"
import upload from "./images/upload.png"
import send from "./images/send.png"

function RealChat() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const {
    socket,
    curUser,
    curRoomId, setCurRoomId,
    msgList, setMsgList,
    computationLoading, setComputationLoading
  } = useContext(AppContext);

  let history = useHistory();
  const fileRef = useRef();
  const curMsgRef = useRef();
  const [currMsg, setCurrMsg] = useState("");
  const [isShowUsers,setIsShowUsers] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker ] = useState(false);


  
/*****************************UseEffect********************************** */

  useEffect(()=>{
    socket.on("give_room_users", ({users}) => {
      setChatUsers([...users]);
    });
    return () => socket.off("give_room_users");
  },[]);

  useEffect(()=>{
    socket.emit("give_room_users",{roomId:curRoomId});
  },[curRoomId]);  
  
  useEffect(()=>{
    if(!curRoomId) return;
    const abortController = new AbortController()
    axios.get(`${process.env.REACT_APP_BackendAPI}api/studyroomz`,{ params: { roomid: curRoomId } },
    {
      signal: abortController.signal
    })
    .then((response)=>{
      setMsgList([...response.data]);
      console.log(response.data);
      var objDiv = document.querySelector(".main-part-right-dm-p");
      var height = objDiv?.scrollHeight;
      objDiv?.scrollBy(0, height);
    })
    .catch(error => {
      if (error.name === 'AbortError') return; 
      throw error
    });
    return () => abortController.abort();
  },[curRoomId]);

  useEffect(()=>{
    setCurRoomId(sessionStorage.getItem("roomid"));
    if (!(curUser && curRoomId)) return;
    console.log("useffect join emits...");
    socket.emit("join_room", {roomId:curRoomId, userInfo:curUser, isOldRoom:false },({ error })=>{
      if(error)  return;
    });
    history.push("/chat-room/"+sessionStorage.getItem("roomid"));
  },[curRoomId, curUser]);

  useEffect(() => {
    socket.on("receive_message", (message) => {
      console.log("msg received...");
      setMsgList((msgList) => [...msgList, message]);
      var objDiv = document.querySelector(".main-part-right-dm-p");
      var height = objDiv?.scrollHeight;
      objDiv?.scrollBy(0, height);
    });
    return ()=>socket.off("receive_message");
  }, []);


  /******************************Fucntions************************************ */
  const getCurrTime = () => {
    let date = new Date(Date.now());
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + '/' + mm + '/' + yyyy;
    
    var strTime = hours + ":" + minutes + " " + ampm + " ( "+ today+" )";
    return strTime;
  }
  
  const addMsg = async (e) => {
    e.preventDefault();
    console.log("curMSg ",curMsgRef.current.value);
    var inputMsg = curMsgRef.current.value;
    if (!(user && inputMsg && inputMsg !== "")) return;
    let message = {
      msg: inputMsg,
      roomId: curRoomId,
      _time : Date.now().toString(),
      username: user.email,
      name: user.name,
      time : getCurrTime()
    };
    socket.emit("send_message", message);
    axios.post(`${process.env.REACT_APP_BackendAPI}api/studyroomz`,message,(err,res)=>{
      if(err) console.log(err);
      else console.log("Msg Successfully inserted frontend",res);
    });
    curMsgRef.current.value = "";
    curMsgRef.current.focus();
  };


  //upload files
  // function selectFile(){
    // fileRef.current.click();
  // }

  const fileSelected = (e) => {
    // const file = e.target.files[0];
    // if(!file) return;
    // const reader = new FileReader();
    // reader.readAsDataURL(file);
    // reader.onload = () =>{
    //   const data = reader.result?.toString();
    //   console.log("upload on frontend .... ",data);
    //   socket.emit("upload",{data});
    // };
  }
  const showUsers = ()=>{
    var ele = document.querySelector(".users-button");
    if(ele){
      setIsShowUsers(!isShowUsers);
      ele.classList.add("users-temp");
    }
  }

  const handleOnSelectEmoji = (e)=>{
    curMsgRef.current.value += e.native;
  }

  const ActionsOnExit = () => {
    history.push("/home");
    socket.emit("remove_me", curRoomId);
    setCurRoomId("");
    setMsgList([]);
    sessionStorage.setItem("roomid","");
  }

  /********************Extra Stuff**************************** */

  window.addEventListener('resize', closePopup);
  function closePopup(){
    setIsShowUsers(false);
  }
  window.onpopstate = ActionsOnExit;



/************************TEST STUFF********************** */
useEffect(()=>{
  console.log("test useEffect...");
  socket.on("test",()=>{
    console.log("socket.on test...");
  })
  return () => socket.off("test");
},[]);

const testfn = (e) => {
  console.log("testfn clicked...");
  socket.emit("emit test",curRoomId);
}


  return (
    <>
    {/* <div onClick={testfn} style={{fontSize:"20px", background:"orange", width:"100px"}}>TEST</div> */}
      <div
        className="Chat"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addMsg(e);
          }
        }}
      >
        <div className="chat-navbar">
          <Navbar onClick={closePopup}/>
        </div>
        <h1 className="roomid">ROOM ID : {curRoomId}</h1>
        <main className="main">
        <AnimatePresence>
          {!isShowUsers &&
            <motion.span
            initial={{
              x:"-100%",
              transition:{
              },
              opacity:1
            }}
            animate={{
            x:"0%",
            transition:{
              type:'spring',
              damping:30,
              stiffness:700,
              delay:0.3,
            },
            opacity:1
            }}
            className="users-button" 
            onClick={showUsers}
            >
            <i className="fas fa-angle-double-right"></i>
            </motion.span>
            }
        </AnimatePresence>

        <AnimatePresence>
          {isShowUsers &&
          <motion.div
          initial={{
            x:"-100%",
            transition:{
             duration:0.2,
            }
          }}
          animate={{
            x:"0%",
            transition:{
              duration:0.2,
              type:'spring',
              damping:35,
              stiffness:700
            }
          }}
          exit={{
            x:"-100%",
            transition:{
             duration:0.2
           }
          }}
          className="showUsers main-part-left"
        >
          <span className="users-temp users-button" onClick={showUsers}><i className="fas fa-angle-double-left"></i></span>
            <div className="main-part-left-profile">
              <div className="main-part-left-profile-img">
                <img src={user.picture} alt=""  />
              </div>
              <h4 className="main-part-left-profile-name">{user.name}</h4>
              <span className="main-part-left-profile-name-setting">
                <a
                  onClick={ActionsOnExit}
                >
                  <i className="fas fa-sign-out-alt" 
                    onClick={ActionsOnExit}
                  ></i>
                </a>
              </span>
            </div>
            <div className="main-part-left-participants">
              {chatUsers.map(
                (user) =>
                  user.email !== curUser.email && (
                    <div className="main-part-left-participants-participant-cc">
                      <img
                        className="main-part-left-participants-participant-cc-img"
                        src={user.picture}
                        alt=""
                      />
                      <h4 className="main-part-left-participants-participant-cc-name">
                        {user.name}
                      </h4>
                    </div>
                  )
              )}
            </div>

          </motion.div>
          }
        </AnimatePresence>
  
          <section className="main-part-left">
            <div className="main-part-left-profile">
              <div className="main-part-left-profile-img">
                <img src={user.picture} alt="" />
              </div>
              <h4 className="main-part-left-profile-name">{user.name}</h4>
              <span className="main-part-left-profile-name-setting">
                <a
                  onClick={ActionsOnExit}
                >
                  <i className="fas fa-sign-out-alt"></i>
                </a>
              </span>
            </div>
            <div className="main-part-left-participants">
              {chatUsers.map(
                (user, ind) =>
                  user.email !== curUser.email && (
                    <div className="main-part-left-participants-participant-cc" key={ind}>
                      <img
                        className="main-part-left-participants-participant-cc-img"
                        src={user.picture}
                        alt=""
                        
                      />
                      <h4 className="main-part-left-participants-participant-cc-name">
                        {user.name}
                      </h4>
                    </div>
                  )
              )}
            </div>
          </section>
          <section className="main-part-right">
            <div className="main-part-right-dm-p">
              {msgList&&msgList.map((msg, ind) =>
                curUser.email === msg.username ? (
                  <div className="main-part-right-dm" key={ind}>
                    <div className="main-part-right-dm-msg myMsg" id="myMsg">
                      <p className="main-part-right-dm-msg-name">
                        {msg.name}
                      </p>
                      <p className="main-part-right-dm-msg-text">{msg.msg}</p>
                      <span className="main-part-right-dm-msg-time">
                        {msg.time}
                      </span>
                    </div>
                    <span></span>
                  </div>
                ) : (
                  <div className="main-part-right-dm" onClick={closePopup} key={ind}>
                    <div className="main-part-right-dm-msg myMsg">
                      <p className="main-part-right-dm-msg-name">
                        {msg.name}
                      </p>
                      <p className="main-part-right-dm-msg-text">{msg.msg}</p>
                      <span className="main-part-right-dm-msg-time">
                        {msg.time}
                      </span>
                    </div>
                    <span></span>
                  </div>
                )
              )}
            </div>
            <div className="main-part-right-msgbox">
              <div className="main-part-right-msgbox-typemsg" style={{position:"relative"}}>
                  <input
                    id="inputMsg"
                    ref={curMsgRef}
                    type="text"
                    autoComplete="off"
                    placeholder="Type a message"
                    className="main-part-right-msgbox-typemsg"
                    style={{paddingRight:"110px"}}
                  />
                  <span 
                  style={{
                    position:"absolute", 
                    right:"25px", 
                    marginBottom:"auto",
                    marginTop:"auto", 
                    display:"flex", 
                    alignItems:"center",
                  }}>
                    <img src={emoji} height="20px" width="20px" alt="emoji" 
                      style={{cursor:"pointer"}} 
                      onClick={()=>{
                        console.log("clicked");
                        setShowEmojiPicker(!showEmojiPicker);
                      }}
                    />
                    {/* <img src={upload} height="20px" width="20px" alt="emoji" 
                      style={{marginLeft:"10px", cursor:"pointer"}} 
                    /> */}
                    <img src={send} height="20px" width="20px" alt="emoji" onClick={addMsg} 
                      style={{marginLeft:"10px", cursor:"pointer"}} 
                    />
                  </span>
              </div>
            </div>
          </section>
        </main>
        {showEmojiPicker && <NimblePicker title="Pick Emoji" set='google' data={data} onSelect={handleOnSelectEmoji} 
          style={{ position: 'absolute', bottom: '70px', right: '40px' }} 
        />}
      </div>
    </>
  );
}

export default RealChat;

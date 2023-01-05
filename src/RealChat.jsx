import React, { Component, useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import AOS from "aos";
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import { AppContext } from "./App";
import { useHistory } from "react-router-dom";
import AttachFileIcon from '@mui/icons-material/AttachFile';


function RealChat() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const {
    socket,
    curUser,
    curRoomId,
    setCurRoomId,
    allParticipants,
    setAllParticipants,
    msgList, 
    setMsgList,
    sets, 
    setSets
  } = useContext(AppContext);

  const [currMsg, setCurrMsg] = useState("");
  const [isShowUsers,setIsShowUsers] = useState(false);
  var [LocalallParticipants, setLocalallParticipants] = useState([]);
  let history = useHistory();
  const fileRef = useRef();



  //upload files*****************************************************************************

  function selectFile(){
    fileRef.current.click();
  }

  function fileSelected(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>{
      const data = reader.result?.toString();
      console.log("upload on frontend .... ",data);
      socket.emit("upload",{data});
    };
  }

  useEffect(()=>{
    socket.on("uploaded",(data)=>{
      console.log("uploaded : ",data);
    })
  },[socket]);



  useEffect(() => {
    AOS.init({ duration: 1300,disable: window.innerWidth < 825 });
    AOS.refresh();
  }, []);

  useEffect(() => {
    socket.emit("giveUsers", curRoomId);
    socket.on("getUsers", (obj) => {
      setAllParticipants(obj);
    });
  }, [socket,curRoomId]);

  useEffect(() => {
    socket.emit("give_roomUsers", curRoomId);
    socket.on("get_roomUsers", (users) => {
      var tempArray = [];
      for (let i = 0; i < users.length; i++) {
        for (let j = 0; j < allParticipants.length; j++) {
          if (allParticipants[j].socketid === users[i]) {
            tempArray.push(allParticipants[j].user);
          }
        }
      }
      setLocalallParticipants(tempArray);
    });
  }, [allParticipants]);
  



  function getCurrTime() {
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
    var inputMsg = "";
    if (document.getElementById("inputMsg"))
        inputMsg = document.getElementById("inputMsg").value;
    if (user && inputMsg !== "") {
      let message = {
        key: msgList.length + 1,
        msg: inputMsg,
        roomId: curRoomId,
        time: getCurrTime(),
        nickname: user.nickname,
        username: user.email,
      };
      socket.emit("send_message", message);

      axios.post(`${process.env.REACT_APP_BackendAPI}api/studyroomz`,{
        msg: inputMsg,
        roomId: curRoomId,
        _time : Date.now().toString(),
        username: user.email,
        nickname: user.nickname,
        time : getCurrTime()
      },(err,res)=>{
        if(err) console.log(err);
        else console.log("Msg Successfully inserted frontend",res);
      });
      setCurrMsg("");
      let ele = document.getElementById("inputMsg");
      if (ele) ele.focus();
    } else {
      console.log("Warning! Something went wrong ");
    }
  };

  useEffect(()=>{
    const abortController = new AbortController()
      if(curRoomId){
        axios.get(`${process.env.REACT_APP_BackendAPI}api/studyroomz`,{ params: { roomid: curRoomId } },{
          signal: abortController.signal
        }).then((response)=>{
          setMsgList((msgList) => [...response.data]);
        }).catch(error => {
          if (error.name === 'AbortError') return; 
          throw error
        });
      }
      return () => {
        abortController.abort();
      }
  },[curRoomId]);


  useEffect(()=>{
    setCurRoomId(sessionStorage.getItem("roomid"));
    if (curUser && curRoomId) {
      var obj = {
        roomId: curRoomId,
        nickname: curUser.nickname,
        username: curUser.email,
        type: "newRoom",
      };
      socket.emit("join_room", obj);
      socket.emit("addUser", curUser);
      history.push("/chat-room/"+sessionStorage.getItem("roomid"));
    }
  },[curRoomId]);


  useEffect(() => {
      socket.off("receive_message").on("receive_message", (message) => {
        console.log("msg added3..");
          setMsgList((msgList) => [...msgList, message]);
          var objDiv = document.querySelector(".main-part-right-dm-p");
          var height = objDiv?.scrollHeight;
          objDiv?.scrollBy(0, height);
      });
  }, []);

const showUsers = ()=>{
  var ele = document.querySelector(".users-button");
  if(ele){
    setIsShowUsers(!isShowUsers);
    ele.classList.add("users-temp");
  }
}
window.addEventListener('resize', closePopup);
function closePopup(){
  setIsShowUsers(false);
}

function ActionsOnExit(){
  history.push("/home");
  socket.emit("remove_me", curRoomId);
  setCurRoomId("");
  setMsgList([]);
  sessionStorage.setItem("roomid","");
}

window.onpopstate = ActionsOnExit;


  return (
    <>
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
                <img src={user.picture} alt="" />
              </div>
              <h4 className="main-part-left-profile-name">{user.nickname}</h4>
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
              {LocalallParticipants.map(
                (user) =>
                  user.email !== curUser.email && (
                    <div className="main-part-left-participants-participant-cc">
                      <img
                        className="main-part-left-participants-participant-cc-img"
                        src={user.picture}
                        alt=""
                      />
                      <h4 className="main-part-left-participants-participant-cc-name">
                        {user.nickname}
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
              <h4 className="main-part-left-profile-name">{user.nickname}</h4>
              <span className="main-part-left-profile-name-setting">
                <a
                  onClick={ActionsOnExit}
                >
                  <i className="fas fa-sign-out-alt"></i>
                </a>
              </span>
            </div>
            <div className="main-part-left-participants">
              {LocalallParticipants.map(
                (user) =>
                  user.email !== curUser.email && (
                    <div className="main-part-left-participants-participant-cc">
                      <img
                        className="main-part-left-participants-participant-cc-img"
                        src={user.picture}
                        alt=""
                      />
                      <h4 className="main-part-left-participants-participant-cc-name">
                        {user.nickname}
                      </h4>
                    </div>
                  )
              )}
            </div>
          </section>
          <section className="main-part-right">
            <div className="main-part-right-dm-p">
              {msgList&&msgList.map((msg) =>
                curUser.email === msg.username ? (
                  <div className="main-part-right-dm">
                    <div className="main-part-right-dm-msg myMsg" id="myMsg">
                      <p className="main-part-right-dm-msg-name">
                        {msg.nickname}
                      </p>
                      <p className="main-part-right-dm-msg-text">{msg.msg}</p>
                      <span className="main-part-right-dm-msg-time">
                        {msg.time}
                      </span>
                    </div>
                    <span></span>
                  </div>
                ) : (
                  <div className="main-part-right-dm" onClick={closePopup}>
                    <div className="main-part-right-dm-msg myMsg">
                      <p className="main-part-right-dm-msg-name">
                        {msg.nickname}
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
              <span className="main-part-right-msgbox-file" >
                <input onChange={fileSelected} ref={fileRef} type="file" />
              </span>
              
              <input
                id="inputMsg"
                value={currMsg}
                onChange={(e) => {
                  setCurrMsg(e.target.value);
                }}
                type="text"
                autoComplete="off"
                placeholder="Type a message"
                className="main-part-right-msgbox-typemsg"
              />
              <span className="main-part-right-msgbox-sendbutton">
                <i onClick={addMsg} className="fas fa-paper-plane"></i>
              </span>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default RealChat;

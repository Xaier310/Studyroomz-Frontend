import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"

import firstImg from "./images/1_2.png";
// import firstImg from "./images/1_2 original.svg";

import secondImg from "./images/2_2.png";
// import secondImg from "./images/2_2 original.svg";

import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth0 } from "@auth0/auth0-react";
import { AppContext } from "./App";
import Loading from "./Loading";
import { stepConnectorClasses } from "@mui/material";
// import axios from axios;
const axios = require('axios').default;

const Home = () => {
  
  const {
    socket,
    curUser,
    setPrevRoomId,
    setIsRoomIdValid,
    isWD, setIsWD,
    isAD, setIsAD,
    isML, setIsML,
    curRoomId, setCurRoomId,
    inputRoomId, setInputRoomId,
    popupItems, setPopupItems,
    computationLoading, setComputationLoading
  } = useContext(AppContext);

  const [noOfPartInCR, setNoOfPartInCR] = useState([]);
  const [isPopup, setIsPopup] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const history = useHistory();
  const capacity = 50;
  const roomsPerTopic = 10;



  
  /*********************** UseEffects ********************************* */

  useEffect(() => {
    AOS.init({ duration: 1300, disable: window.innerWidth < 825 });
    AOS.refresh();
  }, []);

  useEffect(()=>{
    console.log("it ran...");
    if(!window.location.href.includes("/chat-room") && curRoomId && curRoomId!==""){
      console.log("it ran2...");
      socket.emit("remove_me",curRoomId);
      setCurRoomId(null);
    }
  },[socket, window.location.href]);

  useEffect(()=>{
    const popupItemsTemp = [];
    for (let i = 0; i < roomsPerTopic; i++) {
      if (isML)
        popupItemsTemp.push(
          isAuthenticated ? (
            <a
              key={i}
              className="no-of-rooms-row-room-cc"
              onClick={() => {
                joinCustomRoom(i + 1);
                noOfPartInCR[i] <= capacity && setIsML(false);
              }}
            >
              {noOfPartInCR[i]}
            </a>
          ) : (
            <a
              key={i}
              className="no-of-rooms-row-room-cc"
              onClick={() => {
                alertFnForPopup();
              }}
            >
              {noOfPartInCR[i]}
            </a>
          )
        );
      else if (isWD)
        popupItemsTemp.push(
          isAuthenticated ? (
            <a
              key={i}
              className="no-of-rooms-row-room-cc"
              onClick={() => {
                joinCustomRoom(i + 1);
                noOfPartInCR[i] <= capacity && setIsWD(false);
              }}
            >
              {noOfPartInCR[i]}
            </a>
          ) : (
            <a
              key={i}
              className="no-of-rooms-row-room-cc"
              onClick={() => {
                alertFnForPopup();
              }}
            >
              {noOfPartInCR[i]}
            </a>
          )
        );
      else if (isAD)
        popupItemsTemp.push(
          isAuthenticated ? (
            <a
              key={i}
              className="no-of-rooms-row-room-cc"
              onClick={() => {
                joinCustomRoom(i + 1);
                noOfPartInCR[i] <= capacity && setIsAD(false);
              }}
            >
              {noOfPartInCR[i]}
            </a>
          ) : (
            <a
              key={i}
              className="no-of-rooms-row-room-cc"
              onClick={() => {
                alertFnForPopup();
              }}
            >
              {noOfPartInCR[i]}
            </a>
          )
        );
    }
    setPopupItems([...popupItemsTemp]);
  },[noOfPartInCR]);


  /***********************Functions **************************************** */
  const randomStr = () => {
    var ans = "";
    const arr = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = 6; i > 0; i--) {
      ans += arr[Math.floor(Math.random() * arr.length)];
    }
    var f = Date.now();
    return ans+f;
  }

  const getCustomStats = (str) => {
    socket.emit("custom_stats_no", {roomStr:str, roomsPerTopic});
    socket.on("custom_stats_no", (lengtharray) => {
      setNoOfPartInCR(lengtharray);
    });
  };


  const createRoom = (e) => {
    e.preventDefault();
    var RoomId = randomStr();
    if (!curUser) return alertfn();
    console.log("create room ran...");
    socket.emit("join_room", { roomId: RoomId, userInfo:curUser, isOldRoom:false }, ({ error })=>{
      if(error) return alertfn(error);
      setCurRoomId(RoomId);
      sessionStorage.setItem("roomid",RoomId);
      setPrevRoomId(RoomId);
      history.push(`/chat-room/${RoomId}`);
    });
  };

  const joinRoom = (e) => {
    e.preventDefault();
    console.log("joinRoom fn ran...");
    if (!(curUser && inputRoomId && inputRoomId !== "")) return alertfn(null, "Invalid Room Id");
    socket.emit("join_room", {roomId:inputRoomId, userInfo:curUser, isOldRoom:true}, ({ error })=>{
      if(error){ 
        console.log("error : ",error);
        // setIsRoomIdValid(false);
        return alertfn(null, error);
      }
      setCurRoomId(inputRoomId);
      sessionStorage.setItem("roomid",inputRoomId);
      setPrevRoomId(inputRoomId);
      history.push(`/chat-room/${inputRoomId}`);
    });
  };

  const joinCustomRoom = (number) => {
    console.log("joinCustomRoom ran...");
    if (noOfPartInCR[number - 1] >= capacity) return alertFnForPopup("This Room is already full try another one");
    var roomid = "";
    if (isWD) roomid = `webroom${number}`;
    else if (isAD) roomid = `androidroom${number}`;
    else if (isML) roomid = `mlroom${number}`;
    socket.emit("join_room", { roomId:roomid, userInfo:curUser, isOldRoom:false }, ({ error })=>{
      if(error) return alertFnForPopup(error);
      setCurRoomId(roomid);
      setPrevRoomId(roomid);
      sessionStorage.setItem("roomid",roomid);
      history.push(`/chat-room/${roomid}`);
    });
  };
  
  const alertfn = (e = null, str = "Please login first") => {
    var ele = document.querySelector(".alert");
    if (ele) ele.innerText = str;
    setTimeout(() => {
      ele.innerText = "";
    }, 2000);
  };
  const alertFnForPopup = (str = "Please login first") => {
    var ele = document.querySelector(".alertForPopup");
    if (ele) ele.innerText = str;
    setTimeout(() => {
      ele.innerText = "";
    }, 2000);
  };



  /************* Testing Stuff ****************************/

  return (
    <>
      <div className="Home">
        <div className="navbar-div" data-aos="fade-up">
        <Navbar/>
        </div>
        <main className="main">
        <AnimatePresence>
        {isPopup && 
         <motion.div
         initial={{
        }}
        animate={{
          transition:{
           opacity:1,
           duration:0.00001
         }
        }}
        exit={{
          opacity:0
        }}
         className="popup-roomid-input" onKeyDown={(e) => {
         if (e.key === "Enter") {
           isAuthenticated ? joinRoom(e) : alertfn();
         }
         }}
       >
          <motion.div
            initial={{
              y:"-50vh",  
              opacity:0                  
            }}
            animate={{
              y:"0",
              transition:{
               duration:0.3,
              },
              opacity:1
            }}
            exit={{
              y:"65vh",
              opacity:0 
            }}
            className="popup-roomid-input-bg"
            style={{
              marginLeft:"1rem",
              marginRight:"1rem"
            }}
          >
            <h1>Enter Room ID</h1>
            <div className="popup-roomid-input-bg-extra">
              <input
                placeholder="Enter room id . . ."
                type="text"
                autoFocus
                onChange={(event) => {
                  setInputRoomId(event.target.value.trim());
                }}
              />
              <button
                id="link"
                onClick={isAuthenticated ? joinRoom : alertfn}
              >
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          
            <div
              onClick={() => setIsPopup(false)}
              className="no-of-rooms-row-closeButton"
            >
              <i className="fas fa-times"></i>
            </div>
            <p className="alert"></p>
          </motion.div>

         </motion.div>
          }
          </AnimatePresence>
          <section className="main-part-1" data-aos="fade-up" data-aos-delay="100">
            <div className="main-part-1-left">
              <h1 className="main-part-1-left-heading" data-aos="fade-up">
                You will never study alone again create your own rooms.
              </h1>
              <p className="main-part-1-left-para" data-aos="fade-up">
                Join the largest global student community online and say goodbye
                to lack of motivation. Create your own Room and share room-Id
                with others or join a already created room.
                <br />
                <br />
                Joining a virtual study room is just like attending a Video
                Call, where instead of talking all the participants on the call
                are studying and motivating each other to do the same.
              </p>

              <div className="main-part-1-left-buttons" data-aos="fade-up" data-aos-delay="200">
                <button
                  className="main-part-1-left-buttons-button-1 main-part-1-left-buttons-button-cc"
                  onClick={isAuthenticated ? createRoom : alertfn}
                >
                  Create Room
                </button>

                <button
                  className="main-part-1-left-buttons-button-2 main-part-1-left-buttons-button-cc"
                  onClick={() => setIsPopup(true)}
                >
                  <i className="fas fa-home"></i>Enter in a Room
                </button>

              </div>
                <p className="alert"></p>
            </div>
            <div className="main-part-1-right" data-aos="fade-up">
              <img className="main-part-1-right-image" src={firstImg} alt="" />
            </div>
          </section>
          <AnimatePresence>
          {(isML || isWD || isAD) && 
                <motion.div
                initial={{
                  opacity:0
                }}
                animate={{
                  opacity:1,
                  duration:0.00001
                }}
                exit={{
                  opacity:0
                }}
                className="no-of-rooms">
                   <motion.div
                            initial={{
                              y:"-50vh",  
                              opacity:0                  
                            }}
                            animate={{
                              y:"0",
                              transition:{
                               duration:0.3,
                              },
                              opacity:1
                            }}
                            exit={{
                              y:"65vh",
                              opacity:0 
                            }}
                    style={{
                      marginLeft:"1rem",
                      marginRight:"1rem"
                    }}
                   className="no-of-rooms-row">
                    {popupItems}
                    {/* <span
                      onClick={(e)=>{isAuthenticated ? createRoom(e) : alertFnForPopup()}}
                      className="no-of-rooms-row-room-cc"
                    >
                      <i className="fa fa-plus" aria-hidden="true"></i>
                    </span> */}
                    <div className="no-of-rooms-row-closeButton">
                      <i
                        className="fas fa-times"
                        onClick={() => {
                          setIsML(false);
                          setIsWD(false);
                          setIsAD(false);
                        }}
                      ></i>
                    </div>
                    <br />
                    <p className="alertForPopup" style={{flex:1,flexBasis:"100%",textAlign:"center"}}></p>
                  </motion.div>
                </motion.div>
              }
          </AnimatePresence>
          <section className="main-part-2" data-aos="fade-up" data-aos-offset="200">
            <div className="main-part-2-right" id="rooms">
              <div className="sec-img">
            <img className="main-part-2-left-img" src={secondImg} alt="img not available" />
              </div>


              <div className="main-part-2-right-detail">
              <h1 className="main-part-2-right-heading" data-aos="fade-up">
                Want to have focus on special topics ??
              </h1>
              <p className="main-part-2-right-para" data-aos="fade-up">
                Don't worry. We have pre-built rooms for different topics - Web
                development, App development, Machine Learning. Choose different
                rooms on the basis of how many participants are active. All
                rooms are limited to 50 participants to increase interaction
              </p>
              </div>
              <div className="main-part-2-right-cards" data-aos="fade-up" data-aos-offset="300">
                <div className="main-part-2-right-cards-card-1 main-part-2-right-cards-card-cc">
                  <h1 className="main-part-2-right-cards-card-cc-heading-cc">
                    <i className="fab fa-js-square"></i>
                    <span>Web Development</span>
                  </h1>
                  <button
                    className="main-part-2-right-cards-card-cc-button-cc"
                    onClick={() => {
                      setIsWD(true);
                      getCustomStats("webroom");
                    }}
                  >
                    Join Room
                  </button>
                </div>
                <div className="main-part-2-right-cards-card-2 main-part-2-right-cards-card-cc">
                  <h1 className="main-part-2-right-cards-card-cc-heading-cc">
                    <i className="fab fa-apple"></i>
                    <span>App Development</span>
                  </h1>
                  <button
                    className="main-part-2-right-cards-card-cc-button-cc"
                    onClick={() => {
                      setIsAD(true);
                      getCustomStats("androidroom");
                    }}
                  >
                    Join Room
                  </button>
                </div>
                <div className="main-part-2-right-cards-card-3 main-part-2-right-cards-card-cc">
                  <h1 className="main-part-2-right-cards-card-cc-heading-cc">
                    <i className="fab fa-python"></i>
                    <span>Machine Learning</span>
                  </h1>
                  <button
                    className="main-part-2-right-cards-card-cc-button-cc"
                    onClick={() => {
                      setIsML(true);
                      getCustomStats("mlroom");
                    }}
                  >
                    Join Room
                  </button>
                </div>
                {/* <div className="main-part-2-right-cards-card-4 main-part-2-right-cards-card-cc">
        <h1 className="main-part-2-right-cards-card-cc-heading-cc">Random</h1>
        <button className="main-part-2-right-cards-card-cc-button-cc">Join Room</button>
        </div>     */}
              </div>
            </div>
          </section>
        </main>
        <footer className="footer"></footer>
      <Footer />
      </div>
    </>
  );
};

export default Home;

import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"
import firstImg from "./images/2.jpg";
import secondImg from "./images/1.jpg";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth0 } from "@auth0/auth0-react";
import { AppContext } from "./App";
// import axios from axios;
const axios = require('axios').default;

console.log(process.env.REACT_APP_BackendAPI);

const Home = () => {
  const {
    socket,
    curUser,
    setIsRoomIdValid,
    isWD,
    setIsWD,
    isAD,
    setIsAD,
    isML,
    setIsML,
    curRoomId,
    setCurRoomId,
    inputRoomId,
    setInputRoomId,
    setPrevRoomId,
    sets, 
    setSets
  } = useContext(AppContext);
  const [noOfPartInCR, setNoOfPartInCR] = useState([0, 0, 0, 0, 0]);
  const [isPopup, setIsPopup] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();
  var history = useHistory();
  let capacity = 15;

  function randomStr() {
    var ans = "";
    const arr =
      "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = 6; i > 0; i--) {
      ans += arr[Math.floor(Math.random() * arr.length)];
    }
    var f = Date.now();
    return ans+f;
  }

  // var options = {
  //   method: 'GET',
  //   url: 'https://dev-5z6hgz09.us.auth0.com/api/v2/users',
  //   params: {q: 'email.raw:"xaier310@gmail.com"', search_engine: 'v2'},
  //   headers: {authorization: 'Bearer ACCESS_TOKEN'}
  // };
  
  // axios.request(options).then(function (response) {
  //   console.log("user data : ",response.data);
  // }).catch(function (error) {
  //   console.error(error);
  // });



  const getCustomStats = async (str) => {
    await socket.emit("custom_stats", str);
    socket.on("your_custom_stats", (lengtharray) => {
      setNoOfPartInCR(lengtharray);
    });
  };


  const createRoom = (e) => {
    e.preventDefault();
    console.log("createRoom fn ran...");
    var RoomId = randomStr();
    if (curUser) {
      var obj = {
        roomId: RoomId,
        nickname: curUser.nickname,
        username: curUser.email,
        type: "newRoom",
      };
      setCurRoomId(RoomId);
      sessionStorage.setItem("roomid",RoomId);
      socket.emit("join_room", obj);
      setPrevRoomId(RoomId);
      socket.emit("addUser", curUser);
      history.push(`/chat-room/${RoomId}`);
    } 
    else {
      alertfn();
    }
  };

  const joinRoom = (e) => {
    console.log("joinRoom fn ran...");
    e.preventDefault();
    if (curUser && inputRoomId && inputRoomId !== "") {
      var obj = {
        roomId: inputRoomId,
        nickname: curUser.nickname,
        username: curUser.email,
        type: "oldRoom",
      };
      socket.emit("join_room", obj);
      socket.off("isJoined").on("isJoined", (isValid) => {
        if (isValid) {
          setCurRoomId(inputRoomId);
          sessionStorage.setItem("roomid",inputRoomId);
          setPrevRoomId(inputRoomId);
          socket.emit("addUser", curUser);
          history.push(`/chat-room/${inputRoomId}`);
        } else {
          setIsRoomIdValid(false);
          alertfn(null, "Invalid Room Id");
        }
      });
    } else {
      alertfn(null, "Invalid Room Id");
    }
  };

  const joinCustomRoom = (number) => {
    if (noOfPartInCR[number - 1] < capacity) {
      var roomid = "";
      if (isWD) roomid = `webroom${number}`;
      else if (isAD) roomid = `androidroom${number}`;
      else if (isML) roomid = `mlroom${number}`;
      setCurRoomId(roomid);
      sessionStorage.setItem("roomid",roomid);
      setPrevRoomId(roomid);
      socket.emit("join_custom_room", roomid);
      socket.emit("addUser", curUser);
      history.push(`/chat-room/${roomid}`);
    } else {
      alertFnForPopup("This Room is already full try another one");
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1300, disable: window.innerWidth < 825 });
    AOS.refresh();
  }, []);

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


  const popupItems = [];
  for (let i = 0; i < 5; i++) {
    if (isML)
      popupItems.push(
        isAuthenticated ? (
          <a
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
            className="no-of-rooms-row-room-cc"
            onClick={() => {
              alertFnForPopup();
            }}
          >
            {noOfPartInCR[i]}
          </a>
        )
      );
    // participantsInCR.MlRoom[`mlroom${i+1}`]
    else if (isWD)
      popupItems.push(
        isAuthenticated ? (
          <a
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
            className="no-of-rooms-row-room-cc"
            onClick={() => {
              alertFnForPopup();
            }}
          >
            {noOfPartInCR[i]}
          </a>
        )
      );
    // participantsInCR.WebRoom[`webroom${i+1}`]
    else if (isAD)
      popupItems.push(
        isAuthenticated ? (
          <a
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
            className="no-of-rooms-row-room-cc"
            onClick={() => {
              alertFnForPopup();
            }}
          >
            {noOfPartInCR[i]}
          </a>
        )
      );
    // participantsInCR.AndroidRoom[`androidroom${i+1}`]
  }

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
                onChange={(event) => {
                  setInputRoomId(event.target.value);
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
                    <span
                      onClick={(e)=>{isAuthenticated ? createRoom(e) : alertFnForPopup()}}
                      className="no-of-rooms-row-room-cc"
                    >
                      <i className="fa fa-plus" aria-hidden="true"></i>
                    </span>
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
                    <p className="alertForPopup"></p>
                  </motion.div>
                </motion.div>
              }
          </AnimatePresence>
          <section className="main-part-2" data-aos="fade-up" data-aos-offset="200">
            {/* <div className="main-part-2-left"> */}
            {/* </div> */}
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
                rooms are limited to 15 participants to increase interaction
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

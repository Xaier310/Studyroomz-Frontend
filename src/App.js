import { createContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import RealChat from "./RealChat";
import "./css/Home.css";
import Home from "./Home";
import { io } from "socket.io-client";
import Loading from "./Loading";
import About from "./About";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "./NotFound"
import { useAuth0 } from "@auth0/auth0-react";
export const AppContext = createContext(null);

function App() {
  const [curUser, setCurUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isRoomIdValid, setIsRoomIdValid] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWD, setIsWD] = useState(false);
  const [isAD, setIsAD] = useState(false);
  const [isNewRoom, setIsNewRoom] = useState(false);
  const [isML, setIsML] = useState(false);
  const [curRoomId, setCurRoomId] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  const [inputRoomId, setInputRoomId] = useState("");
  const [prevRoomId, setPrevRoomId] = useState("");
  const [sets, setSets] = useState(new Set());
  const [msgList, setMsgList] = useState([]);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [popupItems, setPopupItems] = useState([]);
  const [computationLoading, setComputationLoading] = useState(false);
  
  useEffect(() => {
    user && setCurUser(user);
  }, [user]);
  
  useEffect(() => {
    setSocket(
      io(`${process.env.REACT_APP_BackendAPI}`, {
        transports: ["websocket"],
      })
    );
  }, []);

 
  const value = {
    socket,
    curUser,
    isRoomIdValid, setIsRoomIdValid,
    isLoggedIn, setIsLoggedIn,
    isWD, setIsWD,
    isAD, setIsAD,
    isML, setIsML,
    curRoomId, setCurRoomId,
    isNewRoom, setIsNewRoom,
    allParticipants, setAllParticipants,
    inputRoomId, setInputRoomId,
    prevRoomId, setPrevRoomId,
    msgList, setMsgList,
    sets, setSets,
    popupItems, setPopupItems,
    computationLoading, setComputationLoading
  }  

  return (
    <AppContext.Provider value={value} >
      <Router>
        <Switch>
          <Route exact path="/home">
            <Redirect to="/" />
          </Route>
          <Route exact path="/" component={isLoading ? Loading : Home} />
          <Route exact path="/about_us" component={isLoading ? Loading : About} />
          <ProtectedRoute
            exact path="/chat-room/:roomid"
            component={RealChat}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            />
            <Route component={NotFound} />
        </Switch>
      </Router>
    </AppContext.Provider>
  );
}

export default App;



// var Rooms = {
//   WebRoom: ["webroom1", "webroom2", "webroom3", "webroom4", "webroom4"],
//   MlRoom: ["mlroom1", "mlroom2", "mlroom3", "mlroom4", "mlroom5"],
//   AndroidRoom: [
//     "androidroom1",
//     "androidroom2",
//     "androidroom3",
//     "androidroom4",
//     "androidroom5",
//   ],
// };
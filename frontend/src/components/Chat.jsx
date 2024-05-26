import React, { useContext, useEffect, useRef, useState } from "react";
import "./ripple.css";
import Logo from "./Logo";
import { UserContext } from "../UserContext";
import PingImg from "./ping.png";
import { uniqBy } from "lodash";
import axios from "axios";
import Contact from "./Contact";
import Avatar from "./Avatar";

function Chat() {
  const [socketCon, setSocketCon] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [offlineUsers, setOfflineUsers] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [newtxtmsg, setNewtxtmsg] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, id, setId, setUsername } = useContext(UserContext);
  const scrollRef = useRef();

  useEffect(() => {
    const ws = new WebSocket("ws://chatapp-ayim.onrender.com");
    ws.addEventListener("open", () => setSocketCon(ws));
    ws.addEventListener("message", handleMsg);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        autoReconn();
      }, 1000);
    });

    return () => {
      ws.close();
    };
  }, []);

  function autoReconn() {
    const ws = new WebSocket("ws://chatapp-ayim.onrender.com");
    setSocketCon(ws);
    ws.addEventListener("message", handleMsg);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        autoReconn();
      }, 1000);
    });
  }

  function showOnlineUsers(activeUsers) {
    const people = {};
    activeUsers.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlineUsers(people);
  }

  function handleMsg(e) {
    const msgData = JSON.parse(e.data);

    if (msgData.online) {
      showOnlineUsers(msgData.online);
    } else if (msgData.text) {
      if (msgData.sender === selectedUser || msgData.recipient === selectedUser) {
        setMessages((prev) => [...prev, msgData]);
      }
    }
  }

  function sendMsg(e, file = null) {
    if (e) e.preventDefault();
    const message = {
      to: selectedUser,
      text: newtxtmsg,
      file,
    };
    socketCon.send(JSON.stringify(message));

    if (!file) {
      setNewtxtmsg("");
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          sender: id,
          recipient: selectedUser,
          _id: Date.now(),
        },
      ]);
    } else {
      axios.get(`/messages/${selectedUser}`).then((res) => {
        setMessages(res.data);
      });
    }
  }

  function sendFile(e) {
    const fptr = new FileReader();
    fptr.readAsDataURL(e.target.files[0]);
    fptr.onload = () => {
      sendMsg(null, {
        fileName: e.target.files[0].name,
        data: fptr.result,
      });
    };
  }

  function logout() {
    axios.post("/logout").then(() => {
      setSocketCon(null);
      setId(null);
      setUsername(null);
    });
  }

  const actualOnlineUsers = { ...onlineUsers };
  delete actualOnlineUsers[id]; 

  const onlineUserIds = Object.keys(actualOnlineUsers);

  const filterMsg = uniqBy(messages, "_id");
  useEffect(() => {
    const div = scrollRef.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      axios.get(`/messages/${selectedUser}`).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUser,messages]);

  useEffect(() => {
    axios.get("/contacts").then((res) => {
      const offlineCon = res.data.filter((p) => p._id !== id && !Object.keys(onlineUsers).includes(p._id));
      const offlineConObj = {};
      offlineCon.forEach((p) => {
        offlineConObj[p._id] = p.user;
      });
      setOfflineUsers(offlineConObj);
    });
  }, [onlineUsers, id]);

  const allContacts = { ...actualOnlineUsers, ...offlineUsers };

  return (
    <div className="flex h-screen text-2xl font-mono">
      <div className="bg-gray-300 w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(actualOnlineUsers).map((userId) => (
            <Contact
              key={userId}
              online={true}
              userId={userId}
              username={actualOnlineUsers[userId]}
              onClick={() => {
                setSelectedUser(userId);
              }}
              selected={userId === selectedUser}
            />
          ))}
          {Object.keys(offlineUsers).map((id) => (
            <Contact
              key={id}
              online={false}
              userId={id}
              username={offlineUsers[id]}
              onClick={() => {
                setSelectedUser(id);
              }}
              selected={id === selectedUser}
            />
          ))}
        </div>
        <div className="text-center p-2 justify-center items-center flex">
          <span className="text-lg mr-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                clipRule="evenodd"
              />
            </svg>
            {username}
          </span>
          <button
            onClick={logout}
            className="text-lg text-black opacity-70 font-bold bg-zinc-400 py-1 px-2 rounded-md border"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-gray-400 w-2/3  text-2xl font-mono">
        <div className="flex-grow">
          {!selectedUser && (
            <div className="flex flex-col items-center">
              <img src={PingImg} style={{ width: "300px" }} alt="pic" />
              <div className="flex h-full justify-center items-center">
                <div className="flex gap-2 items-center text-gray-300 text-3xl font-mono">
                  <span className="text-gray-300 text-4xl font-mono">
                    &larr;{" "}
                  </span>
                  No chat selected
                </div>
              </div>
            </div>
          )}
          {!!selectedUser && (
            <div className="relative h-full">
              <div className="relative w-100 z-10 bg-gray-500 opacity-60 shadow-xl">
                <div className="p-2 flex gap-2 items-center">
                  <Avatar username={allContacts[selectedUser]} userId={selectedUser} online={onlineUserIds.includes(selectedUser)}/>
                  {allContacts[selectedUser] && (
                  <span className="text-white font-bold">{allContacts[selectedUser].toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="p-2 overflow-y-scroll absolute top-16 left-0 right-0 bottom-1">
                {filterMsg.map((msg) => (
                  <div
                    key={msg._id}
                    className={msg.sender === id ? "text-right" : "text-left"}
                  >
                    <div
                      className={`text-left inline-block p-2 mt-3 rounded-t-lg text-sm ${
                        msg.sender === id
                          ? `bg-zinc-500 text-white rounded-l-lg`
                          : `bg-white text-gray-700 rounded-r-lg`
                      } `}
                    >
                      {msg.text}
                      {msg.file && (
                        <div className={`rounded ${msg.sender === id?`glass-effect-r`:`glass-effect-l`}`}>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 p-2 border-b"
                            href={
                              axios.defaults.baseURL +
                              "/uploads/" +
                              msg.file
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill={msg.sender === id ? "white" : "#4b5563"}
                              className={`w-8 h-8 m-1 rounded-full border-2 ${
                                msg.sender !== id
                                  ? "border-gray-600"
                                  : "border-slate-50"
                              } p-1`}
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 6.75a.75.75 0 0 1 1.5 0v2.546l.943-1.048a.75.75 0 0 1 1.114 1.004l-2.25 2.5a.75.75 0 0 1-1.114 0l-2.25-2.5a.75.75 0 1 1 1.114-1.004l.943 1.048V8.75Z"
                                clipRule="evenodd"
                              />
                            </svg>

                            <span
                              className={`text-left rounded mr-1 inline-block font-bold rounded-t-lg text-sm ${
                                msg.sender === id
                                  ? `text-white rounded-l-lg`
                                  : `text-gray-700 rounded-r-lg`
                              }`}
                            >
                              {msg.file}
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUser && (
          <form className="flex gap-2 m-2" onSubmit={sendMsg}>
            <label className="cursor-pointer bg-gray-500 font-bold p-2 ml-1 mr-1 mt-1 absolute text-white rounded-lg">
              <input type="file" onChange={sendFile} className="hidden " />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                strokeWidth={1.5}
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <input
              type="text"
              placeholder="Message"
              value={newtxtmsg}
              onChange={(e) => setNewtxtmsg(e.target.value)}
              className="bg-white text-lg flex-grow border pr-2 pt-2 pb-2 pl-12 rounded-lg"
            />
            <button
              type="submit"
              className="bg-gray-500 p-2 text-white rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chat;

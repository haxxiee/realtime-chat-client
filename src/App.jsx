import { useEffect, useState } from "react";

import { io } from "socket.io-client";

let socket = io("http://localhost:4000");

function App() {
  const [roomsVisited, setRoomsVisited] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");
  const [addRoom, setAddRoom] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("ready");
    });

    socket.on("initial_data", (rooms) => {
      setRooms(rooms);
    });

    socket.on("user_error", (data) => {
      setCurrentUser({ name: "" });
      setUsername("");
      alert(data);
    });
    socket.on("room_error", (data) => {
      alert(data);
    });

    socket.on("user_info", (data) => {
      setCurrentUser(data);
    });

    socket.on("messages", (data) => {
      if (data) setMessages(data);
    });

    socket.on("new_message", (data) => {
      console.log(data);
      setMessages([...messages, data]);
    });

    return () => socket.off();
  });

  useEffect(() => {
    if (roomsVisited[roomsVisited.length - 2]) {
      socket.emit("leave_room", roomsVisited[roomsVisited.length - 2]);
    }

    if (currentRoom) socket.emit("join_room", currentRoom);
    socket.emit("get_messages", currentRoom);
  }, [currentRoom]);

  const handleClickCreate = () => {
    socket.emit("create_room", addRoom);
    setAddRoom("");
  };

  const handleUserClick = () => {
    setCurrentUser({ name: username });
    socket.emit("create_user", username);
    socket.emit("ready");
  };

  const handleDeleteClick = () => {
    console.log(currentRoom);
    socket.emit("delete_room", currentRoom);
    setCurrentRoom(undefined);
    socket.emit("ready");
  };

  const handleMessageClick = (e) => {
    e.preventDefault();
    const newMessage = {
      message: messageInput,
      username: currentUser.name,
      userId: currentUser.id,
      roomName: currentRoom,
    };
    setMessageInput("");
    socket.emit("message", newMessage);
    socket.emit("get_messages", currentRoom);
  };

  const handleChange = (e) => {
    setCurrentRoom(e.target.value);
    setRoomsVisited([...roomsVisited, e.target.value]);
  };

  return (
    <div className="App">
      {!currentUser.name ? (
        <>
          <h1 className="text-center text-3xl mt-10">Join our chat!</h1>
          <div className="flex justify-center items-center my-60">
            <div className="w-full max-w-xs">
              <form className="bg-blue-200 shadow-md rounded px-7 pt-5 pb-3 mb-4">
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <button
                    className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-5"
                    type="button"
                    onClick={handleUserClick}
                  >
                    Create user
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : null}

      {currentUser.name ? (
        <>
          <div className="flex justify-center items-center">
            <h3 className=" text-xl my-5 text-center">
              You are logged in as{" "}
              <b className="text-blue-700">{currentUser.name} </b>
              and are in <b>{!currentRoom ? " no room" : ` ${currentRoom}`}</b>
            </h3>
          </div>
          <div className="flex justify-center items-center">
            <div className="inline-block relative w-64">
              <select
                className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                onChange={(e) => handleChange(e)}
              >
                {rooms.map((room) => {
                  return <option key={room.id}>{room.name}</option>;
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="flex justify-between items-center mt-16">
        {currentUser.name ? (
          <div className="flex justify-center items-center ml-20">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 mr-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="room"
              type="text"
              placeholder="Enter Room Name"
              value={addRoom}
              onChange={(e) => setAddRoom(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:blue-red-700 text-white font-bold py-2 px-3  rounded-md w-full"
              onClick={handleClickCreate}
            >
              Add Room
            </button>
          </div>
        ) : null}
        {currentUser.name && currentRoom !== undefined ? (
          <div className="mr-20">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
              onClick={(e) => handleDeleteClick(e)}
            >
              Delete this room
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
      {currentUser.name && currentRoom ? (
        <>
          <div className="flex justify-center items-center">
            <div className="flex justify-start items-center w-96 h-96 overflow-auto ">
              <ul>
                {messages.map((message) => {
                  return (
                    <div key={message.id} className="my-3">
                      <h2
                        className={`font-bold ${
                          currentUser.name === message.user_name
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {message.user_name}
                      </h2>
                      <p>{message.message}</p>
                    </div>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <form>
              <div className="mb-4 w-96 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                <div className="py-2 px-4 bg-white rounded-t-lg dark:bg-gray-800">
                  <label htmlFor="comment" className="sr-only">
                    Your message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    className="px-0 w-full text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                    placeholder="Write a message.."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex justify-between items-center py-2 px-3 border-t dark:border-gray-600">
                  <button
                    className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                    onClick={handleMessageClick}
                  >
                    Post message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default App;

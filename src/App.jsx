import { useEffect, useState, useRef } from "react";

import { io } from "socket.io-client";

let socket = io("http://localhost:4000");

function App() {
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("ready");
    });

    socket.on("initial_data", (data) => {
      setRooms(data.rooms);
      setUsers(data.users);
    });

    socket.on("user_error", (data) => {
      setCurrentUser({ name: "" });
      setUsername("");
      alert(data);
    });

    socket.on("user_info", (data) => {
      console.log(data);
      setCurrentUser(data);
    });

    return () => socket.off();
  });

  const handleClick = () => {
    console.log(rooms);
    console.log(users);
    socket.emit("create_room", "TEST");
    socket.emit("ready");
  };

  const handleUserClick = () => {
    setCurrentUser({ name: username });
    console.log(username);
    socket.emit("create_user", username);
    socket.emit("ready");
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
                onChange={(e) => setCurrentRoom(e.target.value)}
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

      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={handleClick}
        >
          Button
        </button>
      </div>
    </div>
  );
}

export default App;

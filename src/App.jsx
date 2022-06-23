import { useEffect, useState, useRef } from "react";
import JoinRoom from "./pages/JoinRoom";
import { io } from "socket.io-client";

let socket = io("http://localhost:4000");

function App() {
  const [currentUser, setCurrentUser] = useState({});
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      setCurrentUser({ ...currentUser, id: socket.id });
      socket.emit("ready");
    });

    socket.on("initial_data", (data) => {
      setRooms(data.rooms);
      setUsers(data.users);
    });

    return () => socket.off();
  });

  const handleClick = () => {
    console.log(rooms);
    console.log(users);
    console.log(currentUser);
  };

  return (
    <div className="App">
      <JoinRoom rooms={rooms} />
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

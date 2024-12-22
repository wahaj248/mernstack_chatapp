import { io } from "socket.io-client";
import { BASE_URL } from "./pages/BaseUrl";

let socketInstance = null;

const getSocketInstance = () => {
    if (!socketInstance) {
        socketInstance = io(BASE_URL, {
            auth: {
                token: localStorage.getItem('token')
            },
        });
        socketInstance.on("connetion", (socket) => {
            console.log("Socket initialized:", socket.id);
        });
    }
    return socketInstance;
};

export default getSocketInstance;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("./App.css");
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const socket = (0, socket_io_client_1.default)('http://localhost:3000');
function App() {
    socket.emit('message', "HENLO");
    return (<>
    <h1>HENLO</h1>
    </>);
}
exports.default = App;

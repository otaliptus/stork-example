"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const buffer_1 = require("buffer");
class WebSocketClient {
    constructor(url, username, password) {
        this.token = buffer_1.Buffer.from(`${username}:${password}`, "utf8").toString("base64");
        this.username = username;
        this.password = password;
        this.ws = new ws_1.default(url, {
            headers: {
                Authorization: `Basic ${this.token}`,
                "Sec-Websocket-Extensions": "permessage-deflate",
            },
        });
        this.ws.on("open", () => {
            console.log("Connected to the WebSocket server");
            this.subscribeToAssets(["BTCUSD", "ETHUSD"]);
        });
        this.ws.on("message", (data) => {
            console.log("Received message:", data);
            this.handleMessage(data);
        });
        this.ws.on("error", (error) => {
            console.log("Error occurred:", error);
        });
        this.ws.on("close", () => {
            console.log("Disconnected from the WebSocket server");
        });
    }
    subscribeToAssets(assets) {
        const subscriptionMessage = {
            type: "subscribe",
            data: assets,
        };
        this.ws.send(JSON.stringify(subscriptionMessage));
    }
    unsubscribeFromAssets(assets) {
        const subscriptionMessage = {
            type: "unsubscribe",
            data: assets,
        };
        this.ws.send(JSON.stringify(subscriptionMessage));
    }
    handleMessage(data) {
        const message = JSON.parse(data);
        switch (message.type) {
            case "subscribe":
                console.log("Subscribed to assets:", message.data.subscriptions);
                break;
            case "unsubscribe":
                console.log("Unsubscribed from assets:", message.data.subscriptions);
                break;
            case "oracle_prices":
                console.log("Received aggregated price update:", message.data);
                break;
            default:
                console.log("Unknown message type:", message.type);
        }
    }
}
const url = "wss://api.jp.stork-oracle.network/evm/subscribe";
const username = "citrea";
const password = "soft-mistreat-economy-quaint";
const client = new WebSocketClient(url, username, password);

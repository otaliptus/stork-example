import WebSocket from "ws";
import { Buffer } from "buffer";

interface SubscriptionMessage {
  type: "subscribe" | "unsubscribe";
  data: string[];
  trace_id?: string;
}

interface SubscriptionResponse {
  type: "subscribe" | "unsubscribe";
  data: {
    subscriptions: string[];
  };
  trace_id?: string;
}

interface AggregatedPriceUpdate {
  type: "oracle_prices";
  data: {
    [assetId: string]: {
      timestamp: number;
      asset_id: string;
      signature_type: string;
      trigger: string;
      price: string;
      signed_prices: {
        publisher_key: string;
        external_asset_id: string;
        signature_type: string;
        price: string;
        timestamped_signature: {
          signature: {
            r: string;
            s: string;
            v: string;
          };
          timestamp: number;
          msg_hash: string;
        };
      }[];
    };
  };
}

class WebSocketClient {
  private ws: WebSocket;
  private token: string;
  private username: string;
  private password: string;

  constructor(url: string, username: string, password: string) {
    this.token = Buffer.from(`${username}:${password}`, "utf8").toString(
      "base64"
    );
    this.username = username;
    this.password = password;
    this.ws = new WebSocket(url, {
      headers: {
        Authorization: `Basic ${this.token}`,
        "Sec-Websocket-Extensions": "permessage-deflate",
      },
    });

    this.ws.on("open", () => {
      console.log("Connected to the WebSocket server");
      this.subscribeToAssets(["BTCUSD", "ETHUSD"]);
    });

    this.ws.on("message", (data: string) => {
      console.log("Received message:", data);
      this.handleMessage(data);
    });

    this.ws.on("error", (error: Error) => {
      console.log("Error occurred:", error);
    });

    this.ws.on("close", () => {
      console.log("Disconnected from the WebSocket server");
    });
  }

  private subscribeToAssets(assets: string[]) {
    const subscriptionMessage: SubscriptionMessage = {
      type: "subscribe",
      data: assets,
    };
    this.ws.send(JSON.stringify(subscriptionMessage));
  }

  private unsubscribeFromAssets(assets: string[]) {
    const subscriptionMessage: SubscriptionMessage = {
      type: "unsubscribe",
      data: assets,
    };
    this.ws.send(JSON.stringify(subscriptionMessage));
  }

  private handleMessage(data: string) {
    const message: any = JSON.parse(data);
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

const url = "aaa";
const username = "aaa";
const password = "aaa";

const client = new WebSocketClient(url, username, password);

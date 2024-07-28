const net = require("net");
const express = require("express");
const next = require("next");
const { parse } = require("url");
const { WebSocketServer } = require("ws");

const app = express();

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });

nextApp.prepare().then(() => {
    const ws = new WebSocketServer({ noServer: true });

    app.use((req, res) => {
        nextApp.getRequestHandler()(req, res, parse(req.url, true));
    });

    let server;
    const start = () => {
        server = app.listen(3000, "0.0.0.0", () => {
            console.log("Server is running on port 3000");
        });
    };

    const stop = () => {
        server.close();
    };

    process.on("SIGTERM", stop);

    start();

    server.on("upgrade", (req, socket, head) => {
        console.log('Upgrade request received', req.url);
        const { pathname } = parse(req.url || "/", true);

        if (pathname === "/_next/webpack-hmr") {
            nextApp.getUpgradeHandler()(req, socket, head);
        }

        if (pathname === "/api/socket") {
            ws.handleUpgrade(req, socket, head, (socket) => {
                console.log('Client connected to WebSocket server', req.url);

                const params = new URLSearchParams(req.url.split('?')[1]);
                const host = params.get('host');
                const port = params.get('port');

                if (!host || !port) {
                    console.error('Host or port not provided');
                    socket.close();
                    return;
                }

                const vncSocket = new net.Socket();

                vncSocket.connect(port, host, () => {
                    console.log(`Connected to VNC server at ${host}:${port}`);

                    socket.on('message', (data) => {
                        try {
                            vncSocket.write(data);
                        } catch (error) {
                            console.error('Failed to parse message from client', error);
                        }
                    });

                    vncSocket.on('data', (data) => {
                        try {
                            socket.send(data);
                        } catch (error) {
                            console.error('Failed to send message to client', error);
                        }
                    });

                    socket.on('close', () => {
                        console.log('Client disconnected from WebSocket server');
                        vncSocket.end();
                    });
                });

                vncSocket.on('close', () => {
                    console.log('Disconnected from VNC server');
                    socket.close();
                });
            });
        }
    });
});
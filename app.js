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
        const { pathname } = parse(req.url || "/", true);

        if (pathname === "/_next/webpack-hmr")
            nextApp.getUpgradeHandler()(req, socket, head);

        if (pathname === "/api/socket") {
            ws.handleUpgrade(req, socket, head, (socket) => {
                console.debug(' WS client connected to WebSocket server');
                const params = new URLSearchParams(req.url.split('?')[1]);
                const host = params.get('host');
                const port = params.get('port');

                if (!host || !port) {
                    console.error('Host or port not provided');
                    socket.close();
                    return;
                }

                const vncSocket = new net.Socket();

                try {
                    vncSocket.connect(port, host, () => {
                        socket.on('message', (data) => {
                            try {
                                vncSocket.write(data);
                            } catch (error) {
                                console.error(` WS /api/socket failed to send data to VNC server at ${host}:${port}`, error);
                            }
                        });

                        vncSocket.on('data', (data) => {
                            try {
                                socket.send(data);
                            } catch (error) {
                                console.error(` WS /api/socket VNC server at ${host}:${port} failed to send data to client`, error);
                            }
                        });

                        socket.on('close', () => {
                            console.debug(` WS /api/socket client disconnected, closing VNC server at ${host}:${port}`);
                            vncSocket.end();
                        });
                    });

                    vncSocket.on('close', () => {
                        console.debug(` WS /api/socket VNC server at ${host}:${port} disconnected`);
                        socket.close();
                    });
                } catch (error) {
                    console.error(` WS /api/socket failed to connect to VNC server at ${host}:${port}`, error);
                    socket.close();
                }
            });
        }
    });
});
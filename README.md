# VNC Viewer

[![Build and Publish Docker Image](https://github.com/PixNyb/vnc-viewer/actions/workflows/deploy.yml/badge.svg)](https://github.com/PixNyb/vnc-viewer/actions/workflows/deploy.yml)

This is a Dockerised vnc viewer application that can be used to easily connect to and create an overview of multiple containers running VNC servers. (e.g. [pixnyb/dockerised-vscode](https://github.com/PixNyb/dockerised-vscode)). It is based on [Next.JS](https://nextjs.org/) and [noVNC](https://novnc.com) and automatically translates WebSocket connections to TCP socket connections.

## Usage

### Build the Docker image

```bash
docker build -t vnc-viewer .
```

### Run the application

```bash
# Docker
docker run -d -p 3000:3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    pixnyb/vnc-viewer

# Kubernetes
kubectl run vnc-viewer \
    --image=pixnyb/vnc-viewer:latest \
    --restart=Always \
    --port=3000 \
    --overrides='
    {
        "apiVersion": "v1",
        "spec": {
            "containers": [
                {
                    "name": "vnc-viewer",
                    "image": "pixnyb/vnc-viewer:latest",
                    "volumeMounts": [
                        {
                            "name": "docker-sock",
                            "mountPath": "/var/run/docker.sock"
                        }
                    ]
                }
            ],
            "volumes": [
                {
                    "name": "docker-sock",
                    "hostPath": {
                        "path": "/var/run/docker.sock"
                    }
                }
            ]
        }
    }'
```

> [!WARNING]
> The container in itself doesn't have any security measures implemented. It is recommended to run the container in a secure environment. (e.g. behind traefik with authentication middleware such as [pixnyb/authentication-proxy](https://github.com/PixNyb/authentication-proxy))

### Environment variables

The following environment variables can be set to configure the application:

| Variable          | Description                                                                       | Default  |
| ----------------- | --------------------------------------------------------------------------------- | -------- |
| `DISABLE_CREDITS` | Whether the credits should be disabled or not                                     | `false`  |
| `RUNTIME`         | Determines whether the application should be running in docker or kubernetes mode | `docker` |

### Connecting to a VNC server

The application is capable of discovering VNC servers running in other containers. To enable this feature, you need to add the following labels to the container running the VNC server:

```yaml
# Example docker-compose.yml
labels:
  - "vnc-viewer.enable=true"
  - "vnc-viewer.label=My VNC Server" # Optional
  - "vnc-viewer.port=5900" # Optional, defaults to 5900

# Example podmanifests
metadata:
  labels:
    vnc-viewer.enable: "true"
    vnc-viewer.label: "My VNC Server" # Optional
    vnc-viewer.port: "5900" # Optional, defaults to 5900
```

> [!NOTE]
> Docker > The containers must both exist in the same network. Otherwise no connection to the VNC server can be established.

> [!NOTE]
> Docker > The container offers Docker Swarm support. When running in a Docker Swarm, make sure to constrain the service to manager nodes only. Otherwise, the application won't be able to discover the VNC servers.
> ```yaml
> deploy:
>  placement:
>    constraints:
>      - node.role == manager
> ```

> [!NOTE]
> When authentication is necessary to connect to a vnc server, a login form will be displayed. Not all vnc servers accept a username, so the username field is optional.

> [!WARNING]
> The application doesn't currently check if a socket *should* be connected to. The WebSocket connection can be used to connect to any host and port, this makes the application vulnerable to attacks. It is recommended to run the application in a secure environment with an isolated network.

### Connecting to a VNC server manually

This feature currently isn't implemented. The container is designed to be used as an interface for managing other containers running VNC servers.

## Contributing

Contributions are welcome, please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

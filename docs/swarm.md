# Docker Swarm example

This file contains an example of how to deploy the vnc-viewer in a Docker Swarm environment.

## Prerequisites

- A Docker Swarm cluster

## Stack definition

The following is an example of a stack definition for the vnc-viewer:

```yaml
services:
  vnc-viewer:
    image: pixnyb/vnc-viewer
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    deploy:
      constraints:
        - node.role == manager

  vnc-server:
    image: pixnyb/code
    environment:
      - ENABLE_VNC=true
    deploy:
      mode: replicated
      replicas: 1
      labels:
        - "vnc-viewer.enable=true"
        - "vnc-viewer.label=My VNC Server"
```
# Docker Compose example

This directory contains examples of how to deploy the vnc-viewer in a Docker Swarm environment.

## Prerequisites

- Docker compose

## Compose definition

The following is an example of a compose definition for the vnc-viewer:

```yaml
services:
  vnc-viewer:
    image: pixnyb/vnc-viewer
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  vnc-server:
    image: pixnyb/code
    environment:
      - ENABLE_VNC=true
    labels:
      - "vnc-viewer.enable=true"
      - "vnc-viewer.label=My VNC Server"
```
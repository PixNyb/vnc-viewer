import { getHostContainerId } from "@/app/utils/docker-util";
import Dockerode from "dockerode";

const docker = new Dockerode();

export default async function handler(req, res) {
    const hostContainerId = await getHostContainerId();
    const hostContainer = docker.getContainer(hostContainerId);
    const hostContainerInfo = await hostContainer.inspect();
    const hostContainerNetworks = Object.keys(hostContainerInfo.NetworkSettings.Networks);

    try {
        const filters = {
            status: ["running"],
            label: ["vnc-viewer.enabled=true"],
        };

        if (req.query.id) {
            let requestId = req.query.id;
            if (requestId.length > 12)
                requestId = requestId.substring(0, 12);

            filters.id = [requestId];
        }

        const containers = await docker.listContainers({ filters });

        const containerMap = containers.map((container) => {
            const vncViewerLabel = container.Labels["vnc-viewer.label"] || container.Names[0].replace("/", "");
            const vncViewerPort = container.Labels["vnc-viewer.port"] || 5900;

            const containerNetworks = Object.keys(container.NetworkSettings.Networks);
            const sharedNetwork = containerNetworks.find((network) => hostContainerNetworks.includes(network));
            const vncViewerIp = container.NetworkSettings.Networks[sharedNetwork].IPAddress;

            return {
                id: container.Id,
                name: vncViewerLabel,
                image: container.Image,
                status: container.Status,
                ports: container.Ports,
                labels: container.Labels,
                network: container.NetworkSettings,
                host: vncViewerIp,
                port: vncViewerPort,
            };
        });

        if (req.query.id) {
            if (containerMap.length === 0) {
                res.status(404).json({ error: "Container not found." });
                return;
            }

            res.status(200).json(containerMap[0]);
            return;
        }

        res.status(200).json(Object.values(containerMap));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred." });
        return;
    }
}
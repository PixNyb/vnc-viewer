import { getHostContainerId } from "@/app/utils/docker-util";
import Dockerode from "dockerode";

const docker = new Dockerode({ socketPath: "/var/run/docker.sock" });

export default async function handler(req, res) {
    const hostContainerId = await getHostContainerId();
    const hostContainer = docker.getContainer(hostContainerId);
    const hostContainerInfo = await hostContainer.inspect();

    try {
        const filters = {
            label: ["vnc-viewer.enable=true"],
        };

        // Check if Docker is running in Swarm mode
        const info = await docker.info();
        let containers = [];

        if (info.Swarm && info.Swarm.LocalNodeState === 'active') {
            const hostContainerNetworks = Object.values(hostContainerInfo.NetworkSettings.Networks).map(network => network.NetworkID);
            const serviceFilter = {
                ...filters,
            }

            const taskFilter = {
                "desired-state": ["running"],
            }

            if (req.query.id) {
                const [serviceId, taskId] = req.query.id.split(":");
                serviceFilter.id = [serviceId];
                taskFilter.id = [taskId];
            }

            // Swarm mode: list service tasks
            const services = await docker.listServices({ filters: serviceFilter });
            const tasks = {};

            for (const service of services) {
                const serviceTasks = await docker.listTasks({
                    filters: {
                        service: [service.ID],
                        ...taskFilter,
                    }
                });
                tasks[service.ID] = serviceTasks;
            }

            containers = Object.values(tasks).flat().map((task) => {
                const service = services.find((service) => service.ID === task.ServiceID);
                const container = task.Spec.ContainerSpec;
                const vncViewerLabel = service.Spec.Labels["vnc-viewer.label"] || task.ServiceID;
                const vncViewerPort = service.Spec.Labels["vnc-viewer.port"] || 5900;

                const containerNetworks = Object.keys(task.NetworksAttachments);
                const sharedNetwork = containerNetworks.find((network) =>
                    hostContainerNetworks.includes(task.NetworksAttachments[network].Network.ID));
                const vncViewerIp = task.NetworksAttachments[sharedNetwork].Addresses[0].split("/")[0];

                return {
                    id: `${task.ServiceID}:${task.ID}`,
                    name: vncViewerLabel,
                    image: container.Image,
                    status: task.Status.State,
                    labels: service.Spec.Labels,
                    network: task.NetworksAttachments[sharedNetwork],
                    host: vncViewerIp || '',
                    port: vncViewerPort,
                };
            });
        } else {
            const hostContainerNetworks = Object.keys(hostContainerInfo.NetworkSettings.Networks);

            if (req.query.id) {
                let requestId = req.query.id;
                if (requestId.length > 12)
                    requestId = requestId.substring(0, 12);

                filters.id = [requestId];
            }

            // Docker Compose mode: list containers
            let containerRes = await docker.listContainers({
                filters: {
                    ...filters,
                    status: ["running"],
                }
            });

            containers = containerRes.map((container) => {
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
                    labels: container.Labels,
                    network: container.NetworkSettings.Networks[sharedNetwork],
                    host: vncViewerIp,
                    port: vncViewerPort,
                };
            });
        }

        if (req.query.id) {
            if (containers.length === 0) {
                res.status(404).json({ error: "Container not found." });
                return;
            }

            res.status(200).json(containers[0]);
            return;
        }

        res.status(200).json(Object.values(containers));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred." });
        return;
    }
}
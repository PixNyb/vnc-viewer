import Dockerode from "dockerode";

const docker = new Dockerode();

export default async function handler(req, res) {
    try {
        const containers = await docker.listContainers({
            filters: {
                status: ["running"],
                label: ["x11.viewable=true"],
            },
        });

        const containerMap = containers.map((container) => {
            return {
                id: container.Id,
                name: container.Names[0].replace("/", ""),
                image: container.Image,
                status: container.Status,
                ports: container.Ports,
                labels: container.Labels,
                network: container.NetworkSettings,
                // TODO: Make this more resillient by using an ip instead of the container name
                host: container.Names[0].replace("/", ""),
                port: 5900,
            };
        });

        res.status(200).json(Object.values(containerMap));
        // res.status(200).json(containers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred." });
        return;
    }
}
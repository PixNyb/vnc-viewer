import { exec } from "child_process";
import Dockerode from "dockerode";

const isValidId = (id) => {
    const docker = new Dockerode();

    return new Promise((resolve, reject) => {
        docker.getContainer(id).inspect((error, data) => {
            if (error) {
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
};

export async function getHostContainerId() {
    let containerId = await new Promise((resolve, reject) => {
        exec("grep '/var/lib/docker/containers/' /proc/self/mountinfo | awk -F'/' '{print $(6)}'", (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing command: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Command stderr: ${stderr}`);
                return;
            }
            resolve(stdout.trim());
        });
    });
    containerId = containerId.split("\n")[0];

    if (!containerId || !isValidId(containerId)) {
        return await new Promise((resolve, reject) => {
            exec("hostname", (error, stdout, stderr) => {
                if (error) {
                    reject(`Error executing command: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`Command stderr: ${stderr}`);
                    return;
                }
                resolve(stdout.trim());
            });
        });
    }

    return isValidId(containerId) ? containerId : null;
}
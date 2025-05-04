'use client';

import { useEffect, useRef, useState } from "react";
import ContainerCard from "./ContainerCard";

export default function ContainerList() {
    const [containers, setContainers] = useState([]);
    const [runtime, setRuntime] = useState(null);
    const containerMapRef = useRef(new Map());

    useEffect(() => {
        async function fetchRuntime() {
            try {
                const response = await fetch('/api/env');
                const data = await response.json();
                setRuntime(data.runtime);
            } catch (error) {
                console.error(error);
            }
        }

        fetchRuntime();
    }, []);

    useEffect(() => {
        async function fetchContainers() {
            try {
                const response = await fetch(`/api/${runtime}`);
                const data = await response.json();

                const newContainerMap = new Map();
                data.forEach(container => {
                    newContainerMap.set(container.id, container);
                });

                // Check if there are any changes
                let hasChanges = false;
                if (newContainerMap.size !== containerMapRef.current.size) {
                    hasChanges = true;
                } else {
                    for (let [id, container] of newContainerMap) {
                        if (!containerMapRef.current.has(id) || JSON.stringify(containerMapRef.current.get(id)) !== JSON.stringify(container)) {
                            hasChanges = true;
                            break;
                        }
                    }
                }

                if (hasChanges) {
                    containerMapRef.current = newContainerMap;
                    setContainers(Array.from(newContainerMap.values()));
                }
            } catch (error) {
                console.error(error);
            }
        }

        fetchContainers();

        const interval = setInterval(fetchContainers, 5000);
        return () => clearInterval(interval);
    }, [runtime]);

    return (
        <div className="card-holder">
            {containers.length != 0 &&
                containers.map((container) => (
                    <ContainerCard key={container.id} container={container} />
                ))
            }

            {containers.length === 0 &&
                <div>
                    {runtime === "kubernetes" ? (
                        <p>
                            To get started, add the label <code>dev.roelc.vnc-viewer/enable</code> to your Kubernetes pod running a VNC server and ensure it is accessible within the same namespace or network.<br />
                            Optionally, you can specify a custom label and port using <code>dev.roelc.vnc-viewer/label</code> and <code>dev.roelc.vnc-viewer/port</code>.
                        </p>
                    ) : (
                        <p>
                            To get started, add the label <code>vnc-viewer.enable</code> to your container running a VNC server and make sure it exists in the same network as the vnc-viewer container.<br />
                            Optionally, you can specify a custom label and port using <code>vnc-viewer.label</code> and <code>vnc-viewer.port</code>.
                        </p>
                    )}
                    <pre>
                        <code>
                            {runtime === "kubernetes"
                                ? "kubectl label pod my-pod dev.roelc.vnc-viewer/enable=true"
                                : "docker run -d --label vnc-viewer.enable my-container"}
                        </code>
                    </pre>
                    <p>
                        Read the <a href="https://github.com/PixNyb/vnc-viewer/blob/main/README.md">documentation</a> for more information.
                    </p>
                </div>
            }
        </div>
    );
}
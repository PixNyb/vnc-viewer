'use client';

import { useEffect, useState } from "react";
import ContainerCard from "./ContainerCard";

export default function ContainerList() {
    const [containers, setContainers] = useState([]);

    useEffect(() => {
        async function fetchContainers() {
            try {
                const response = await fetch("/api/containers");
                const data = await response.json();
                setContainers(data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchContainers();

        // const interval = setInterval(fetchContainers, 5000);
        // return () => clearInterval(interval);
    }, []);

    return (
        <div className="card-holder">
            {containers.map((container) => (
                <ContainerCard key={container.id} container={container} />
            ))}
        </div>
    );
}
'use client';

import { useEffect, useState } from "react";
import './ContainerCard.css';
import VncViewer from "./VncViewer";

export default function ContainerCard({ container }) {
    const [containerData, setContainerData] = useState(container);

    useEffect(() => {
        setContainerData(container);
    }, [container]);

    if (!containerData)
        return null;

    return (
        <div className="card">
            <VncViewer host={containerData.host} port={containerData.port} options={{
                showExpand: true,
            }} />
            <h3>{containerData.name}</h3>
            <span className="text-small status">{container.image}</span>
        </div>
    );
}
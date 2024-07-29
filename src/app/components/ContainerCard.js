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
            <VncViewer title={containerData.name} host={containerData.host} port={containerData.port} link={{
                path: `/view/${containerData.id}`
            }} />
        </div>
    );
}
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
        <VncViewer
            title={containerData.name}
            host={containerData.host}
            port={containerData.port}
            link={{
                path: `/view/${containerData.id}`
            }}
            options={{
                style: {
                    ["--vnc-clr-ui"]: "var(--clr-accent)",
                    ["--vnc-clr-ui-hover"]: "var(--clr-background)",
                    ["--vnc-clr-background"]: "var(--clr-background)",
                    border: '1rem solid var(--vnc-clr-ui)',
                }
            }}
        />
    );
}
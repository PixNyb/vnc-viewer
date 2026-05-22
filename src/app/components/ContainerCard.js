'use client';

import './ContainerCard.css';
import VncViewer from "./VncViewer";

export default function ContainerCard({ container }) {
    if (!container)
        return null;

    return (
        <VncViewer
            title={container.name}
            host={container.host}
            port={container.port}
            link={{
                path: `/view/${container.id}`
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
import ContainerList from "@/app/components/ContainerList";

export async function getStaticProps() {
    return {
        props: {
            title: "VNC Viewer",
            description: "A VNC viewer for your containers.",
        },
    };
}

export default function Page() {
    return (
        <ContainerList />
    );
}

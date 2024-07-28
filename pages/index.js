import ContainerList from "@/app/components/ContainerList";

export async function getStaticProps() {
    return {
        props: {
            title: "Containers",
            description: "",
        },
    };
}

export default function Page() {
    return (
        <ContainerList />
    );
}

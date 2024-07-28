export async function getStaticProps() {
    return {
        props: {
            title: "Container List",
            description: "A list of containers.",
        },
    };
}

export default function Page() {
    return (
        <span class="text-small">Not found</span>
    );
}

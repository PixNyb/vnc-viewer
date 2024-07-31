export async function getStaticProps() {
    return {
        props: {
            title: "404 - Not found",
            description: "The page you are looking for does not exist.",
        },
    };
}

export default function Custom404() {
    return (
        <span class="text-small">Not found</span>
    );
}

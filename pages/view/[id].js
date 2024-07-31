import VncViewer from '@/app/components/VncViewer';
import Head from 'next/head';

export async function getServerSideProps(context) {
    const { id } = context.params;
    const res = await fetch(`http://localhost:3000/api/containers?id=${id}`);
    const container = await res.json();

    return {
        props: {
            title: `Displaying ${container.name}`,
            description: `Displaying the VNC viewer for ${container.port}.`,
            container,
        },
    };
}

export default function Page({ container }) {
    return (
        <>
            <VncViewer
                title={container.name}
                host={container.host}
                port={container.port}
                link={{
                    path: '/',
                    icon: 'fas fa-arrow-left',
                }}
                options={{
                    showWindowTitle: true,
                    resizeSession: true,
                }}
            />
        </>
    )
}

Page.getLayout = function getLayout(page) {
    return (
        <>
            <Head>
                <title>{page.props.title}</title>
                <meta name='description' content={page.props.description} />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', height: '100vh' }}>
                {page}
            </div>
        </>
    );
}
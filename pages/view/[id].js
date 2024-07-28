import VncViewer from '@/app/components/VncViewer';
import Head from 'next/head';
import Link from 'next/link';

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
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', gap: '1rem', padding: '2rem 2rem 1rem 2rem' }}>
                <Link href='/'>
                    <i className='fas fa-arrow-left'></i>
                </Link>
                <h1 style={{ margin: 0 }}>
                    {container.name}
                </h1>
            </div>
            <VncViewer host={container.host} port={container.port} />
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
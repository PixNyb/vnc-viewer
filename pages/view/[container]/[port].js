import VncViewer from '@/app/components/VncViewer';
import Link from 'next/link';
import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
    return {
        props: {
            title: `Displaying ${context.query.container}`,
            description: `Displaying the VNC viewer for ${context.query.container}.`,
            host: context.query.container,
            port: context.query.port,
        },
    };
}

export default function Page() {
    const router = useRouter()

    return (
        <VncViewer host={router.query.container} port={router.query.port} options={{
            showExpand: false,
            standalone: true,
        }} />
    )
}

Page.getLayout = function getLayout(page) {
    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', height: '100vh' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', gap: '1rem', padding: '2rem' }}>
                    <Link href='/'>
                        <i className='fas fa-arrow-left'></i>
                    </Link>
                    <h1 style={{ margin: 0 }}>
                        {page.props.host}
                    </h1>
                    <span className='text-small'>
                        :{page.props.port}
                    </span>
                </div>
                {page}
            </div>
        </>
    );
}
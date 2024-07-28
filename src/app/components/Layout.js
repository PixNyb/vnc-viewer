import Head from "next/head";
import "../globals.css";

export default function Layout({ children, title = "VNC Viewer", description = "A VNC viewer for your containers." }) {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div className="content">
                    <h1 className="large">
                        {title}
                    </h1>
                    {children}
                </div>
            </main>
        </>
    );
}

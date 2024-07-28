import Layout from "@/app/components/Layout";

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || (
    (page) => <Layout title={pageProps.title} description={pageProps.description}>
      {page}
    </Layout>
  );

  return getLayout(<Component {...pageProps} />);
}

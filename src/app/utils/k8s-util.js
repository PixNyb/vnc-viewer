import * as k8s from '@kubernetes/client-node';

export async function loadKubeConfig() {
    const kc = new k8s.KubeConfig();

    try {
        kc.loadFromDefault();
    } catch (error) {
        console.error('Error loading default K8s config:', error);

        try {
            kc.loadFromCluster();
        } catch (clusterError) {
            console.error('Error loading cluster K8s config:', clusterError);
            throw new Error('Failed to load Kubernetes configuration');
        }
    }

    return kc;
}

export async function getK8sClient() {
    const kc = await loadKubeConfig();
    return kc.makeApiClient(k8s.CoreV1Api);
}

export async function getCurrentNamespace() {
    try {
        const kc = await loadKubeConfig();
        const currentContext = kc.getCurrentContext();
        const contextObject = kc.getContextObject(currentContext);
        return contextObject?.namespace || 'default';
    } catch (error) {
        console.error('Error getting current namespace:', error);
        return 'default';
    }
}
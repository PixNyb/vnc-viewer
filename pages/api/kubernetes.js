import { getK8sClient } from "@/app/utils/k8s-util";

export default async function handler(req, res) {
    try {
        const k8sClient = await getK8sClient();

        const labelSelector = 'vnc-viewer.enable=true';

        let pods = [];
        if (req.query.id) {
            const [namespace, podName] = req.query.id.split(':');

            try {
                const { body } = await k8sClient.readNamespacedPod(podName, namespace);
                if (body.metadata.labels && body.metadata.labels['vnc-viewer.enable'] === 'true') {
                    pods = [body];
                }
            } catch (error) {
                res.status(404).json({ error: "Pod not found." });
                return;
            }
        } else {
            const { body } = await k8sClient.listPodForAllNamespaces(
                undefined, // pretty
                undefined, // allowWatchBookmarks
                undefined, // _continue
                undefined, // fieldSelector
                labelSelector
            );
            pods = body.items;
        }

        pods = pods.filter(pod => pod.status.phase === 'Running');

        const formattedPods = await Promise.all(pods.map(async pod => {
            const container = pod.spec.containers.find(c =>
                c.ports && c.ports.some(p => p.name === 'vnc' || p.containerPort === 5900)
            ) || pod.spec.containers[0];

            let vncPort = parseInt(pod.metadata.labels['vnc-viewer.port'] || '5900');

            let vncHost = pod.status.podIP;

            try {
                const { body: services } = await k8sClient.listNamespacedService(
                    pod.metadata.namespace,
                    undefined, // pretty
                    undefined, // allowWatchBookmarks
                    undefined, // _continue
                    undefined, // fieldSelector
                    undefined, // labelSelector
                    undefined, // limit
                    undefined, // resourceVersion
                    undefined, // resourceVersionMatch
                    undefined, // timeoutSeconds
                    undefined  // watch
                );

                const matchingService = services.items.find(svc => {
                    const selector = svc.spec.selector;
                    if (!selector) return false;

                    return Object.entries(selector).every(([key, value]) =>
                        pod.metadata.labels[key] === value
                    );
                });

                if (matchingService) {
                    vncHost = matchingService.spec.clusterIP;

                    const portMapping = matchingService.spec.ports.find(p =>
                        p.targetPort === vncPort ||
                        p.targetPort === 'vnc' ||
                        p.port === vncPort
                    );

                    if (portMapping)
                        vncPort = portMapping.port;
                }
            } catch (error) {
                console.error('Error getting services:', error);
            }

            return {
                id: `${pod.metadata.namespace}:${pod.metadata.name}`,
                name: pod.metadata.labels['vnc-viewer.label'] || pod.metadata.name,
                image: container.image,
                status: pod.status.phase,
                labels: pod.metadata.labels,
                network: {
                    name: pod.metadata.namespace,
                    IPAddress: vncHost
                },
                host: vncHost,
                port: vncPort,
            };
        }));

        if (req.query.id) {
            if (formattedPods.length === 0) {
                res.status(404).json({ error: "Pod not found." });
                return;
            }

            res.status(200).json(formattedPods[0]);
            return;
        }

        res.status(200).json(formattedPods);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred." });
        return;
    }
}
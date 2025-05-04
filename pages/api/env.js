import getConfig from "next/config"

export default function handler(req, res) {
    const { publicRuntimeConfig } = getConfig()
    res.status(200).json({ runtime: publicRuntimeConfig.runtime })
}
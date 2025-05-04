import getConfig from "next/config"

const { publicRuntimeConfig } = getConfig()

export default function handler(req, res) {
    res.status(200).json({ "status": "ok", "runtime": publicRuntimeConfig.runtime })
}
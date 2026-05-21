export default function handler(req, res) {
    res.status(200).json({ "status": "ok", "runtime": process.env.RUNTIME })
}
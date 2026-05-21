export default function handler(req, res) {
    res.status(200).json({ runtime: process.env.RUNTIME })
}
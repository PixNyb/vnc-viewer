import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig()

export default function Footer() {
    const disableCredits = publicRuntimeConfig.disableCredits === "true";

    return (disableCredits ? null :
        <footer>
            <span>
                Made with <i className="fas fa-heart" style={{ color: "var(--clr-red)" }}></i> by <a href="https://roelc.me" target="_blank" referrerPolicy="no-referrer">pixnyb</a>
            </span>
            <span style={{ display: 'flex', gap: '0.6rem' }}>
                <a href="https://github.com/pixnyb/vnc-viewer" target="_blank" referrerPolicy="no-referrer" style={{ textDecoration: 'none' }}>
                    <i className="fas fa-code" title="View source code"></i>
                </a>
                <a href="https://www.buymeacoffee.com/pixnyb" target="_blank" referrerPolicy="no-referrer" style={{ textDecoration: 'none' }}>
                    < i className="fas fa-coffee" title="Buy me a coffee"></i>
                </a>
            </span>
        </footer>
    );
}
import { faCode, faCoffee } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Footer() {
    const disableCredits = process.env.DISABLE_CREDITS === "true";

    return (disableCredits ? null :
        <footer>
            <span>
                Made with <i className="fas fa-heart" style={{ color: "var(--clr-red)" }}></i> by <a href="https://roelc.me" target="_blank" referrerPolicy="no-referrer">pixnyb</a>
            </span>
            <span style={{ display: 'flex', gap: '0.6rem' }}>
                <a href="https://github.com/pixnyb/vnc-viewer" target="_blank" referrerPolicy="no-referrer" style={{ textDecoration: 'none' }}>
                    <FontAwesomeIcon icon={faCode} aria-label="View source code" />
                </a>
                <a href="https://www.buymeacoffee.com/pixnyb" target="_blank" referrerPolicy="no-referrer" style={{ textDecoration: 'none' }}>
                    <FontAwesomeIcon icon={faCoffee} aria-label="Buy me a coffee" />
                </a>
            </span>
        </footer>
    );
}
export default function Footer() {
    const disableCredits = process.env.NEXT_PUBLIC_DISABLE_CREDITS === "true";

    return (disableCredits ? null :
        <footer>
            <span>
                Made with <i className="fas fa-heart" style={{ color: "var(--clr-red)" }}></i> by <a href="https://roelc.me" target="_blank" referrerPolicy="no-referrer">pixnyb</a>
            </span>
            <span>
                <a href="https://github.com/pixnyb/vnc-viewer" target="_blank" referrerPolicy="no-referrer" style={{ textDecoration: 'none' }}>
                    <i className="fas fa-code" title="View source code"></i>
                </a>&nbsp;
                <a href="https://www.buymeacoffee.com/pixnyb" target="_blank" referrerPolicy="no-referrer" style={{ textDecoration: 'none' }}>
                    < i className="fas fa-coffee" title="Buy me a coffee"></i>
                </a>
            </span>
        </footer>
    );
}
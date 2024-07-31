'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import styles from './VncViewer.module.scss';

const VncViewer = ({ host, port, options, link, title }) => {
    const canvasRef = useRef(null);
    const rfbRef = useRef(null);
    const [RFB, setRFB] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionFailed, setConnectionFailed] = useState(false);
    const [requiresAuthentication, setRequiresAuthentication] = useState(false);
    const [authenticationFailed, setAuthenticationFailed] = useState(false);
    const [windowTitle, setWindowTitle] = useState(false);

    useEffect(() => {
        if (!RFB) return; // Wait until RFB is imported

        if (!canvasRef.current) {
            console.error('Canvas ref is not assigned');
            return;
        }

        const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
        const url = new URL(`${protocol}://${location.host}/api/socket`);
        url.searchParams.append('host', host);
        url.searchParams.append('port', port);

        const rfbOptions = {
            shared: options?.shared || true,
        };

        if (options?.password) {
            rfbOptions.credentials = {
                username: options.username || '',
                password: options.password,
            };
        }

        try {
            rfbRef.current = new RFB(canvasRef.current, url.toString(), rfbOptions);

            rfbRef.current.background = options?.background || 'transparent';
            rfbRef.current.viewOnly = options?.viewOnly || false;
            rfbRef.current.scaleViewport = options?.scaleViewport || true;
            rfbRef.current.resizeSession = options?.resizeSession || false;
            rfbRef.current.showDotCursor = options?.showDotCursor || false;

            rfbRef.current.addEventListener('connect', () => {
                options?.onConnect?.(canvasRef.current);
                setIsConnected(true);
                setConnectionFailed(false);
            });

            rfbRef.current.addEventListener('disconnect', () => {
                options?.onDisconnect?.(canvasRef.current);
                setIsConnected(false);
                setConnectionFailed(true);
                setRequiresAuthentication(false);
            });

            rfbRef.current.addEventListener('credentialsrequired', () => {
                options?.onCredentialsRequired?.(canvasRef.current);
                setRequiresAuthentication(true);
            });

            rfbRef.current.addEventListener('securityfailure', () => {
                options?.onSecurityFailure?.(canvasRef.current);
                setAuthenticationFailed(true);
            });

            rfbRef.current.addEventListener('bell', (event) => {
                options?.onBell?.(canvasRef.current, event);
                canvasRef.current.classList.add('bell');
                setTimeout(() => canvasRef.current.classList.remove('bell'), 300);
            });

            rfbRef.current.addEventListener('clipboard', async (event) => {
                options?.onClipboard?.(canvasRef.current, event);

                if (navigator.clipboard) {
                    try {
                        await navigator.clipboard.writeText(event.detail.text);
                    } catch (error) {
                        console.warn('Could not write to clipboard:', error);
                    }
                } else {
                    console.warn('Clipboard API is not supported, using fallback');

                    try {
                        const textArea = document.createElement('textarea');
                        textArea.value = event.detail.text;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                    } catch (error) {
                        console.warn('Could not write to clipboard:', error);
                    }
                }
            });

            rfbRef.current.addEventListener('desktopname', (event) => {
                options?.onDesktopName?.(canvasRef.current, event);
                setWindowTitle(event.detail.name);
            });

            canvasRef.current.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                options?.onContextMenu?.(canvasRef.current, event);
            });

            rfbRef.current.addEventListener('paste', async (event) => {
                event.preventDefault();
                let text = await navigator.clipboard.readText();

                options?.onPaste?.(canvasRef.current, event);
                console.log('Pasting:', text);
                rfbRef.current.clipboardPasteFrom(text);
            });
        } catch (error) {
            console.error('Failed to create RFB instance:', error);
        }

        return () => {
            if (rfbRef.current && typeof rfbRef.current.disconnect === 'function') {
                rfbRef.current.disconnect();
                rfbRef.current._sock.close();
            }
        };
    }, [RFB, host, port, options]);

    const handleLogin = (username, password) => {
        if (rfbRef.current && typeof rfbRef.current.sendCredentials === 'function') {
            rfbRef.current.sendCredentials({ username, password });
            setRequiresAuthentication(false);
        }
    }

    useEffect(() => {
        const loadRFB = async () => {
            const { default: RFB } = await import('@novnc/novnc/lib/rfb');
            setRFB(() => RFB);
        };

        loadRFB();
    }, []);

    const getStatusIcon = () => {
        if (isConnected)
            return <i className='fas fa-check' style={{ color: 'var(--clr-green)' }}></i>;

        if (requiresAuthentication)
            return <i className='fas fa-arrow-right-to-bracket' style={{ color: 'var(--clr-yellow)' }}></i>;

        if (authenticationFailed)
            return <i className='fas fa-lock' style={{ color: 'var(--clr-red)' }}></i>;

        return <i className='fas fa-times' style={{ color: 'var(--clr-red)' }}></i>;
    };

    return (
        <div
            ref={canvasRef}
            className={`${styles.canvas} ${options?.className || ''}`}
            style={options?.style || {}}
        >
            <div className={styles.overlay}>
                <div className={styles.header}>
                    <div className={styles.group}>
                        {title &&
                            <div className={styles.text}>
                                {title}
                                {windowTitle && options?.showWindowTitle && ` - ${windowTitle}`}
                            </div>
                        }
                    </div>
                    <div className={styles.group}>
                        {link &&
                            <Link
                                href={{
                                    pathname: link.path,
                                }}
                                style={{
                                    margin: '0',
                                    textDecoration: 'none',
                                }}
                                interactive='interactive'>
                                <i className={link.icon || 'fas fa-expand'}></i>
                            </Link>
                        }
                    </div>
                </div>

                {requiresAuthentication &&
                    <form className='login'>
                        <span className='form-group'>
                            <label htmlFor={`username-${host}-${port}`}>Username</label>
                            <input type='text' id={`username-${host}-${port}`} />
                        </span>
                        <span className='form-group'>
                            <label htmlFor={`password-${host}-${port}`}>Password</label>
                            <input type='password' id={`password-${host}-${port}`} />
                        </span>
                        <span className='form-tools'>
                            <button type='submit' onClick={(event) => {
                                event.preventDefault();
                                handleLogin(
                                    document.getElementById(`username-${host}-${port}`).value,
                                    document.getElementById(`password-${host}-${port}`).value
                                );
                            }} className=''>Login</button>
                        </span>
                    </form>
                }

                {!isConnected && !requiresAuthentication && !authenticationFailed &&
                    <span className={styles.icon}>
                        <i className={`${connectionFailed ? 'fas fa-link-slash' : 'fas fa-spinner fa-spin'}`}></i>
                    </span>
                }

                <div className={styles.footer}>
                    <div className={styles.group}>
                        {isConnected &&
                            <i
                                className='fas fa-clipboard'
                                onClick={() => {
                                    const event = new ClipboardEvent('paste', {
                                        dataType: 'text/plain',
                                        bubbles: true,
                                        cancelable: true,
                                    });

                                    rfbRef.current.dispatchEvent(event);
                                }}
                                interactive='interactive'
                                title='Share clipboard'
                                role='button'
                            ></i>
                        }
                    </div>
                    <div className={styles.group}>
                        {getStatusIcon()}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default VncViewer;
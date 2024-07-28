'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import './VncViewer.css';

const VncViewer = ({ host, port, options }) => {
    const canvasRef = useRef(null);
    const rfbRef = useRef(null);
    const [RFB, setRFB] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [requiresAuthentication, setRequiresAuthentication] = useState(false);
    const [authenticationFailed, setAuthenticationFailed] = useState(false);

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
            rfbRef.current.resizeSession = options?.resizeSession || true;
            rfbRef.current.showDotCursor = options?.showDotCursor || false;

            rfbRef.current.addEventListener('connect', () => {
                options?.onConnect?.();
                setIsConnected(true);
            });

            rfbRef.current.addEventListener('disconnect', () => {
                options?.onDisconnect?.();
                setIsConnected(false);
            });

            rfbRef.current.addEventListener('credentialsrequired', () => {
                options?.onCredentialsRequired?.();
                setRequiresAuthentication(true);
            });

            rfbRef.current.addEventListener('securityfailure', () => {
                options?.onSecurityFailure?.();
                setAuthenticationFailed(true);
            });

            rfbRef.current.addEventListener('bell', (event) => {
                options?.onBell?.(event);
                canvasRef.current.classList.add('bell');
                setTimeout(() => canvasRef.current.classList.remove('bell'), 300);
            });

            rfbRef.current.addEventListener('clipboard', (event) => {
                options?.onClipboard?.(event);
            });

            rfbRef.current.addEventListener('desktopname', (event) => {
                options?.onDesktopName?.(event);
            });
        } catch (error) {
            console.error('Failed to create RFB instance:', error);
        }

        return () => {
            if (rfbRef.current && typeof rfbRef.current.disconnect === 'function') {
                rfbRef.current.disconnect();
            }
        };
    }, [RFB, host, port, options]);

    const handleLogin = (username, password) => {
        console.log('Logging in', username, password);
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
            return <i className='fas fa-check green'></i>;

        if (requiresAuthentication)
            return <i className='fas fa-arrow-right-to-bracket yellow'></i>;

        if (authenticationFailed)
            return <i className='fas fa-lock red'></i>;

        return <i className='fas fa-times red'></i>;
    };

    return (
        <div
            ref={canvasRef}
            className={`vnc-canvas ${isConnected ? 'connected' : requiresAuthentication ? 'requires-authentication' : 'disconnected'} ${options?.standalone ? 'standalone' : ''}`}
        >
            {isConnected && options?.showExpand &&
                <div className='expand'>
                    <Link href={{
                        pathname: '/view/[container]/[port]',
                        query: {
                            container: host,
                            port,
                        },
                    }}>
                        <i className='fas fa-expand'></i>
                    </Link>
                </div>
            }

            <div className='status'>
                {getStatusIcon()}
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
                        }}>Login</button>
                    </span>
                </form>
            }
        </div >
    );
};

export default VncViewer;
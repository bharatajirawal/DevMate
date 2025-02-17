import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../context/user.context';
import { useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { getWebContainer } from '../config/webcontainer';
import hljs from 'highlight.js';
import Markdown from 'markdown-to-jsx';

const Project = () => {
    const location = useLocation();
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(new Set());
    const [project, setProject] = useState(location.state.project);
    const [message, setMessage] = useState('');
    const { user } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [fileTree, setFileTree] = useState({});
    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    const [webContainer, setWebContainer] = useState(null);
    const [iframeUrl, setIframeUrl] = useState(null);
    const [runProcess, setRunProcess] = useState(null);
    const [isWebContainerLoading, setIsWebContainerLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Reference for message box auto-scrolling
    const messageBoxRef = useRef(null);

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (messageBoxRef.current) {
            messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
        }
    }, [messages]);

    // Initialize socket and fetch data
    useEffect(() => {
        initializeSocket(project._id);

        setIsWebContainerLoading(true);
        getWebContainer()
            .then((container) => {
                setWebContainer(container);
                console.log('WebContainer started');
            })
            .catch((err) => {
                console.error('Failed to initialize WebContainer:', err);
            })
            .finally(() => {
                setIsWebContainerLoading(false);
            });

        receiveMessage('project-message', (data) => {
            if (data.sender._id === 'ai') {
                const message = JSON.parse(data.message);
                webContainer?.mount(message.fileTree);
                if (message.fileTree) {
                    setFileTree(message.fileTree || {});
                }
                setMessages((prevMessages) => [...prevMessages, data]);
            } else {
                setMessages((prevMessages) => [...prevMessages, data]);
            }
        });

        axios.get(`/projects/get-project/${location.state.project._id}`).then((res) => {
            setProject(res.data.project);
            setFileTree(res.data.project.fileTree || {});
        });

        axios.get('/users/all')
            .then((res) => setUsers(res.data.users))
            .catch((err) => console.log(err));
    }, []);

    // Save file tree to the server
    const saveFileTree = (ft) => {
        axios
            .put('/projects/update-file-tree', {
                projectId: project._id,
                fileTree: ft,
            })
            .then((res) => console.log(res.data))
            .catch((err) => console.log(err));
    };

    // Handle user selection for collaborators
    const handleUserClick = (id) => {
        setSelectedUserId((prevSelectedUserId) => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }
            return newSelectedUserId;
        });
    };

    // Add collaborators to the project
    const addCollaborators = () => {
        if (selectedUserId.size === 0) return;
        
        axios
            .put('/projects/add-user', {
                projectId: project._id, // Fixed: use project._id instead of location.state.project._id
                users: Array.from(selectedUserId),
            })
            .then((res) => {
                console.log(res.data);
                setIsModalOpen(false);
                setProject(res.data.project);
                // Clear selected users after adding
                setSelectedUserId(new Set());
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // Send a message
    const send = () => {
        if (message.trim() === '') return; // Don't send empty messages
        sendMessage('project-message', {
            message,
            sender: user,
        });
        setMessages((prevMessages) => [...prevMessages, { sender: user, message }]);
        setMessage('');
    };

    // Render AI messages with Markdown
    const WriteAiMessage = (message) => {
        try {
            const messageObject = JSON.parse(message);
            return (
                <div className="overflow-auto bg-slate-950 text-white rounded-sm p-4">
                    <Markdown
                        children={messageObject.text}
                        options={{
                            overrides: {
                                code: SyntaxHighlightedCode,
                            },
                        }}
                    />
                </div>
            );
        } catch (error) {
            // Fallback for malformed JSON
            return <p className="p-2">{message}</p>;
        }
    };

    // Syntax highlighting for code blocks
    const SyntaxHighlightedCode = (props) => {
        const ref = useRef(null);

        React.useEffect(() => {
            if (ref.current && props.className?.includes('lang-') && window.hljs) {
                window.hljs.highlightElement(ref.current);
                ref.current.removeAttribute('data-highlighted');
            }
        }, [props.className, props.children]);

        return <code {...props} ref={ref} />;
    };

    // Find user email by ID
    const getUserEmailById = (userId) => {
        const foundUser = users.find(u => u._id === userId);
        return foundUser ? foundUser.email : 'Unknown user';
    };

    return (
        <main className="h-screen w-screen flex">
            {/* Left Section - Chat */}
            <section className="left relative flex flex-col h-screen min-w-96 bg-slate-800">
                <header className="flex justify-between items-center p-3 px-4 w-full bg-slate-700 border-b border-slate-600">
                    <button className="flex gap-2 items-center text-white" onClick={() => setIsModalOpen(true)}>
                        <i className="ri-add-fill mr-1"></i>
                        <p className="text-sm font-medium">Add collaborator</p>
                    </button>
                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="p-2 text-white">
                        <i className="ri-group-fill text-xl"></i>
                    </button>
                </header>

                <div className="conversation-area pt-4 pb-16 flex-grow flex flex-col h-full relative">
                    <div 
                        ref={messageBoxRef}
                        className="message-box p-3 flex-grow flex flex-col gap-4 overflow-auto max-h-full scrollbar-hide"
                    >
                        {messages.map((msg, index) => {
                            const isOwnMessage = msg.sender._id === user._id.toString();
                            return (
                                <div
                                    key={index}
                                    className={`message flex flex-col p-0 rounded-lg shadow-sm
                                        ${isOwnMessage 
                                            ? 'ml-auto bg-blue-600 text-white max-w-xs' 
                                            : msg.sender._id === 'ai'
                                                ? 'mr-auto bg-slate-700 text-white max-w-md' 
                                                : 'mr-auto bg-slate-600 text-white max-w-xs'
                                        }`}
                                >
                                    <small className="opacity-75 text-xs px-4 pt-3 pb-1 font-medium">
                                        {isOwnMessage ? 'Me' : msg.sender.email || 'AI Assistant'}
                                    </small>
                                    <div className="text-sm leading-relaxed px-4 pb-3 pt-1">
                                        {msg.sender._id === 'ai' 
                                            ? WriteAiMessage(msg.message) 
                                            : <p className="whitespace-pre-wrap">{msg.message}</p>
                                        }
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="inputField w-full flex absolute bottom-0 bg-slate-700 p-3 border-t border-slate-600">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            className="p-3 px-4 border-none outline-none flex-grow text-lg rounded-lg shadow-sm bg-slate-600 text-white"
                            type="text"
                            placeholder="Enter message"
                        />
                        <button
                            onClick={send}
                            className="px-5 bg-blue-500 text-white rounded-lg ml-2 shadow-sm hover:bg-blue-600 transition-colors"
                        >
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                </div>
            </section>

            {/* Right Section - Code Editor */}
            <section className="right bg-slate-900 flex-grow h-full flex">
                {/* Explorer */}
                <div className="explorer h-full max-w-64 min-w-52 bg-slate-850 border-r border-slate-700">
                    <div className="file-tree-header p-3 px-4 bg-slate-800 border-b border-slate-700">
                        <h3 className="text-white font-medium">Project Files</h3>
                    </div>
                    <div className="file-tree w-full p-2">
                        {Object.keys(fileTree).map((file, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentFile(file);
                                    setOpenFiles([...new Set([...openFiles, file])]);
                                }}
                                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-800 w-full hover:bg-slate-700 transition-colors text-white rounded mb-1"
                            >
                                <i className="ri-file-code-line text-blue-400"></i>
                                <p className="font-medium text-sm">{file}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code Editor */}
                <div className="code-editor flex flex-col flex-grow h-full shrink bg-slate-850">
                    <div className="top flex justify-between w-full p-2 bg-slate-800 border-b border-slate-700">
                        <div className="files flex overflow-x-auto scrollbar-hide">
                            {openFiles.map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentFile(file)}
                                    className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 rounded-lg mr-2 text-white
                                        ${currentFile === file ? 'bg-slate-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    <i className="ri-file-code-line text-white-400"></i>
                                    <p className="font-medium text-sm whitespace-nowrap">{file}</p>
                                    {currentFile === file && (
                                        <button 
                                            className="ml-2 opacity-60 hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenFiles(openFiles.filter(f => f !== file));
                                                if (currentFile === file) {
                                                    setCurrentFile(openFiles.length > 1 ? openFiles.filter(f => f !== file)[0] : null);
                                                }
                                            }}
                                        >
                                            <i className="ri-close-line"></i>
                                        </button>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="actions flex gap-2">
                            <button
                                onClick={async () => {
                                    if (!webContainer) {
                                        console.error("WebContainer is not initialized yet.");
                                        return;
                                    }
                                    try {
                                        await webContainer.mount(fileTree);
                                        const installProcess = await webContainer.spawn('npm', ['install']);
                                        installProcess.output.pipeTo(
                                            new WritableStream({
                                                write(chunk) {
                                                    console.log(chunk);
                                                },
                                            })
                                        );
                                        if (runProcess) {
                                            runProcess.kill();
                                        }
                                        let tempRunProcess = await webContainer.spawn('npm', ['start']);
                                        tempRunProcess.output.pipeTo(
                                            new WritableStream({
                                                write(chunk) {
                                                    console.log(chunk);
                                                },
                                            })
                                        );
                                        setRunProcess(tempRunProcess);
                                        webContainer.on('server-ready', (port, url) => {
                                            console.log(port, url);
                                            setIframeUrl(url);
                                        });
                                    } catch (err) {
                                        console.error('Failed to run project:', err);
                                    }
                                }}
                                className="p-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                disabled={isWebContainerLoading}
                            >
                                {isWebContainerLoading ? (
                                    <>
                                        <i className="ri-loader-4-line animate-spin"></i> 
                                        <span>Initializing...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-play-fill"></i>
                                        <span>Run</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        {fileTree[currentFile] ? (
                            <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-900 p-4">
                                <pre className="hljs h-full">
                                    <code
                                        className="hljs h-full outline-none text-white"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                            const updatedContent = e.target.innerText;
                                            const ft = {
                                                ...fileTree,
                                                [currentFile]: {
                                                    file: {
                                                        contents: updatedContent,
                                                    },
                                                },
                                            };
                                            setFileTree(ft);
                                            saveFileTree(ft);
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value,
                                        }}
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            paddingBottom: '25rem',
                                            counterSet: 'line-numbering',
                                        }}
                                    />
                                </pre>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full w-full bg-slate-900 text-slate-400">
                                <div className="text-center">
                                    <i className="ri-file-code-line text-6xl mb-4"></i>
                                    <p className="text-lg">Select a file to edit</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Iframe for Web Preview */}
                {iframeUrl && webContainer && (
                    <div className="flex min-w-96 flex-col h-full border-l border-slate-700 bg-slate-900">
                        <div className="address-bar p-2 bg-slate-800 border-b border-slate-700">
                            <input
                                type="text"
                                onChange={(e) => setIframeUrl(e.target.value)}
                                value={iframeUrl}
                                className="w-full p-2 px-4 bg-slate-700 rounded-lg outline-none text-white"
                            />
                        </div>
                        <iframe src={iframeUrl} className="w-full h-full"></iframe>
                    </div>
                )}
            </section>

            {/* Modal for Adding Collaborators */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 p-4 rounded-lg w-96 max-w-full relative">
                        <header className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">Select Users</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-white hover:bg-slate-700 rounded-full">
                                <i className="ri-close-fill text-xl"></i>
                            </button>
                        </header>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 px-4 mb-4 bg-slate-700 rounded-lg outline-none text-white"
                        />
                        <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                            {users
                                .filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((user) => (
                                    <div
                                        key={user._id}
                                        className={`user cursor-pointer hover:bg-slate-700 ${
                                            selectedUserId.has(user._id) ? 'bg-slate-600' : ''
                                        } p-2 flex gap-3 items-center rounded-lg text-white`}
                                        onClick={() => handleUserClick(user._id)}
                                    >
                                        <div className="aspect-square relative rounded-full w-10 h-10 flex items-center justify-center bg-slate-500">
                                            <i className="ri-user-fill text-xl"></i>
                                        </div>
                                        <h1 className="font-medium text-sm">{user.email}</h1>
                                        {selectedUserId.has(user._id) && (
                                            <i className="ri-check-line ml-auto text-green-400"></i>
                                        )}
                                    </div>
                                ))}
                            {users.filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                <div className="text-center text-slate-400 py-4">No users found</div>
                            )}
                        </div>
                        <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addCollaborators}
                                className={`px-4 py-2 ${selectedUserId.size > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-400 cursor-not-allowed'} text-white rounded-lg transition-colors`}
                                disabled={selectedUserId.size === 0}
                            >
                                Add {selectedUserId.size > 0 ? `(${selectedUserId.size})` : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Side Panel for Collaborators */}
            {isSidePanelOpen && (
                <div className="fixed right-0 top-0 h-full w-64 bg-slate-800 border-l border-slate-700 z-40">
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex justify-between items-center">
                            <h3 className="text-white font-semibold">Collaborators</h3>
                            <button onClick={() => setIsSidePanelOpen(false)} className="text-white">
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                    </div>
                    <div className="p-4">
                        {project.users && project.users.map((collaboratorId, index) => (
                            <div key={index} className="flex items-center gap-3 mb-3">
                                <div className="aspect-square relative rounded-full w-8 h-8 flex items-center justify-center bg-slate-600">
                                    <i className="ri-user-fill"></i>
                                </div>
                                <span className="text-white text-sm">{getUserEmailById(collaboratorId)}</span>
                            </div>
                        ))}
                        {(!project.users || project.users.length === 0) && (
                            <p className="text-slate-400 text-sm">No collaborators yet</p>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
};

export default Project;
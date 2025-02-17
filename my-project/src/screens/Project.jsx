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
                try {
                    const message = JSON.parse(data.message);
                    webContainer?.mount(message.fileTree);
                    if (message.fileTree) {
                        setFileTree(message.fileTree || {});
                    }
                    setMessages((prevMessages) => [...prevMessages, data]);
                } catch (error) {
                    console.error('Failed to parse AI message:', error);
                    setMessages((prevMessages) => [...prevMessages, data]);
                }
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
                projectId: project._id,
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
                <div className="overflow-auto bg-slate-900 text-white rounded p-4 max-h-96">
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
            return <p className="p-2 whitespace-pre-wrap">{message}</p>;
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

    // Truncate email for display if too long
    const truncateEmail = (email, maxLength = 20) => {
        if (!email) return 'Unknown';
        if (email.length <= maxLength) return email;
        
        const atIndex = email.indexOf('@');
        if (atIndex === -1) return email.substring(0, maxLength) + '...';
        
        const username = email.substring(0, atIndex);
        const domain = email.substring(atIndex);
        
        if (username.length <= maxLength - 3) return email;
        return username.substring(0, maxLength - 3) + '...' + domain;
    };

    return (
        <main className="h-screen w-screen flex bg-slate-900 overflow-hidden">
            {/* Left Section - Chat */}
            <section className="left relative flex flex-col h-screen min-w-96 bg-slate-800 border-r border-slate-700">
                <header className="flex justify-between items-center p-3 px-4 w-full bg-slate-700 border-b border-slate-600 shadow-sm">
                    <div className="flex items-center">
                        <h1 className="text-white font-semibold mr-4 truncate max-w-40">
                            {project.name || 'Project'}
                        </h1>
                        <button 
                            className="flex gap-2 items-center text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm" 
                            onClick={() => setIsModalOpen(true)}
                        >
                            <i className="ri-user-add-line"></i>
                            <span>Add collaborator</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} 
                        className={`p-2 text-white rounded-lg ${isSidePanelOpen ? 'bg-slate-600' : 'hover:bg-slate-600'} transition-colors`}
                        title="Show collaborators"
                    >
                        <i className="ri-group-line text-lg"></i>
                    </button>
                </header>

                <div className="conversation-area pt-3 pb-16 flex-grow flex flex-col h-full relative">
                    <div 
                        ref={messageBoxRef}
                        className="message-box px-3 py-2 flex-grow flex flex-col gap-4 overflow-auto max-h-full scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
                    >
                        {messages.length === 0 && (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                <div className="text-center p-6 bg-slate-750 rounded-lg max-w-xs">
                                    <i className="ri-chat-3-line text-4xl mb-3"></i>
                                    <p className="text-sm">No messages yet. Start the conversation!</p>
                                </div>
                            </div>
                        )}
                        
                        {messages.map((msg, index) => {
                            const isOwnMessage = msg.sender._id === user._id.toString();
                            return (
                                <div
                                    key={index}
                                    className={`message flex flex-col p-0 rounded-lg shadow-sm
                                        ${isOwnMessage 
                                            ? 'ml-auto bg-blue-600 text-white max-w-xs' 
                                            : msg.sender._id === 'ai'
                                                ? 'mr-auto bg-slate-700 text-white max-w-md w-full' 
                                                : 'mr-auto bg-slate-600 text-white max-w-xs'
                                        }`}
                                >
                                    <div className="px-4 py-2 border-b border-opacity-20 border-slate-500 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {msg.sender._id === 'ai' ? (
                                                <i className="ri-robot-line text-xs"></i>
                                            ) : (
                                                <i className="ri-user-line text-xs"></i>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium truncate">
                                            {isOwnMessage ? 'Me' : msg.sender._id === 'ai' ? 'AI Assistant' : truncateEmail(msg.sender.email)}
                                        </span>
                                    </div>
                                    <div className="text-sm leading-relaxed px-4 py-3">
                                        {msg.sender._id === 'ai' 
                                            ? WriteAiMessage(msg.message) 
                                            : <p className="whitespace-pre-wrap">{msg.message}</p>
                                        }
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="inputField w-full flex absolute bottom-0 bg-slate-700 p-3 border-t border-slate-600 shadow-lg">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    send();
                                }
                            }}
                            className="p-3 px-4 border-none outline-none flex-grow text-base rounded-l-lg bg-slate-600 text-white placeholder-slate-400"
                            type="text"
                            placeholder="Type your message..."
                        />
                        <button
                            onClick={send}
                            className="px-5 bg-blue-600 text-white rounded-r-lg shadow-sm hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                            disabled={message.trim() === ''}
                        >
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                </div>
            </section>

            {/* Right Section - Code Editor */}
            <section className="right bg-slate-900 flex-grow h-full flex">
                {/* Explorer */}
                <div className="explorer h-full w-60 flex-shrink-0 bg-slate-850 border-r border-slate-700 flex flex-col">
                    <div className="file-tree-header p-3 px-4 bg-slate-800 border-b border-slate-700 flex items-center">
                        <i className="ri-folder-line mr-2 text-blue-400"></i>
                        <h3 className="text-white font-medium">Project Files</h3>
                    </div>
                    <div className="file-tree w-full p-2 overflow-y-auto flex-grow">
                        {Object.keys(fileTree).length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <i className="ri-file-list-line text-3xl mb-2"></i>
                                <p className="text-sm">No files yet</p>
                            </div>
                        )}
                        {Object.keys(fileTree).map((file, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentFile(file);
                                    setOpenFiles([...new Set([...openFiles, file])]);
                                }}
                                className={`tree-element cursor-pointer p-2 px-3 flex items-center gap-2 w-full hover:bg-slate-750 transition-colors text-white rounded mb-1 ${currentFile === file ? 'bg-slate-750' : ''}`}
                            >
                                <i className={`${file.endsWith('.js') || file.endsWith('.jsx') 
                                    ? 'ri-javascript-line text-yellow-400' 
                                    : file.endsWith('.css') 
                                    ? 'ri-css3-line text-blue-400'
                                    : file.endsWith('.html')
                                    ? 'ri-html5-line text-orange-400'
                                    : 'ri-file-code-line text-slate-400'
                                }`}></i>
                                <p className="font-medium text-sm truncate">{file}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code Editor */}
                <div className="code-editor flex flex-col flex-grow h-full shrink bg-slate-850 overflow-hidden">
                    <div className="tabs flex justify-between w-full p-2 bg-slate-800 border-b border-slate-700 shadow-sm">
                        <div className="files flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
                            {openFiles.map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentFile(file)}
                                    className={`open-file cursor-pointer p-2 px-4 flex items-center whitespace-nowrap gap-2 rounded-lg mr-2 text-white
                                        ${currentFile === file ? 'bg-slate-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    <i className={`${file.endsWith('.js') || file.endsWith('.jsx') 
                                        ? 'ri-javascript-line text-yellow-400' 
                                        : file.endsWith('.css') 
                                        ? 'ri-css3-line text-blue-400'
                                        : file.endsWith('.html')
                                        ? 'ri-html5-line text-orange-400'
                                        : 'ri-file-code-line text-slate-400'
                                    }`}></i>
                                    <p className="font-medium text-sm">{file}</p>
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
                                className="p-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
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
                                        <span>Run Project</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="bottom flex flex-grow max-w-full shrink overflow-hidden">
                        {fileTree[currentFile] ? (
                            <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-900 p-4 w-full">
                                <pre className="hljs h-full">
                                    <code
                                        className="hljs h-full outline-none text-white font-mono text-sm"
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
                                            __html: hljs.highlight(
                                                currentFile.endsWith('.js') || currentFile.endsWith('.jsx') 
                                                    ? 'javascript' 
                                                    : currentFile.endsWith('.css') 
                                                    ? 'css'
                                                    : currentFile.endsWith('.html')
                                                    ? 'html'
                                                    : 'javascript',
                                                fileTree[currentFile].file.contents
                                            ).value,
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
                                <div className="text-center bg-slate-850 p-8 rounded-xl shadow-lg">
                                    <i className="ri-code-box-line text-6xl mb-4 text-slate-500"></i>
                                    <h3 className="text-xl font-medium text-white mb-2">No File Selected</h3>
                                    <p className="text-sm text-slate-400 max-w-xs">
                                        Select a file from the project explorer or create a new file to start coding
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Iframe for Web Preview */}
                {iframeUrl && webContainer && (
                    <div className="flex min-w-96 w-96 flex-col h-full border-l border-slate-700 bg-white flex-shrink-0">
                        <div className="address-bar p-2 bg-slate-800 border-b border-slate-700 shadow-sm">
                            <div className="relative w-full">
                                <i className="ri-global-line absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                                <input
                                    type="text"
                                    onChange={(e) => setIframeUrl(e.target.value)}
                                    value={iframeUrl}
                                    className="w-full p-2 pl-9 pr-4 bg-slate-700 rounded-lg outline-none text-white text-sm font-mono"
                                />
                                <button 
                                    onClick={() => {
                                        if (iframeUrl) window.open(iframeUrl, '_blank');
                                    }}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                                    title="Open in new tab"
                                >
                                    <i className="ri-external-link-line"></i>
                                </button>
                            </div>
                        </div>
                        <iframe src={iframeUrl} className="w-full h-full bg-white"></iframe>
                    </div>
                )}
            </section>

            {/* Modal for Adding Collaborators */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-slate-800 p-0 rounded-xl w-96 max-w-full shadow-2xl overflow-hidden">
                        <header className="flex justify-between items-center p-4 bg-slate-750 border-b border-slate-700">
                            <h2 className="text-lg font-semibold text-white">Add Collaborators</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <i className="ri-close-line text-xl"></i>
                            </button>
                        </header>
                        
                        <div className="p-4 border-b border-slate-700">
                            <div className="relative">
                                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                                <input
                                    type="text"
                                    placeholder="Search by email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-2 pl-9 pr-4 bg-slate-700 rounded-lg outline-none text-white placeholder-slate-400"
                                />
                            </div>
                        </div>
                        
                        <div className="users-list flex flex-col gap-1 py-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                            {users
                                .filter((user) => 
                                    user.email.toLowerCase().includes(searchQuery.toLowerCase()) && 
                                    user._id !== project.owner && 
                                    !(project.users?.includes(user._id))
                                )
                                .map((user) => (
                                    <div
                                        key={user._id}
                                        className={`user cursor-pointer hover:bg-slate-700 ${
                                            selectedUserId.has(user._id) ? 'bg-slate-700' : ''
                                        } px-4 py-3 flex gap-3 items-center text-white transition-colors`}
                                        onClick={() => handleUserClick(user._id)}
                                    >
                                        <div className="aspect-square relative rounded-full w-9 h-9 flex items-center justify-center bg-slate-600 flex-shrink-0">
                                            <i className="ri-user-fill text-lg"></i>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h1 className="font-medium text-sm truncate">{user.email}</h1>
                                        </div>
                                        {selectedUserId.has(user._id) ? (
                                            <i className="ri-checkbox-circle-fill text-lg text-green-400 flex-shrink-0"></i>
                                        ) : (
                                            <i className="ri-checkbox-blank-circle-line text-lg text-slate-500 flex-shrink-0"></i>
                                        )}
                                    </div>
                                ))}
                            
                            {users.filter((user) => 
                                user.email.toLowerCase().includes(searchQuery.toLowerCase()) && 
                                user._id !== project.owner && 
                                !(project.users?.includes(user._id))
                            ).length === 0 && (
                                <div className="text-center text-slate-400 py-6 px-4">
                                    {searchQuery ? 
                                        <p>No matching users found</p> : 
                                        <p>No users available to add</p>
                                    }
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 bg-slate-750 flex justify-between items-center shadow-lg">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addCollaborators}
                                className={`px-4 py-2 ${
                                    selectedUserId.size > 0 
                                    ? 'bg-blue-600 hover:bg-blue-700' 
                                    : 'bg-blue-500 opacity-50 cursor-not-allowed'
                                } text-white rounded-lg transition-colors flex items-center gap-2`}
                                disabled={selectedUserId.size === 0}
                            >
                                <span>Add</span>
                                {selectedUserId.size > 0 && (
                                    <span className="bg-blue-500 text-xs px-1.5 py-0.5 rounded-full">
                                        {selectedUserId.size}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Side Panel for Collaborators */}
            {isSidePanelOpen && (
                <div className="fixed right-0 top-0 h-full w-72 bg-slate-800 border-l border-slate-700 z-40 shadow-xl flex flex-col">
                    <div className="p-4 border-b border-slate-700 bg-slate-750">
                        <div className="flex justify-between items-center">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <i className="ri-team-line text-blue-400"></i>
                                <span>Project Collaborators</span>
                            </h3>
                            <button 
                                onClick={() => setIsSidePanelOpen(false)} 
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                        {/* Project Owner */}
                        <div className="p-4 border-b border-slate-700">
                            <h4 className="text-xs uppercase text-slate-400 font-medium mb-3">Project Owner</h4>
                            <div className="flex items-center gap-3">
                                <div className="aspect-square relative rounded-full w-10 h-10 flex items-center justify-center bg-blue-600 flex-shrink-0">
                                    <i className="ri-user-fill text-lg"></i>
                                </div>
                                <div className="flex-grow min-w-0">
                                    <span className="text-white text-sm font-medium block truncate">
                                        {getUserEmailById(project.owner)}
                                    </span>
                                    <span className="text-xs text-slate-400">Owner</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Collaborators List */}
                                               {/* Collaborators List */}
                                               <div className="p-4">
                            <h4 className="text-xs uppercase text-slate-400 font-medium mb-3">Collaborators</h4>
                            {project.users && project.users.length > 0 ? (
                                project.users.map((userId) => (
                                    <div key={userId} className="flex items-center gap-3 mb-3">
                                        <div className="aspect-square relative rounded-full w-10 h-10 flex items-center justify-center bg-slate-600 flex-shrink-0">
                                            <i className="ri-user-fill text-lg"></i>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <span className="text-white text-sm font-medium block truncate">
                                                {getUserEmailById(userId)}
                                            </span>
                                            <span className="text-xs text-slate-400">Collaborator</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-400 py-4">
                                    <p>No collaborators added yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Project;
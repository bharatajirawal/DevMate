import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { user } = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projects,   setProjects] = useState([]);

    const navigate = useNavigate();

    const createProject = (e) => {
        e.preventDefault();
        axios.post('/projects/create', { name: projectName })
            .then((res) => {
                console.log(res);
                setIsModalOpen(false);
                setProjectName('');
                axios.get('/projects/all')
                    .then((res) => setProjects(res.data.projects))
                    .catch((err) => console.log(err));
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        axios.get('/projects/all')
            .then((res) => setProjects(res.data.projects))
            .catch((err) => console.log(err));
    }, []);

    return (
        <main className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Your Projects</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center shadow-md"
                    >
                        <i className="ri-add-line text-5xl text-gray-400 group-hover:text-blue-600 mb-4 transition-all"></i>
                        <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-600">Create New Project</span>
                    </button>
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            onClick={() => navigate(`/project`, { state: { project } })}
                            className="p-6 border border-gray-200 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer hover:border-blue-500"
                        >
                            <h2 className="text-2xl font-bold text-blue-600 mb-2">{project.name}</h2>
                            <p className="text-sm text-gray-500">Collaborators: {project.users.length}</p>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md z-50 animate-fadeIn">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Create a New Project</h2>
                        <form onSubmit={createProject} className="space-y-4">
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Project Name"
                                required
                            />
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Home;

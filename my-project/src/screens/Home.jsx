import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const { user } = useContext(UserContext)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ projectName, setProjectName ] = useState(null)
    const [ project, setProject ] = useState([])

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        console.log({ projectName })

        axios.post('/projects/create', {
            name: projectName,
        })
            .then((res) => {
                console.log(res)
                setIsModalOpen(false)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect(() => {
        axios.get('/projects/all').then((res) => {
            setProject(res.data.projects)
        }).catch(err => {
            console.log(err)
        })
    }, [])

    return (
        <main className='p-4 bg-gray-100 min-h-screen'>
            <div className="projects grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="project p-4 border border-slate-300 rounded-md shadow-lg bg-white hover:bg-blue-100 transition-transform transform hover:scale-105">
                    + New Project
                </button>
                {
                    project.map((project) => (
                        <div key={project._id}
                            onClick={() => {
                                navigate(`/project`, { state: { project } })
                            }}
                            className="project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-lg bg-white shadow-md hover:bg-slate-200 transition-all transform hover:scale-105">
                            <h2 className='font-semibold text-lg text-blue-600'>{project.name}</h2>
                            <div className="flex items-center gap-2">
                                <i className="ri-user-line text-gray-500"></i>
                                <p className="text-sm text-gray-600">Collaborators: {project.users.length}</p>
                            </div>
                        </div>
                    ))
                }
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 animate-fadeIn">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Project</h2>
                        <form onSubmit={createProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home

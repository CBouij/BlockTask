import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import TodoListABI from "./TodoList.json";
import "./App.css";

const contractABI = TodoListABI.abi;
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskContent, setTaskContent] = useState("");
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const todoContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        setContract(todoContract);
        try {
          const tasksCount = Number(await todoContract.taskCount());
          let loadedTasks = [];
          for (let i = 1; i <= tasksCount; i++) {
            const task = await todoContract.tasks(i);
            loadedTasks.push({
              id: Number(task.id), 
              content: task.content, 
              completed: task.completed,
              status: Number(task.status) 
            });
          }
          setTasks(loadedTasks);
        } catch (error) {
          console.error("Erreur lors du chargement des tâches :", error);
        }

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      } else {
        alert("Veuillez installer MetaMask.");
      }
    }
    loadBlockchainData();
  }, []);

  const createTask = async (e) => {
    e.preventDefault();
    if (contract && taskContent.trim()) {
      try {
        const tx = await contract.createTask(taskContent);
        await tx.wait();
        const newTask = {
          id: tasks.length + 1,
          content: taskContent,
          completed: false,
          status: 0
        };
        setTasks([...tasks, newTask]);
        setTaskContent("");
      } catch (error) {
        console.error("Erreur lors de la création de la tâche:", error);
      }
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    if (contract) {
      try {
        const tx = await contract.updateTaskStatus(id, Number(newStatus));
        await tx.wait();
        setTasks(tasks.map(task =>
          task.id === id
            ? { ...task, status: newStatus, completed: newStatus === 2 }
            : task
        ));
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
      }
    }
  };

  const toggleTaskCompleted = async (id) => {
    if (contract) {
      try {
        const tx = await contract.toggleTaskCompleted(id);
        await tx.wait();
        setTasks(tasks.map(task => 
          task.id === id 
            ? { 
                ...task, 
                completed: !task.completed,
                status: !task.completed ? 2 : 0
              } 
            : task
        ));
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la tâche:", error);
      }
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const TaskCard = ({ task }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const getStatusLabel = (status) => {
      switch (status) {
        case 0:
          return <span className="badge bg-danger">À faire</span>;
        case 1:
          return <span className="badge bg-warning">En cours</span>;
        case 2:
          return <span className="badge bg-success">Terminé</span>;
        default:
          return null;
      }
    };

    const handleStatusClick = (e) => {
      e.stopPropagation();
      setIsDropdownOpen(!isDropdownOpen);
    };

    const handleClickOutside = (e) => {
      if (!e.target.closest('.task-status')) {
        setIsDropdownOpen(false);
      }
    };

    useEffect(() => {
      if (isDropdownOpen) {
        document.addEventListener('click', handleClickOutside);
        return () => {
          document.removeEventListener('click', handleClickOutside);
        };
      }
    }, [isDropdownOpen]);

    return (
      <div className={`task-card ${task.status === 2 ? 'completed' : ''} ${task.status === 1 ? 'in-progress' : ''}`}>
        <div className="task-content">{task.content}</div>
        <div className="task-status mb-2 dropdown">
          <div onClick={handleStatusClick} style={{ cursor: 'pointer' }}>
            {getStatusLabel(task.status)}
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 1000 }}>
              <button 
                className="dropdown-item" 
                onClick={() => {
                  if(task.status !== 0) {
                    updateTaskStatus(task.id, 0);
                    setIsDropdownOpen(false);
                  } else {
                    setIsDropdownOpen(false);
                  }
                }}
              >
                À faire
              </button>
              <button 
                className="dropdown-item" 
                onClick={() => {
                  //on vérifie d'abord que le statut est différent de celui actuel
                  if(task.status !== 1) {
                    updateTaskStatus(task.id, 1);
                    setIsDropdownOpen(false);
                  } else {
                    setIsDropdownOpen(false);
                  }
                }}
              >
                En cours
              </button>
              <button 
                className="dropdown-item" 
                onClick={() => {
                  if(task.status !== 2) {
                    updateTaskStatus(task.id, 2);
                    setIsDropdownOpen(false);
                  } else {
                    setIsDropdownOpen(false);
                  }
                }}
              >
                Terminé
              </button>
            </div>
          )}
        </div>
        <div className="task-actions">
          <button
            className={`btn btn-sm ${task.completed ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => toggleTaskCompleted(task.id)}
          >
            {task.completed ? '✓' : '○'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div className="card">
      <div className="card-body">
        <h1 className="card-title">Blockchain To-Do List</h1>
        <p className="card-text">Connecté avec : {account}</p>
        <form onSubmit={createTask}>
          <div className="row">
            <div className="col-auto"></div>
            <div className="col">              
              <div className="input-group">
                <div className="form-floating">
                  <input
                    type="text"
                    value={taskContent}
                    onChange={(e) => setTaskContent(e.target.value)}
                    placeholder="Nouvelle tâche..."
                    className="form-control"
                    id="task"
                  />
                  <label htmlFor="task">Nouvelle tâche...</label>
                </div>
                <button onClick={createTask} className="btn btn-success" id="addTask">
                  <i className="fa-solid fa-square-plus"></i>
                  &nbsp;
                  Ajouter
                </button>
              </div>
            </div>
            <div className="col-auto"></div>
          </div>
        </form>
      </div>
    </div>
    <div className="board">
      <div className="column column-todo">
        <div className="column-header">
          <h3 className="text-danger">À faire</h3>
        </div>
        {getTasksByStatus(0).map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="column column-progress">
        <div className="column-header">
          <h3 className="text-warning">En cours</h3>
        </div>
        {getTasksByStatus(1).map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="column column-done">
        <div className="column-header">
          <h3 className="text-success">Terminé</h3>
        </div>
        {getTasksByStatus(2).map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  </div>

  );
}

export default App;
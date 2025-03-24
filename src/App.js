import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import TodoListABI from "./TodoList.json"; // Exportez l'ABI du contrat après compilation


const contractABI = TodoListABI.abi
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Remplacez par l'adresse déployée

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
        const tasksCount = Number(await todoContract.taskCount());

        
        let loadedTasks = [];
        for (let i = 1; i <= tasksCount; i++) {
          const task = await todoContract.tasks(i);
          loadedTasks.push({
            id: Number(task.id), 
            content: task.content, 
            completed: task.completed 
          });
        }
        setTasks(loadedTasks);

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      } else {
        alert("Veuillez installer MetaMask.");
      }
    }
    loadBlockchainData();
  }, []);

  const createTask = async () => {
    if (contract) {
      const tx = await contract.createTask(taskContent);
      await tx.wait();
      setTasks([...tasks, { id: tasks.length + 1, content: taskContent, completed: false }]);
      setTaskContent("");
    }
  };

  const toggleTaskCompleted = async (id) => {
    if (contract) {
      const tx = await contract.toggleTaskCompleted(id);
      await tx.wait();
      setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Blockchain To-Do List</h1>
      <p>Connecté avec : {account}</p>
      <form>
        <div class="input-group">
          <input
            type="text"
            value={taskContent}
            onChange={(e) => setTaskContent(e.target.value)}
            placeholder="Nouvelle tâche..."
            class="form-control"
          />
          <button onClick={createTask} class="btn btn-success">Ajouter</button>
        </div>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
              {task.content}
            </span>
            <button onClick={() => toggleTaskCompleted(task.id)}>
              {task.completed ? "✓" : "○"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

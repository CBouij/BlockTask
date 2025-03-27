// SPDX-License-Identifier: MIT
// Licence qui permet l'utilisation libre du code.
pragma solidity ^0.8.28; // Spécifie la version de Solidity utilisée.

contract TodoList {
    // Enumération représentant les différents statuts d'une tâche.
    enum Status { TODO, PROGRESS, DONE }

    // Structure définissant une tâche.
    struct Task {
        uint id;           // Identifiant unique de la tâche.
        string content;    // Description de la tâche.
        bool completed;    // Indique si la tâche est terminée.
        Status status;     // Statut de la tâche (TODO, PROGRESS, DONE).
    }

    uint public taskCount = 0; // Compteur pour suivre le nombre de tâches créées.
    mapping(uint => Task) public tasks; // Stocke les tâches en utilisant leur ID comme clé.

    // Déclaration des événements pour notifier les changements d'état des tâches.
    event TaskCreated(uint id, string content, bool completed, Status status);
    event TaskStatusUpdated(uint id, Status status);
    event TaskCompleted(uint id, bool completed);

    // Fonction permettant de créer une nouvelle tâche.
    function createTask(string memory _content) public {
        taskCount++; // Incrémente le compteur de tâches.
        tasks[taskCount] = Task(taskCount, _content, false, Status.TODO); // Ajoute la tâche au mapping.
        
        // Émet un événement indiquant qu'une tâche a été créée.
        emit TaskCreated(taskCount, _content, false, Status.TODO);
    }

    // Fonction permettant de mettre à jour le statut d'une tâche.
    function updateTaskStatus(uint _id, Status _status) public {
        require(_id > 0 && _id <= taskCount, "Task does not exist"); // Vérifie que l'ID est valide.
        
        Task storage task = tasks[_id]; // Récupère la tâche correspondante.
        task.status = _status; // Met à jour le statut de la tâche.
        
        // Met automatiquement la tâche en "complétée" si son statut est "DONE".
        if (_status == Status.DONE) {
            task.completed = true;
        } else if (_status == Status.TODO) {
            task.completed = false;
        }

        // Émet un événement pour signaler le changement de statut.
        emit TaskStatusUpdated(_id, _status);
    }

    // Fonction permettant d'inverser l'état d'achèvement d'une tâche.
    function toggleTaskCompleted(uint _id) public {
        require(_id > 0 && _id <= taskCount, "Task does not exist"); // Vérifie que l'ID est valide.

        Task storage task = tasks[_id]; // Récupère la tâche correspondante.
        task.completed = !task.completed; // Inverse l'état de complétion.

        // Met à jour le statut en fonction de l'état complété ou non.
        if (task.completed) {
            task.status = Status.DONE;
        } else {
            task.status = Status.TODO;
        }

        // Émet les événements pour notifier les changements.
        emit TaskCompleted(_id, task.completed);
        emit TaskStatusUpdated(_id, task.status);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TodoList {
    enum Status { TODO, PROGRESS, DONE }

    struct Task {
        uint id;
        string content;
        bool completed;
        Status status;
    }

    uint public taskCount = 0;
    mapping(uint => Task) public tasks;

    event TaskCreated(uint id, string content, bool completed, Status status);
    event TaskStatusUpdated(uint id, Status status);
    event TaskCompleted(uint id, bool completed);

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false, Status.TODO);
        emit TaskCreated(taskCount, _content, false, Status.TODO);
    }

    function updateTaskStatus(uint _id, Status _status) public {
        require(_id > 0 && _id <= taskCount, "Task does not exist");
        Task storage task = tasks[_id];
        task.status = _status;
        if (_status == Status.DONE) {
            task.completed = true;
        } else if (_status == Status.TODO) {
            task.completed = false;
        }
        emit TaskStatusUpdated(_id, _status);
    }

    function toggleTaskCompleted(uint _id) public {
        require(_id > 0 && _id <= taskCount, "Task does not exist");
        Task storage task = tasks[_id];
        task.completed = !task.completed;
        if (task.completed) {
            task.status = Status.DONE;
        } else {
            task.status = Status.TODO;
        }
        emit TaskCompleted(_id, task.completed);
        emit TaskStatusUpdated(_id, task.status);
    }
}
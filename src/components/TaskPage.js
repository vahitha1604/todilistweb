import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './TaskPage.css'; // Import TaskPage-specific styles

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAllTasksModal, setShowAllTasksModal] = useState(false);
  const [progress, setProgress] = useState(0);

  const startTimeRef = useRef();
  const endTimeRef = useRef();
  const navigate = useNavigate(); // Hook for navigation

  const addTask = () => {
    if (input.trim() && startTime && endTime) {
      const newTask = {
        description: input,
        completed: false,
        startTime: startTime,
        endTime: endTime
      };

      setTasks([...tasks, newTask]);
      setInput('');
      setStartTime('');
      setEndTime('');
    }
  };

  const handleTaskCompletion = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);

    if (updatedTasks[index].completed) {
      setShowTaskModal(true);
    }

    const completedTasks = updatedTasks.filter(task => task.completed).length;
    const newProgress = Math.round((completedTasks / updatedTasks.length) * 100);
    setProgress(newProgress);

    if (completedTasks === updatedTasks.length) {
      setShowAllTasksModal(true);
    }
  };

  useEffect(() => {
    if (showTaskModal) {
      const timer = setTimeout(() => setShowTaskModal(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showTaskModal]);

  useEffect(() => {
    if (showAllTasksModal) {
      const timer = setTimeout(() => setShowAllTasksModal(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showAllTasksModal]);

  const handleTimeChange = (e, timeType) => {
    const newTime = e.target.value;

    if (timeType === "start") {
      setStartTime(newTime);
    } else if (timeType === "end") {
      setEndTime(newTime);
    }

    if (timeType === "start") {
      startTimeRef.current.blur();
    } else if (timeType === "end") {
      endTimeRef.current.blur();
    }
  };

  const resetTasks = () => {
    setTasks([]);
    setProgress(0);
    setInput('');
    setStartTime('');
    setEndTime('');
  };

  const handleLogout = () => {
    // Clear the user's session (optional, depending on your implementation)
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");

    // Navigate back to the login page
    navigate("/");
  };

  return (
    <div className="App">
      {/* Progress Bar & Task Completion */}
      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">Task Completion: {progress}%</p>
      </div>

      {/* Task List */}
      <div className="task-list-container">
        <ul className="task-list">
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <li key={index} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskCompletion(index)}
                  />
                  {task.description}
                </label>
                <div className="task-info">
                  <div className="task-time">
                    <span>Start: {task.startTime}</span>
                    <span>End: {task.endTime}</span>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li>No tasks to show</li>
          )}
        </ul>
      </div>

      {/* Input Section */}
      <div className="input-section">
        <div className="input-box">
          <h1 className="input-title">Enter Your Task</h1>
          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you need to do?"
            />

            {/* Time Pickers (From & To aligned in the same line) */}
            <div className="time-container">
              <div className="time-picker">
                <label htmlFor="start-time">From:</label>
                <input
                  ref={startTimeRef}
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => handleTimeChange(e, "start")}
                />
              </div>

              <div className="time-picker">
                <label htmlFor="end-time">To:</label>
                <input
                  ref={endTimeRef}
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => handleTimeChange(e, "end")}
                />
              </div>
            </div>

            <button className="add-btn" onClick={addTask}>Add Task</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showTaskModal && (
        <div className="modal fade-in">
          <div className="modal-content">
            <h2>Almost there!</h2>
            <p>You're doing great, keep going! ✅</p>
          </div>
        </div>
      )}

      {showAllTasksModal && (
        <div className="modal fade-in">
          <div className="modal-content">
            <h2>🎉 Well done!</h2>
            <p>You have completed all your tasks!</p>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="reset-container">
        <button className="reset-btn" onClick={resetTasks}>Reset Tasks</button>
      </div>

      {/* Logout Button */}
      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default TaskPage;

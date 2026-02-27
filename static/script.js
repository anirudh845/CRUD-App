// This means when the full html page is loaded, otherwise before the html page is loaded it will call the function and browser will return null value
document.addEventListener("DOMContentLoaded", () => {
    loadTasks()

    const form = document.querySelector(".form")
    form.addEventListener("submit", addTask)
})

const loadTasks = () => {
    fetch("/tasks")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load tasks")
            }
            return response.json()  // Fixed: Added missing response.json()
        })
        .then(data => {
            const taskContainer = document.querySelector(".tasks")
            taskContainer.innerHTML = ""

            data.forEach(task => {
                // Create task row container (holds entire task row)
                const taskRow = document.createElement("div")
                taskRow.className = "task-row"

                // Create box for task text
                const box = document.createElement("div")
                box.className = "box"

                const heading = document.createElement("h2")
                heading.className = "heading"
                heading.textContent = task.text

                box.appendChild(heading)

                // Create buttons
                const updateButton = document.createElement("button")
                updateButton.className = "btn update"
                updateButton.textContent = "Update"

                const deleteButton = document.createElement("button")
                deleteButton.className = "btn delete"
                deleteButton.textContent = "Delete"

                // Add event listeners
                updateButton.addEventListener("click", () => {
                    updateTask(task.id, task.text, taskRow, box, heading, updateButton, deleteButton)
                })

                deleteButton.addEventListener("click", () => {
                    deleteTask(task.id)
                })

                // Assemble the task row
                taskRow.appendChild(box)
                taskRow.appendChild(updateButton)
                taskRow.appendChild(deleteButton)

                // Add the complete task row to the container
                taskContainer.appendChild(taskRow)
            })
        })
        .catch(error => console.error("Error loading tasks:", error))
}

const addTask = (event) => {
    event.preventDefault();
    const input = document.querySelector(".input")
    const taskText = input.value.trim()

    if (!taskText) return

    fetch("/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: taskText })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to add task")
            }
            return response.json()
        })
        .then(data => {
            console.log("Successfully added task", data)
            input.value = ""
            loadTasks()  // Reload all tasks to show the new one
        })
        .catch(error => console.error("Error adding task:", error))
}

const updateTask = (id, currentText, taskRow, box, heading, updateBtn, deleteBtn) => {
    // Hide view mode elements
    box.style.display = "none"
    updateBtn.style.display = "none"
    deleteBtn.style.display = "none"

    // Create edit mode elements
    const inputField = document.createElement("input")
    inputField.className = "input-field"
    inputField.value = currentText

    const saveBtn = document.createElement("button")
    saveBtn.className = "save-btn"
    saveBtn.textContent = "Save"

    const cancelBtn = document.createElement("button")
    cancelBtn.className = "cancel-btn"
    cancelBtn.textContent = "Cancel"

    // Append edit mode elements to taskRow
    taskRow.appendChild(inputField)
    taskRow.appendChild(saveBtn)
    taskRow.appendChild(cancelBtn)

    // Save button functionality
    saveBtn.addEventListener("click", () => {
        const editedText = inputField.value.trim()  // Fixed: using inputField directly

        if (!editedText) {
            alert("Task cannot be empty!")
            return
        }

        fetch(`/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text: editedText })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to update task")
                }
                return response.json()
            })
            .then(data => {
                console.log("Task updated:", data)

                // Update the heading text with the new value
                heading.textContent = editedText

                // Remove edit mode elements
                taskRow.removeChild(inputField)
                taskRow.removeChild(saveBtn)
                taskRow.removeChild(cancelBtn)

                // Show view mode elements
                box.style.display = "flex"  // or "block" based on your CSS
                updateBtn.style.display = "inline-block"
                deleteBtn.style.display = "inline-block"
                
                // Optional: loadTasks() if you want to ensure sync with server
                // loadTasks()
            })
            .catch(error => {
                console.error("Error updating task:", error)
                alert("Failed to update task. Please try again.")
            })
    })

    // Cancel button functionality (Fixed: Added this)
    cancelBtn.addEventListener("click", () => {
        // Remove edit mode elements
        taskRow.removeChild(inputField)
        taskRow.removeChild(saveBtn)
        taskRow.removeChild(cancelBtn)

        // Show view mode elements
        box.style.display = "flex"
        updateBtn.style.display = "inline-block"
        deleteBtn.style.display = "inline-block"
    })
}

const deleteTask = (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this task?")

    if (!confirmDelete) return

    // Send DELETE request
    fetch(`/tasks/${id}`, {
        method: "DELETE"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to delete task")
            }
            return response.json()
        })
        .then(data => {
            console.log("Task deleted:", data)
            loadTasks()  // Reload all tasks to remove the deleted one
        })
        .catch(error => {
            console.error("Error deleting task:", error)
            alert("Failed to delete task. Please try again.")
        })
}
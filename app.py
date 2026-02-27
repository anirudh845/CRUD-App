from flask import Flask
from flask import render_template
from flask import jsonify
from flask import request
import sqlite3

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('tasks.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL 
        ) 
    ''')
    conn.commit()
    conn.close()
    
init_db()

@app.route("/")
def index():
    return render_template('index.html')


#GET All Tasks
@app.route("/tasks", methods = ["GET"])
def show_task():
    conn = sqlite3.connect('tasks.db')
    conn.row_factory = sqlite3.Row
    tasks = conn.execute('SELECT * FROM tasks').fetchall()
    conn.close()
    
    tasks_list = [{"id": task["id"], "text": task["text"]} for task in tasks]
    return jsonify(tasks_list)

#ADD Task
@app.route("/add", methods = ["POST"])
def add_task():
    data = request.json
    text = data["text"]
    
    conn = sqlite3.connect('tasks.db')
    cursor = conn.execute('INSERT INTO tasks (text) VALUES (?)', (text,))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    new_task = {"id": new_id, "text": text}
    return jsonify(new_task)

#Update Task
@app.route("/tasks/<int:id>", methods=["PUT"])
def update_task(id):
    data = request.json
    new_text = data["text"]
    
    conn = sqlite3.connect('tasks.db')
    conn.execute('UPDATE tasks SET text = ? WHERE id = ?', (new_text, id))
    conn.commit()
    
    if conn.total_changes == 0:
        conn.close()
        return jsonify({"error": "Task not found"}), 404
    
    conn.close()
    return jsonify({"id": id, "text": new_text})

#Delete task
@app.route("/tasks/<int:id>", methods=["DELETE"])
def delete_task(id):
    conn = sqlite3.connect('tasks.db')
    conn.execute('DELETE FROM tasks WHERE id = ?', (id,))
    conn.commit()
    
    if conn.total_changes == 0:
        conn.close()
        return jsonify({"error": "Task not found"}), 404
    
    conn.close()
    return jsonify({"message": "Task deleted"})
        


if __name__ == "__main__":
    app.run(debug=True)
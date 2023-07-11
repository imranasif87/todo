import React, { useState, useEffect } from 'react';
//import firebase from 'firebase/compat/app';
import db from './firebase';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('active');
  const [newTodoText, setNewTodoText] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    const todosRef = db.ref('todos');

    // Fetch all todos once
    todosRef.once('value')
      .then((snapshot) => {
        const todosData = snapshot.val();
        const todosArray = Object.entries(todosData || {}).map(([id, todo]) => ({
          id,
          ...todo,
        }));
        setTodos(todosArray);
      })
      .catch((error) => {
        console.error('Error fetching todos:', error);
      });

    // Listen for new todo additions in real-time
    todosRef.on('child_added', (snapshot) => {
      const newTodo = {
        id: snapshot.key,
        ...snapshot.val(),
      };
      setTodos((prevTodos) => [...prevTodos, newTodo]);
    });

    // Listen for todo updates in real-time
    todosRef.on('child_changed', (snapshot) => {
      const updatedTodo = {
        id: snapshot.key,
        ...snapshot.val(),
      };
      setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)));
    });

    // Listen for todo deletions in real-time
    todosRef.on('child_removed', (snapshot) => {
      const deletedTodoId = snapshot.key;
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== deletedTodoId));
    });

    // Clean up the event listeners when the component unmounts
    return () => {
      todosRef.off('child_added');
      todosRef.off('child_changed');
      todosRef.off('child_removed');
    };
  }, []);

  const handleInputChange = (e) => {
    setNewTodoText(e.target.value);
  };

  function ConfirmationDialog({ item, onDelete, onCancel }) {
    return (
      <div className="confirmation-dialog">
        <p>Are you sure you want to delete this item?</p>
        <button onClick={() => onDelete(item)} className="button-danger">Yes</button>
        <button onClick={onCancel}>No</button>
      </div>
    );
  }

  const handleAddTodo = () => {
    const todosRef = db.ref('todos');
    const newTodoRef = todosRef.push();

    const newTodo = {
      text: newTodoText,
      completed: false,
    };

    newTodoRef.set(newTodo)
      .then(() => {
        setNewTodoText('');
        console.log('Todo added successfully');
      })
      .catch((error) => {
        console.error('Error adding todo:', error);
      });
  };

  const handleToggleComplete = (todoId, completed) => {
    const todosRef = db.ref('todos');

    let isCompleted = completed === true ? false : true;
    todosRef
      .child(todoId)
      .update({ completed: isCompleted })
      .then(() => {
        console.log('Todo marked as completed');
      })
      .catch((error) => {
        console.error('Error marking todo as completed:', error);
      });
  };

  const handleDeleteTodo = (item) => {
    const todosRef = db.ref('todos');

    if (!item.completed) {
      todosRef
        .child(item.id)
        .remove()
        .then(() => {
          console.log('Todo deleted successfully');
          setItemToDelete(null);
        })
        .catch((error) => {
          console.error('Error deleting todo:', error);
        });
    }
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
  };

  // Filter the todos based on the selected filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') {
      return !todo.completed;
    }
    if (filter === 'completed') {
      return todo.completed;
    }
    return true;
  });

  return (
    <div className="App">
      {itemToDelete && (
        <ConfirmationDialog
          item={itemToDelete}
          onDelete={handleDeleteTodo}
          onCancel={() => setItemToDelete(null)}
        />
      )}
      <div className="todo-container">
        <h1>ToDo App</h1>
        <div className="todo-input">
          <input
            type="text"
            placeholder="Enter a new todo"
            value={newTodoText}
            onChange={handleInputChange}
          />
          <button className="button button-primary" onClick={handleAddTodo}>Add</button>
        </div>
        <div className="sort-buttons">
          <button onClick={() => handleFilterChange('all')} className={filter === 'all' ? 'active' : ''}>All ({filteredTodos.length})</button>
          <button onClick={() => handleFilterChange('active')} className={filter === 'active' ? 'active' : ''}>Active ({filteredTodos.filter(x => !x.completed).length}) </button>
          <button onClick={() => handleFilterChange('completed')} className={filter === 'completed' ? 'active' : ''}>Completed ({filteredTodos.filter(x => x.completed).length})</button>
        </div>
        <ol className="todo-list">
          {filteredTodos.map((todo) => (
            <li className={`todo-item ${todo.completed ? 'todo-completed' : ''}`} key={todo.id}>
              <span className="todo-text">{todo.text}</span>
              <div className="todo-actions">
                <button onClick={() => handleToggleComplete(todo.id, todo.completed)}>
                  {todo.completed ? <span>Completed</span> : <span>Is Completed?</span>}
                </button>
                <button onClick={() => setItemToDelete(todo)}>Delete</button>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default App;

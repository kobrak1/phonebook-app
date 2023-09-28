/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import PersonsService from './services/PersonsService'
import './index.css'


// this component displays saved persons
const Persons = ({persons, filtered, removePerson}) => {
  const filteredPersons = persons.filter((person) => 
    person.name.toLowerCase().includes(filtered.toLowerCase()));
  return (
    <ul style={{ listStyleType: 'none' }}>
      {filteredPersons.map(e => 
      <li className='person-list' key={e.id}>
        <div className="person-info">
          <span>
            {e.name}  {e.number}
          </span> 
          <button onClick={() => removePerson(e.id)}>Delete</button>
        </div> <hr />
      </li>
      )}
    </ul>
  )
}

// filter component
const Filter = ({filtered, setFiltered}) => {
  return(
    <div className='filter-name'>
      <p>Filter by name:</p>
      <input 
      type="text"
      value={filtered}
      onChange={(e) => setFiltered(e.target.value)}
      placeholder='Search...'
      />
    </div>
  )
}

// form Component
const PersonForm = ({ addUser, newName, setNewName, newNumber, setNewNumber }) => {
  return (
    <form onSubmit={addUser} className="person-form">
      <div className="form-field">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder='john doe...'
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="number">Number:</label>
        <input
          type="tel"
          id="number"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          minLength={4}
          maxLength={15}
          placeholder="+1-555-555-1234"
          required
        />
      </div>
      <div className="form-btn">
        <button type="submit">Add</button>
      </div>
    </form>
  );
};

// error message component
const Notification = ({errorMessage, successMessage}) => {
  if (errorMessage) {
    return <div className="error">{errorMessage}</div>
  } else if (successMessage) {
    return <div className="success">{successMessage}</div>
  } else {
    return null
  }
}

const App = () => {
  // state hooks
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filtered, setFiltered] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // effect hooks
  useEffect(() => {
    console.log("effect")
    PersonsService.getAll()
    .then(response => {
      console.log("promise fullfilled")
      setPersons(response.data)
    })
  }, [])

  // the function adds a new person to the list and updates the existing object
  const addUser = (event) => {
    event.preventDefault();
    const existingPerson = persons.find((person) => person.name === newName);
  
    if (existingPerson) {
      if (
        window.confirm(
          `${newName} is already in the phonebook. Do you want to update the number?`
        )
      ) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        PersonsService.update(existingPerson.id, updatedPerson).then(() => {
          setPersons(
            persons.map((person) =>
              person.id === existingPerson.id ? updatedPerson : person
            )
          );
          console.log("person's number has been updated");
          setNewName("");
          setNewNumber("");
          setSuccessMessage(`${updatedPerson.name} has been updated successfully`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        })
        .catch((error) => {
          setErrorMessage(`Error while updating ${updatedPerson.name}: ${error.message}`);
          setTimeout(() => {
            setErrorMessage(null);
          }, 3000);
        });
      }
    } else {
      const newPerson = { name: newName, number: newNumber };
      PersonsService.create(newPerson).then((response) => {
        setPersons([...persons, response.data]);
        console.log("person has been added");
        setNewName("");
        setNewNumber("");
        setSuccessMessage(`${newPerson.name} has been added successfully`);
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      })
      .catch((error) => {
        setErrorMessage(`Error while adding ${newPerson.name}: ${error.message}`);
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      });
    }
  };
  
  
  // the function deletes the specified person on the list
  const removePerson = (id) => {
    const removedPerson = persons.find(user => user.id === id)
    if (window.confirm(`Are you sure you want to delete ${removedPerson.name} permanently?`)) {
      PersonsService.remove(id).then(() => {
        setPersons(persons.filter((person) => person.id !== id))
        console.log("person has been removed")
        setSuccessMessage(`${removedPerson.name} has been removed successfully`);
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      })
      .catch((error) => {
        setErrorMessage(`Error while removing ${removedPerson.name}: ${error.message}`);
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
      });
    }
  }
  

  return (
    <div className='general'>
      <div className="main-container">
        <h1>Phonebook</h1>
        <Filter filtered={filtered} setFiltered={setFiltered} />
        <h2>Add New</h2>
        <Notification errorMessage={errorMessage} successMessage={successMessage} />
        <PersonForm 
          addUser={addUser} 
          newName={newName} 
          setNewName={setNewName} 
          newNumber={newNumber} 
          setNewNumber={setNewNumber} />
        <h2>Numbers</h2>
        <Persons 
          persons={persons} 
          filtered={filtered} 
          removePerson={removePerson} /> 
      </div>
    </div>
  )
}

export default App
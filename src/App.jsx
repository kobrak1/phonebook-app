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
      <li key={e.id}>
         {e.name}  {e.number} 
         <button onClick={() => removePerson(e.id)}>Delete</button>
      </li> 
      )}
    </ul>
  )
}

// filter component
const Filter = ({filtered, setFiltered}) => {
  return(
    <div>
      Filter by name:
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
const PersonForm = ({addUser, newName, setNewName, newNumber, setNewNumber}) => {
  return(
    <form onSubmit={addUser}>
      <div>
        Name: <input
          type='text'
          value={newName}
          onChange={(e) => setNewName(e.target.value)}  
          required/>
      </div>
      <div>
        Number: <input 
          type="tel"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          minLength={4}
          maxLength={15}
          required />
      </div>
      <div>
        <button type='submit'>add</button>
      </div>
    </form>
  )
}
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
    <div>
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
  )
}

export default App
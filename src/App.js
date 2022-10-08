import Content from './Content';
import Footer from './Footer';
import Header from './Header';
import { useState, useEffect } from 'react'
import AddItems from './AddItems';
import SearchItems from './SearchItems';
import apiRequest from './apiRequest';

function App() {
  const API_URL = "http://localhost:3500/items"

  // FOR NULL SAFETY WE CHECK localStorage.getItem('shoppingList') if not present then just use empty list
  const [items, setItems] = useState([])
  const [newItems, setNewItems] = useState('')
  const [search, setSearch] = useState('')
  const [fetchError, setFetchError] = useState(null)
  const [isLoading, setLoading] = useState(true)

  // useEffect check for the dependency [items] if items change only then it will execute
  // what it is asked to do.
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw Error('Did not receive expected data')
        const listItems = await response.json()
        setItems(listItems)
        setFetchError(null)
      } catch (err) {
        setFetchError(err.message)
      } finally {
        setLoading(false)
      }
    }

    setTimeout(() => {
      (async () => await fetchItems())()
    }, 2000)

  }, [])

  const handleCheck = async (id) => {
    // First of all we should know what three dots mean, it is used to copy items inside array e.g {id , checked, item} it is called spread
    // It will make new list listItems , but first it check if item.id = id of clicked box , if its equal it will add that item properties only 
    // to the list listItems but it will change checked property to false or true vise versa. Otherwise if terenary condition is false then it 
    // will return the same exact item as it is without changing anything
    const listItems = items.map((item) => item.id === id ? {
      ...item,
      checked: !item.checked
    } : item);
    setItems(listItems)
    const myItem = listItems.filter(item => item.id === id);
    const updateOptions = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ checked: myItem[0].checked })
    };
    const reqUrl = `${API_URL}/${id}`;
    const result = await apiRequest(reqUrl, updateOptions)
    if (result) setFetchError(result);
    
  }
  const handleDelete = async (id) => {
    // Add those items from items list that has different id as during click event, and delete those items whose id is similar
    // It means delete those which i click
    const listItems = items.filter((item) => item.id !== id)
    setItems(listItems)

    const deleteOptions = {method:'DELETE'};
    const reqUrl = `${API_URL}/${id}`;
    const result = await apiRequest(reqUrl, deleteOptions)
    if (result) setFetchError(result);

  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newItems) return
    addItems(newItems)
    setNewItems('');
  }


  const addItems = async (item) => {
    //By subtracting 1 from length we get index of obj in items array, 
    //we get id of that obj, which is last one, and add 1 to it to get our next
    // id for our newItems 
    const id = items.length ? items[items.length - 1].id + 1 : 1;
    // Add new item with id as above defined, checked false, and item props
    const myNewItem = { id, checked: false, item };
    const listItems = [...items, myNewItem]
    setItems(listItems)

    const postOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(myNewItem)
    }
    const result = await apiRequest(API_URL, postOptions)
    // apiRequest returns errMsg so either it will be null or some value, 
    //if it works fine then returns null as we set by default null
    if (result) setFetchError(result)

  }
  return (
    <div className="App">
      <Header title="Groceries" />

      <AddItems
        newItems={newItems}
        setNewItems={setNewItems}
        handleSubmit={handleSubmit}
      />

      <SearchItems
        search={search}
        setSearch={setSearch}
      />
      <main>
        {isLoading && <p>Loading items...</p>}
        {fetchError && <p style={{ color: "red" }}>{`Error: ${fetchError}`}</p>}

        {!fetchError && !isLoading && <Content
          // One of the most important Function to learn , It works for Search
          // HowItWorks : filter out array obj & convert it to lowerCase, and only show it if it
          //has items included in search bar, even if it is single letter taken from middle or last 
          // or where ever
          items={items.filter(item => ((item.item).toLowerCase()).includes(search.toLowerCase()))}
          handleCheck={handleCheck}
          handleDelete={handleDelete}
        />}
      </main>
      <Footer itemLen={items.length} />
    </div>
  );
}

export default App;

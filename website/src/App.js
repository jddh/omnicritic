import logo from './logo.svg';
import './App.css';
import React from 'react';
import ListItem  from './ListItem';
import SearchBox from './SearchBox';
import FilterButtons from './FilterButtons'

// import db from './lib/db/db.js';

function App() {

  const [data, setData] = React.useState([]);
  const [masterData, setMasterData] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');


  function handleSearch(event) {
    const term = event.target.value;
    console.log(event.target.value);

    let filteredData;
    if (term.length)
      filteredData = masterData.filter(i => i.title.match(new RegExp(term,'gi')));
    else filteredData = masterData;
    setData(filteredData);
  }

  async function handleFilters(event) {
    const filter = event.target.id;
    const apiUrl = filter.replace(/filter-(.*?)/gi, '$1');
    const ts = await fetchFromApi(apiUrl);
    setMasterData(ts);
    setData(ts);
  }

  function sortByScore() {
    console.log('sorting...');
    // let sortedData = data.filter(i => i.ratings?.metacritic.rating != 'tbd');
    let sortedData = [...data];
    sortedData = sortedData.sort((a,b) => {
      const ar = parseInt(a.ratings?.metacritic.rating);
      const br = parseInt(b.ratings?.metacritic.rating);
      // console.log([ar,br]);

      // if (!ar && !br) return 1;
      // else if (!ar) return 1;
      // else if (!br) return -1;
      // if (!ar) return 1;
      // if (!br) return -1;
      if (ar > br || ar && !br) return -1;
      if (ar < br || !ar && br) return 1;
      return 0;
    })

    console.log(sortedData);
    setData(sortedData);
  }

  async function fetchFromApi(endpoint) {
    const ts = await fetch('http://localhost:4000/' + endpoint);
    const tsj = await ts.json();
    const data = tsj.map(d => {
      if (d.ratings?.metacritic.rating == 'tbd')
        delete d.ratings.metacritic.rating;
        return d;
    });

    return data;

    // setMasterData(data);
    // setData(data);
  }

  React.useEffect(() => {
    async function getIt() {
      const ts = await fetchFromApi('rated');
      // const tsj = await ts.json();
      setMasterData(ts);
      setData(ts);
    }

    getIt();
  },[]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="App">
      <main>
        <h2>Rated titles</h2>

        <SearchBox searchHandler={handleSearch} />

        <FilterButtons filterHandler={handleFilters}/>

        <table style={{textAlign: 'left'}}>
            <thead>
              <td>Title</td>
              <td onClick={sortByScore}>Rating</td>
            </thead>
            {data.map(title => 
              // <li>{title.title}: {title.ratings.metacritic.rating}</li>
              <ListItem item={title}/>
            )}
          </table>
      </main>
    </div>
  );
}


export default App;
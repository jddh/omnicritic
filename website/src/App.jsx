import * as React from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import {IntlProvider} from 'react-intl'
import { slide as Menu } from 'react-burger-menu';
import authContext from "./Auth/authContext";
import List from './ListView';
import TitleView from "./TitleView";
import SearchResults from "./SearchResults";
import Settings from "./Settings/Settings";
import Watchlist from "./Watchlist/Watchlist";
import Test from './Test';
import Header from "./Header";
import Login from "./Login";
import Logout from "./Logout";
import useSemiPersistentState from "./semiPersistentState";



export default function App() {
  const [langStrings, setLangStrings] = React.useState();

  React.useEffect(() => {
    (async () => {
      const messages = await import('../compiled-lang/dev.json');
      setLangStrings(messages)
    })()
  }, [])

  return (
    <>
      <IntlProvider locale="en" messages={langStrings}>
      {/* Routes nest inside one another. Nested route paths build upon
            parent route paths, and nested route elements render inside
            parent route elements. See the note about <Outlet> below. */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<List />} />
          <Route path="about" element={<About />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="title/:titleid" element={<TitleView />} />
          <Route path="search/:query" element={<SearchResults />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="settings" element={<Settings />} />
          <Route path="test" element={<Test />} />
          <Route path="login" element={<Login />} />
          <Route path="logout" element={<Logout />} />

          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
      </IntlProvider>
    </>
  );
}

function Layout() {
  const [authenticated, setAuthenticated] = useSemiPersistentState('authenticated', false);
  const [token, setToken] = useSemiPersistentState('authToken', '');

  return (
    <authContext.Provider value={{ authenticated, setAuthenticated, token, setToken }}>
    <>
      
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
      <div id="app-container">
      <Menu right customBurgerIcon={<MenuButton />} pageWrapId={"app-container"} outerContainerId={ "root" } width={ '10em' }>
        <Link to="/">Home</Link>
        {!token && 
						<Link to="/login">Login</Link>
					}
          {token && 
					<>
						<Link to="/watchlist">Watchlist</Link>
						<Link to="/settings">Settings</Link>
						<Link to="/logout">Logout</Link>
					</>
          }
			</Menu>
          <Header />
          {/* An <Outlet> renders whatever child route is currently active,
              so you can think about this <Outlet> as a placeholder for
              the child routes we defined above. */}
          <Outlet />
        </div>
    </>
    </authContext.Provider>
  );
}

function MenuButton() {
  return (
    <h3 id="menu-text">Menu</h3>
  )
}

function About() {
  return (
    <div>
      <h2>About</h2>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
    </div>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>401</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
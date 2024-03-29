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
import MainContent from "./Layout/MainContent";
import useSemiPersistentState from "./semiPersistentState";



export default function App() {
  const [langStrings, setLangStrings] = React.useState();

  React.useEffect(() => {
    //TODO 1.1 opt out of looking for lang bundle entirely if !rebrand
    (async () => {
      if (import.meta.env.VITE_REBRAND) {
        const messages = await import('../compiled-lang/rebrand.json');
        setLangStrings(messages)
      }
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

function NoMatch() {
  return (
    <MainContent>
    <div>
      <h2>401</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
    </MainContent>
  );
}
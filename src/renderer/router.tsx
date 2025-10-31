import { createMemoryRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/home';
import Artists from './pages/artists';
import Recommend from './pages/recommend';
import Artist from './pages/artists/Artist';
import ErrorBoundary from './pages/error';
import Playlist from './pages/playlists/Playlist';
import Playlists from './pages/playlists';
import Pure from './pages/pure';
import Search from './pages/search';
import Settings from './pages/settings';
import Profile from './pages/profile';
import ImportPlaylist from './pages/playlists/ImportPlaylist';
import ProtectedRoute from './components/ProtectedRoute';
import PasswordReset from './pages/password-reset';

const router = createMemoryRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/artists',
        element: <Artists />,
      },
      {
        path: '/artists/:name',
        element: <Artist />,
      },
      {
        path: '/recommend',
        element: <Recommend />,
      },
      {
        path: '/playlists',
        element: <Playlists />,
      },
      {
        path: '/playlists/:id',
        element: <Playlist />,
      },
      {
        path: '/pure',
        element: <Pure />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: '/my-playlists/:id',
        element: (
          <ProtectedRoute>
            <Playlist />
          </ProtectedRoute>
        ),
      },
      {
        path: '/import-playlist',
        element: (
          <ProtectedRoute>
            <ImportPlaylist />
          </ProtectedRoute>
        ),
      },
      {
        path: '/password-reset',
        element: <PasswordReset />,
      },
    ],
  },
]);

export default router;

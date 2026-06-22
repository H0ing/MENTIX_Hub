import { Outlet } from 'react-router-dom';

export default function UserLayout() {
  return (
    <div>
      <header>Header placeholder</header>
      <main>
        <Outlet />
      </main>
      <footer>Footer placeholder</footer>
    </div>
  );
}
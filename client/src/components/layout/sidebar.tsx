import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  PizzaIcon, 
  ClipboardList, 
  Users, 
  Settings, 
  ChevronLeft,
  History
} from 'lucide-react';

export default function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '/');
  };

  return (
    <aside className="w-full md:w-64 bg-[#2C5530] text-white p-4 md:min-h-screen">
      <div className="text-xl font-heading font-bold mb-6 pb-4 border-b border-gray-600">
        Admin Dashboard
      </div>
      <nav>
        <ul>
          <li className="mb-2">
            <Link href="/admin">
              <a className={`block py-2 px-4 rounded hover:bg-opacity-20 hover:bg-white transition ${
                isActive('/admin') && location === '/admin' ? 'bg-opacity-20 bg-white' : ''
              }`}>
                <LayoutDashboard className="inline-block mr-2 h-5 w-5" /> Dashboard
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/admin/menu">
              <a className={`block py-2 px-4 rounded hover:bg-opacity-20 hover:bg-white transition ${
                isActive('/admin/menu') ? 'bg-opacity-20 bg-white' : ''
              }`}>
                <PizzaIcon className="inline-block mr-2 h-5 w-5" /> Menu Management
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/admin/orders">
              <a className={`block py-2 px-4 rounded hover:bg-opacity-20 hover:bg-white transition ${
                isActive('/admin/orders') ? 'bg-opacity-20 bg-white' : ''
              }`}>
                <ClipboardList className="inline-block mr-2 h-5 w-5" /> Orders
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/admin/users">
              <a className={`block py-2 px-4 rounded hover:bg-opacity-20 hover:bg-white transition ${
                isActive('/admin/users') ? 'bg-opacity-20 bg-white' : ''
              }`}>
                <Users className="inline-block mr-2 h-5 w-5" /> Users
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/admin/logs">
              <a className={`block py-2 px-4 rounded hover:bg-opacity-20 hover:bg-white transition ${
                isActive('/admin/logs') ? 'bg-opacity-20 bg-white' : ''
              }`}>
                <History className="inline-block mr-2 h-5 w-5" /> Logs de Admin
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/admin/settings">
              <a className={`block py-2 px-4 rounded hover:bg-opacity-20 hover:bg-white transition ${
                isActive('/admin/settings') ? 'bg-opacity-20 bg-white' : ''
              }`}>
                <Settings className="inline-block mr-2 h-5 w-5" /> Settings
              </a>
            </Link>
          </li>
          <li className="mt-8">
            <Link href="/">
              <a className="block py-2 px-4 rounded bg-[#D73C2C] hover:bg-red-700 transition">
                <ChevronLeft className="inline-block mr-2 h-5 w-5" /> Back to Website
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

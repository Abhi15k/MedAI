import { Menu } from '@headlessui/react'
import { useContext } from 'react'
import { AuthContext } from '../contexts/authContext';

export default function DropDown() {
  const { logout } = useContext(AuthContext);
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="outline-0 flex place-items-center">
          <img className='w-9 h-9' src="avatar.png" alt="user avatar" />
        </Menu.Button>
      </div>

      <Menu.Items
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={`block px-4 py-2 text-sm text-blue-950 ${active ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                My Profile
              </a>
            )}
          </Menu.Item>

        </div>
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={`block px-4 py-2 text-sm text-blue-950 ${active ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                Appointments
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={`block px-4 py-2 text-sm text-blue-950 ${active ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                Reminders
              </a>
            )}
          </Menu.Item>
        </div>

        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={logout}
                className={`block text-left w-full px-4 py-2 text-sm text-red-600 ${active ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                Logout
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  )
}
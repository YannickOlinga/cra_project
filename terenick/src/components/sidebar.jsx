import React from 'react';
import './sidebar.css'

function Sidebar() {
  const menuItems = [
    { href: '#', icon: 'icon-[tabler--home]', label: 'Home' },
    { href: '#', icon: 'icon-[tabler--user]', label: 'Account' },
    { href: '#', icon: 'icon-[tabler--message]', label: 'Notifications' },
    { href: '#', icon: 'icon-[tabler--mail]', label: 'Email' },
    { href: '#', icon: 'icon-[tabler--calendar]', label: 'Calendar' },
    { href: '#', icon: 'icon-[tabler--shopping-bag]', label: 'Product' },
    { href: '#', icon: 'icon-[tabler--login]', label: 'Sign In' },
    { href: '#', icon: 'icon-[tabler--logout-2]', label: 'Sign Out' },
  ];

  return (
    <>
      <aside 
        id="collapsible-sidebar" 
        className="overlay [--body-scroll:true] border-base-content/20 overlay-open:translate-x-0 drawer drawer-start sm:overlay-layout-open:translate-x-0 hidden w-64 border-e [--auto-close:sm] [--is-layout-affect:true] [--opened:lg] sm:absolute sm:z-0 sm:flex sm:shadow-none lg:[--overlay-backdrop:false]" 
        role="dialog" 
        tabIndex="-1"
      >
        <div className="drawer-body px-2 pt-4">
          <ul className="menu p-0">
            {menuItems.map((item, index) => (
              <li key={index}>
                <a href={item.href}>
                  <span className={`${item.icon} size-5`}></span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="sm:overlay-layout-open:ps-64 min-h-full bg-base-100 transition-all duration-300">
        {/* Navigation Toggle */}
        <div className="px-2">
          <button 
            type="button" 
            className="btn btn-text btn-square" 
            aria-haspopup="dialog" 
            aria-expanded="false" 
            aria-controls="collapsible-sidebar" 
            data-overlay="#collapsible-sidebar"
          >
            <span className="icon-[tabler--menu-2] size-5"></span>
          </button>
        </div>
        {/* End Navigation Toggle */}
      </div>
    </>
  );
}

export default Sidebar;
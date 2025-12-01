import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

// Public navigation items (for non-logged-in users)
const publicNavigation = [
  { name: "Home", to: "/" },
  { name: "Developer", to: "/developers" },
  { name: "Contact Us", to: "/public-contact" },
  { name: "Placement Dashboard", to: "/placement-dashboard-public" },
  { name: "Alumni", to: "/alumni-2022-public" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const PublicHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-blue-50 text-gray-800 fixed w-full z-20 shadow-md">
      <Disclosure as="nav" className="sticky top-0">
        {({ open }) => (
          <>
            <div className="mx-auto px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="flex-1 flex items-center justify-between">
                  {/* Logo */}
                  <div
                    className="flex items-center hover:cursor-pointer"
                    onClick={() => navigate("/")}
                  >
                    <img
                      className="h-14 w-auto"
                      src="/collageLogo.jpg"
                      alt="CDPC Logo"
                    />
                  </div>

                  {/* Desktop Navigation */}
                  <div className="hidden sm:ml-6 md:block">
                    <div className="flex space-x-4">
                      {publicNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.to}
                          className={classNames(
                            isActive(item.to)
                              ? "bg-blue-200 text-blue-900 font-semibold"
                              : "text-gray-700 hover:bg-blue-100 hover:text-blue-900",
                            "rounded-md px-3 py-2 text-sm font-medium transition-all duration-200"
                          )}
                          aria-current={isActive(item.to) ? "page" : undefined}
                        >
                          {item.name}
                        </Link>
                      ))}
                      
                      {/* Login Button */}
                      <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile menu button */}
                <div className="absolute inset-y-0 right-0 flex items-center md:hidden">
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-blue-100 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 bg-white shadow-lg">
                {publicNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={classNames(
                      isActive(item.to)
                        ? "bg-blue-200 text-blue-900 font-semibold"
                        : "text-gray-700 hover:bg-blue-100 hover:text-blue-900",
                      "block rounded-md px-3 py-2 text-base font-medium transition-all duration-200"
                    )}
                    aria-current={isActive(item.to) ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Login Button */}
                <button
                  onClick={() => navigate("/login")}
                  className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium transition-all duration-200 shadow-md"
                >
                  Login
                </button>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </header>
  );
};

export default PublicHeader;
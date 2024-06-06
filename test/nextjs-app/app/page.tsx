import React from 'react';

const navItems = [
  {
    title: 'PRODUCT',
    links: [
      { name: 'Features', href: '#' },
      { name: 'Pricing', href: '#' },
    ],
  },
  {
    title: 'DEVELOPERS',
    links: [
      { name: 'Builder for Developers', href: '#' },
      { name: 'Developer Docs', href: '#' },
      { name: 'Open Source Projects', href: '#' },
      { name: 'Performance Insights', href: '#' },
    ],
  },
  {
    title: 'INTEGRATIONS',
    links: [
      { name: 'All Integrations', href: '#' },
      { name: 'Shopify', href: '#' },
      { name: 'React', href: '#' },
      { name: 'Angular', href: '#' },
      { name: 'Next.js', href: '#' },
      { name: 'Gatsby', href: '#' },
    ],
  },
  {
    title: 'USE CASES',
    links: [
      { name: 'Landing Pages', href: '#' },
      { name: 'Shopify Storefront', href: '#' },
      { name: 'Headless CMS', href: '#' },
      { name: 'Headless Storefront', href: '#' },
      { name: 'Customer Showcases', href: '#' },
      { name: 'Customer Success Stories', href: '#' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { name: 'User Guides', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Community Forum', href: '#' },
      { name: 'Templates', href: '#' },
      { name: 'Partners', href: '#' },
      { name: 'Submit an Idea', href: '#' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { name: 'About', href: '#' },
      { name: 'Careers', href: '#' },
    ],
  },
];

const Home = () => {
  return (
    <main className="bg-white flex flex-col items-center min-h-screen py-12 font-sans">
      {/* Header Section */}
      <div className="w-full max-w-screen-xl mb-8 px-6 text-center">
        <img
          src="https://placehold.co/150x50"
          alt="logo"
          className="mx-auto mb-4"
        />
        <p className="text-black">
          Visually build and optimize digital experiences on any tech stack. No
          coding required, and developer approved.
        </p>
      </div>

      {/* Divider Line */}
      <div className="w-full border-t border-gray-200 mb-8"></div>

      {/* Main Content Section */}
      <div className="w-full max-w-screen-xl flex flex-col lg:flex-row py-8 px-6">
        {/* Left Section with Buttons */}
        <div className="flex flex-col mb-8 lg:mb-0 mr-0 lg:mr-8 w-full lg:w-auto items-center lg:items-start">
          <button className="bg-orange-500 text-white px-6 py-2 mb-4 rounded-md w-full lg:w-auto">
            Get Started
          </button>
          <button className="text-orange-600 flex items-center w-full lg:w-auto">
            Log in <span className="ml-1">→</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 w-full">
          {navItems.map((section) => (
            <div key={section.title}>
              <h2 className="text-base font-bold text-black mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-700 hover:text-orange-600 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full max-w-screen-xl border-t pt-8 px-6 text-left mt-8">
        <div className="flex justify-center space-x-8 text-xs text-gray-500 mb-8">
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Security
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Privacy Policy
          </a>
          <a href="#" className="text-gray-700 hover:text-gray-900">
            Terms of Service
          </a>
        </div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-gray-500">&copy; 2022 Builder.io, Inc.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-700 hover:text-gray-900">
              <img src="https://placehold.co/16x16" alt="GitHub" />
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900">
              <img src="https://placehold.co/16x16" alt="Twitter" />
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900">
              <img src="https://placehold.co/16x16" alt="LinkedIn" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;

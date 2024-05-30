import React from 'react';

export default function Home() {
return (
  <main className="bg-white min-h-screen py-12 px-8">
    <div className="max-w-screen-xl w-full mx-auto">
      <header className="flex justify-between items-start mb-12">
        <div className="flex items-start">
          <img
            src="https://placehold.co/60x60"
            alt="builder.io logo"
            className="mr-4 w-14 h-14"
          />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">builder.io</h1>
            <p className="text-base text-gray-700 mt-1 max-w-md">
              Visually build and optimize digital experiences on any tech stack. No coding required, and developer approved.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6 mt-4">
          <button className="bg-orange-500 text-white px-8 py-2.5 rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600">
            Get Started
          </button>
          <a href="#" className="text-orange-500 font-semibold hover:underline flex items-center">
            Log in <span className="ml-1">→</span>
          </a>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 text-sm mb-16">
        <div>
          <h2 className="font-bold text-gray-800 mb-4">DEVELOPERS</h2>
          <ul className="list-none p-0">
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Builder for Developers</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Developer Docs</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Open Source Projects</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Performance Insights</a></li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 mb-4">INTEGRATIONS</h2>
          <ul className="list-none p-0">
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">All Integrations</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Shopify</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">React</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Angular</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Next.js</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Gatsby</a></li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 mb-4">RESOURCES</h2>
          <ul className="list-none p-0">
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">User Guides</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Blog</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Community Forum</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Templates</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Partners</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Submit an Idea</a></li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 mb-4">USE CASES</h2>
          <ul className="list-none p-0">
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Landing Pages</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Shopify Storefront</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Headless CMS</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Headless Storefront</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Customer Showcase</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Customer Success Stories</a></li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 mb-4">COMPANY</h2>
          <ul className="list-none p-0">
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">About</a></li>
            <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Careers <span className="ml-2">✍️</span></a></li>
          </ul>
        </div>
      </div>

      <footer className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-gray-300 text-xs">
        <div className="text-gray-600 text-center md:text-left mb-4 md:mb-0">
          <small>© 2022 Builder.io, Inc.</small> |
          <a href="#" className="text-gray-600 hover:underline mx-2">Security</a> |
          <a href="#" className="text-gray-600 hover:underline mx-2">Privacy Policy</a> |
          <a href="#" className="text-gray-600 hover:underline mx-2">Terms of Service</a>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-600 hover:text-gray-800">
            <i className="fab fa-github text-xl"></i>
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-800">
            <i className="fab fa-twitter text-xl"></i>
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-800">
            <i className="fab fa-linkedin text-xl"></i>
          </a>
        </div>
      </footer>
    </div>
  </main>
);
}
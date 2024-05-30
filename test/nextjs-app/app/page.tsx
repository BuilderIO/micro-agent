import React from 'react';

export default function Home() {
  return (
    <main className="bg-white min-h-screen py-12 px-4 sm:px-8">
      <div className="max-w-screen-xl w-full mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F2f3409f4c3e4445d8c394e22f0e60d8d"
              alt="builder.io logo"
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">builder.io</h1>
              <p className="text-gray-500 text-sm max-w-lg">
                Visually build and optimize digital experiences on any tech stack. No coding required, and developer approved.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-[#ff6a00] text-white py-2 px-6 rounded-md text-sm whitespace-nowrap">
              Get Started
            </button>
            <a href="#" className="text-[#ff6a00] text-sm flex items-center">
              Log in <span className="ml-1">→</span>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* ... */}
        </div>

        <footer className="text-xs text-gray-600 border-t border-gray-300 py-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-wrap justify-center space-x-6">
              <span>© 2022 Builder.io, Inc.</span>
              <a href="#" className="hover:text-gray-800 transition duration-300">Security</a>
              <a href="#" className="hover:text-gray-800 transition duration-300">Privacy Policy</a>  
              <a href="#" className="hover:text-gray-800 transition duration-300">Terms of Service</a>
            </div>
            <div className="flex space-x-4">
              <a href="#">
                <img src="https://placehold.co/16x16" alt="GitHub" className="h-4 w-4" />
              </a>
              <a href="#">
                <img src="https://placehold.co/16x16" alt="Twitter" className="h-4 w-4" />
              </a>
              <a href="#">  
                <img src="https://placehold.co/16x16" alt="LinkedIn" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
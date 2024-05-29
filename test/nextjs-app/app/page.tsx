import React from 'react';

export default function Home() {
return (
  <main className="container mx-auto p-8 bg-white font-sans">
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F2aec5bf62b344aed869e7521f74390ce%2Fe6d6e510f49645d08d470d7399142594"
          alt="logo"
          className="mr-2"
          style={{ width: "40px", height: "auto" }}
        />
        <div className="text-2xl font-semibold">builder.io</div>
      </div>
      <nav className="flex gap-4 text-gray-500">
        <a href="#">Product</a>
        <a href="#">Use Cases</a>
        <a href="#">Developers</a>
        <a href="#">Pricing</a>
        <a href="#">Resources</a>
        <a href="#">Company</a>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-full">Get Started</button>
      </nav>
    </header>

    <section className="text-center mt-12">
      <div className="flex justify-center gap-4 mb-4 items-center">
        <span className="text-gray-700 font-bold">For Business Users</span>
        <span className="bg-gray-300 rounded-full w-16 h-8 flex items-center justify-between px-1 relative">
          <span className="bg-orange-500 rounded-full w-7 h-7 transform translate-x-1"></span>
        </span>
        <span className="text-gray-700 font-bold">For Developers</span>
      </div>

      <h1 className="text-5xl font-bold leading-tight mb-4">
        Drag and drop
        <span className="inline-block mx-1 px-1 border-2 border-orange-400">
          <span className="inline-block">↔</span>
        </span>
        your way to stunning, fast experiences
      </h1>
      
      <div className="flex justify-center items-center mb-4">
        <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">😊</span>
      </div>

      <p className="text-gray-700 text-lg max-w-3xl mx-auto leading-relaxed">
        Coding is too complex. Templates are not enough. Collaboration holds you back. Builder.io lets you compose stunning web and mobile experiences with simple drag-and-drop components. Testing, launching, and iterating rich digital experiences only take minutes. Which means, you can do what you do best — in less time, with more power.
      </p>

      <div className="flex justify-center gap-4 mt-6">
        <button className="bg-orange-500 text-white px-6 py-3 rounded">Try for free</button>
        <button className="bg-black text-white px-6 py-3 rounded">Let's chat</button>
      </div>
    </section>

    <section className="mt-16 relative">
      <div className="relative">
        <img
          src="https://placehold.co/800x400"
          alt="Design preview"
          className="rounded-lg shadow-lg w-full max-h-96 object-cover"
        />
        <img
          src="https://placehold.co/150x150"
          alt="UI elements"
          className="absolute top-4 left-4 w-24 h-24 object-cover"
        />

        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-semibold">Designer User</span>
            </div>
            <div className="bg-gray-200 p-2 rounded mt-1">
              <h3 className="font-bold text-sm">NEW COLLECTION SUMMER 2022</h3>
              <button className="bg-black text-white px-2 py-1 rounded mt-1 text-sm">Shop now</button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-semibold">Business User</span>
            </div>
            <div className="bg-gray-200 p-2 rounded mt-1 text-center">
              <img
                src="https://placehold.co/150x150"
                alt="Image upload preview"
                className="rounded"
              />
              <span className="block mt-1 text-sm">Choose Photo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
);
}
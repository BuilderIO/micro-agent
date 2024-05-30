import React from 'react';

const Home: React.FC = () => {
return (
  <main className="bg-white flex flex-col items-start min-h-screen p-12">
    <div className="flex md:items-start md:justify-between md:space-x-6">
      <div className="flex flex-col items-start">
        <h1 className="text-5xl font-extrabold mb-4">Optimize</h1>
        <h2 className="text-2xl font-medium mb-2">Design responsively</h2>
        <p className="text-gray-800 text-lg mb-4 max-w-md">
          Easily preview and adjust your content and layouts across desktop, tablet, and mobile 
          devices until it is <span className="font-bold">just right</span>, and even 
          <span className="font-bold">customize your breakpoints</span>.{' '}
          <a href="#" className="text-blue-500 hover:text-blue-700">Learn more.</a>
        </p>
        
        <h2 className="text-2xl font-medium mb-2">Asset management</h2>
        <p className="text-gray-800 text-lg mb-4 max-w-md">
          You can now organize and manage all of your digital assets – all image and video formats – 
          to make you and your team more productive.{' '}
          <a href="#" className="text-blue-500 hover:text-blue-700">Learn more.</a>
        </p>

        <hr className="my-6 w-full border-gray-300" />
        
        <h2 className="text-2xl font-medium mb-2">Animations</h2>
        <p className="text-gray-800 text-lg mb-6 max-w-md">
          Control exactly what your team can drag and drop. Turn on components-only mode, enable 
          full bespoke creation, or anything in between.
        </p>
      </div>
      
      <div className="flex items-center justify-center pt-16 md:pt-0">
        <img src="https://placehold.co/600x400" alt="Design preview" className="w-80 h-64 rounded-lg shadow-lg border border-gray-200" />
      </div>
    </div>

    <div className="absolute top-0 right-0 h-full p-4 bg-gray-100 shadow-lg border border-gray-300 rounded-md flex flex-col items-center">
        <div className="bg-purple-500 p-3 mb-4 rounded-full">
          <svg className="w-6 h-6 text-white" fill="currentColor"></svg>
        </div>
        <div className="space-y-3">
          <div className="bg-gray-200 p-2 rounded"></div>
          <div className="bg-gray-200 p-2 rounded"></div>
          <div className="bg-gray-200 p-2 rounded"></div>
        </div>
        <div className="mt-4 cursor-pointer">
          <svg className="w-6 h-6" fill="currentColor"></svg>
        </div>
    </div>
  </main>
);
};

export default Home;
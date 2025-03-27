// pages/index.js
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout'; // Import the Layout component

const IndexPage = () => {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Administrator Portal */}
          <div className="bg-white p-8 rounded shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Administrator Portal
            </h2>
            <p className="text-gray-600 mb-4">
              Access for system administrators.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => router.push('/admin/login')}
            >
              Login
            </button>
          </div>

          {/* Grantee Portal */}
          <div className="bg-white p-8 rounded shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Grantee Portal
            </h2>
            <p className="text-gray-600 mb-4">
              Access for organizations receiving grants.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => router.push('/grantee/login')}
            >
              Login
            </button>
          </div>

          {/* Citizen Portal */}
          <div className="bg-white p-8 rounded shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Citizen Portal
            </h2>
            <p className="text-gray-600 mb-4">
              Access for citizens to government services.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => router.push('/citizen/login')}
            >
              Login
            </button>
          </div>

          {/* Site Manager Portal */}
          <div className="bg-white p-8 rounded shadow-md text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Site Manager Portal
            </h2>
            <p className="text-gray-600 mb-4">
              Access for site managers to manage content.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => router.push('/manager/login')}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;
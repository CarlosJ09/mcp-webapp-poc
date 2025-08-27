'use client';

import { useState, useEffect } from 'react';
import { mcpClient, useMCP, MCPTool, MCPResource } from '../lib/mcp-client';

export default function Home() {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [resources, setResources] = useState<MCPResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tool demo state
  const [addResult, setAddResult] = useState<string | null>(null);
  const [num1, setNum1] = useState<number>(5);
  const [num2, setNum2] = useState<number>(3);
  
  // Resource demo state
  const [userData, setUserData] = useState<any>(null);
  const [postsData, setPostsData] = useState<any>(null);
  const [userId, setUserId] = useState<number>(1);

  // Initialize MCP connection
  useEffect(() => {
    const initMCP = async () => {
      setLoading(true);
      const { data, error } = await useMCP(async () => {
        return await mcpClient.initialize();
      });
      
      if (data) {
        setTools(data.tools);
        setResources(data.resources);
        setError(null);
      } else {
        setError(error);
      }
      setLoading(false);
    };

    initMCP();

    // Cleanup on unmount
    return () => {
      mcpClient.disconnect();
    };
  }, []);

  const handleAddNumbers = async () => {
    const { data, error } = await useMCP(async () => {
      return await mcpClient.callTool('add', { a: num1, b: num2 });
    });
    
    if (data) {
      setAddResult(data.content?.[0]?.text || JSON.stringify(data));
    } else {
      setAddResult(`Error: ${error}`);
    }
  };

  const handleFetchUser = async () => {
    setUserData('Loading...');
    const { data, error } = await useMCP(async () => {
      return await mcpClient.readResource(`user://${userId}`);
    });
    
    if (data) {
      const userContent = data.contents?.[0]?.text;
      try {
        setUserData(JSON.parse(userContent));
      } catch {
        setUserData(userContent);
      }
    } else {
      setUserData(`Error: ${error}`);
    }
  };

  const handleFetchPosts = async () => {
    setPostsData('Loading...');
    const { data, error } = await useMCP(async () => {
      return await mcpClient.readResource('posts://list');
    });
    
    if (data) {
      const postsContent = data.contents?.[0]?.text;
      try {
        setPostsData(JSON.parse(postsContent));
      } catch {
        setPostsData(postsContent);
      }
    } else {
      setPostsData(`Error: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Connecting to MCP Server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🔗 MCP Frontend Demo
        </h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-start">
              <div>
                <strong>Connection Error:</strong> {error}
                <br />
                <small>Make sure your MCP server is running on http://localhost:3000/mcp</small>
              </div>
              <button
                onClick={async () => {
                  mcpClient.clearSession();
                  setError(null);
                  setLoading(true);
                  const { data, error } = await useMCP(async () => {
                    return await mcpClient.initialize();
                  });
                  
                  if (data) {
                    setTools(data.tools);
                    setResources(data.resources);
                    setError(null);
                  } else {
                    setError(error);
                  }
                  setLoading(false);
                }}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            ✅ Connected to MCP Server
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tools Demo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔧 Available Tools</h2>
            <div className="space-y-4">
              {tools.map((tool, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium">{tool.name}</h3>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </div>
              ))}
              
              {/* Addition Tool Demo */}
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-3">Try the Addition Tool:</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={num1}
                    onChange={(e) => setNum1(Number(e.target.value))}
                    className="w-20 p-2 border rounded"
                  />
                  <span className="p-2">+</span>
                  <input
                    type="number"
                    value={num2}
                    onChange={(e) => setNum2(Number(e.target.value))}
                    className="w-20 p-2 border rounded"
                  />
                  <button
                    onClick={handleAddNumbers}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Calculate
                  </button>
                </div>
                {addResult && (
                  <div className="p-2 bg-white border rounded">
                    Result: <strong>{addResult}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resources Demo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Available Resources</h2>
            <div className="space-y-4">
              {resources.map((resource, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium">{resource.name}</h3>
                  <p className="text-xs text-gray-500">{resource.uri}</p>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                </div>
              ))}
              
              {/* User Resource Demo */}
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-3">Fetch User Data:</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(Number(e.target.value))}
                    min="1"
                    max="10"
                    className="w-20 p-2 border rounded"
                  />
                  <button
                    onClick={handleFetchUser}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Fetch User
                  </button>
                </div>
                {userData && (
                  <div className="p-2 bg-white border rounded text-xs max-h-32 overflow-y-auto">
                    <pre>{typeof userData === 'string' ? userData : JSON.stringify(userData, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Posts Resource Demo */}
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-3">Fetch Posts:</h4>
                <button
                  onClick={handleFetchPosts}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-3"
                >
                  Fetch Recent Posts
                </button>
                {postsData && (
                  <div className="p-2 bg-white border rounded text-xs max-h-32 overflow-y-auto">
                    <pre>{typeof postsData === 'string' ? postsData : JSON.stringify(postsData, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
          <h3 className="font-semibold mb-2">⚠️ Important Notes:</h3>
          <ul className="text-sm space-y-1">
            <li>• MCP is designed for AI models, not web frontends</li>
            <li>• This demo shows it's technically possible but not recommended for production</li>
            <li>• Consider creating a dedicated REST API instead</li>
            <li>• CORS issues may occur in production environments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

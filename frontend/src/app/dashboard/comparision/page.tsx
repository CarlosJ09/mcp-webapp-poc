export default function ComparisonPage() {

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Method Comparison</h1>
        <p className="mt-2 text-gray-600">
          Compare different approaches for data fetching and API integration.
        </p>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Protocol Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  REST API
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MCP Protocol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MCP + Logic
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Data Structure
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Flexible JSON/XML
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Structured schemas
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Enforced schemas
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Type Safety
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Limited
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Strong
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Very Strong
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Extensibility
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Manual
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Built-in
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Advanced
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Learning Curve
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Low
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Medium
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  High
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

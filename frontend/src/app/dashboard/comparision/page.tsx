export default function ComparisonPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Protocol Comparison for Frontend Data Fetching
        </h1>
        <p className="mt-2 text-gray-600">
          Comparative analysis of REST API vs MCP Protocol approaches for
          frontend applications.
        </p>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Technical Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  REST API Directo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MCP + Servicio Externo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MCP con Lógica Integrada
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Performance
                </td>
                <td className="px-6 py-4 text-sm text-green-600 font-medium">
                  Óptimo
                </td>
                <td className="px-6 py-4 text-sm text-red-600">
                  Pobre (doble latencia)
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">Bueno</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Network Hops
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">1 hop</td>
                <td className="px-6 py-4 text-sm text-gray-500">2 hops</td>
                <td className="px-6 py-4 text-sm text-gray-500">1 hop</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Caching
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  Excelente (HTTP, CDN, Browser)
                </td>
                <td className="px-6 py-4 text-sm text-red-600">
                  Limitado/Complejo
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">
                  Custom implementation
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Data Structure
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  JSON/XML flexible
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  JSON con schemas MCP
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  JSON con schemas MCP
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Type Safety
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Depende del stack (TS+OpenAPI)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Depende del stack (TS+MCP schemas)
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Depende del stack (TS+MCP schemas)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Error Handling
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  HTTP status codes estándar
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  MCP errors + HTTP errors
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">MCP errors</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Debugging
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  Excelente (DevTools, Postman)
                </td>
                <td className="px-6 py-4 text-sm text-red-600">
                  Complejo (múltiples capas)
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">Moderado</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Development Tools
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  Ecosistema maduro
                </td>
                <td className="px-6 py-4 text-sm text-red-600">Limitado</td>
                <td className="px-6 py-4 text-sm text-yellow-600">
                  En desarrollo
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Learning Curve
                </td>
                <td className="px-6 py-4 text-sm text-green-600">Baja</td>
                <td className="px-6 py-4 text-sm text-red-600">Alta</td>
                <td className="px-6 py-4 text-sm text-red-600">Muy Alta</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Infrastructure Cost
                </td>
                <td className="px-6 py-4 text-sm text-green-600">Bajo</td>
                <td className="px-6 py-4 text-sm text-red-600">
                  Alto (recursos duplicados)
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">Moderado</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Scalability
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  Probada a gran escala
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">
                  Cuello de botella en MCP
                </td>
                <td className="px-6 py-4 text-sm text-green-600">Buena</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Maintenance
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  Straightforward
                </td>
                <td className="px-6 py-4 text-sm text-red-600">
                  Complejo (dos servicios)
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">Moderado</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Standards Maturity
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  HTTP/REST maduros
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">
                  MCP spec en evolución
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">
                  MCP spec en evolución
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Real-time Support
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  WebSockets/SSE establecidos
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">
                  Depende de implementación
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">
                  Depende de implementación
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Bundle Size Impact
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  Mínimo (fetch nativo)
                </td>
                <td className="px-6 py-4 text-sm text-red-600">
                  MCP client library
                </td>
                <td className="px-6 py-4 text-sm text-red-600">
                  MCP client library
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Testing Ecosystem
                </td>
                <td className="px-6 py-4 text-sm text-green-600">
                  Herramientas maduras
                </td>
                <td className="px-6 py-4 text-sm text-red-600">
                  Mocking complejo
                </td>
                <td className="px-6 py-4 text-sm text-yellow-600">Moderado</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              REST API Directo
            </h3>
            <p className="text-sm text-green-700">
              <strong>Mejor para:</strong> Aplicaciones web tradicionales,
              performance crítico, equipos con experiencia REST, infraestructura
              establecida.
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              MCP + Servicio Externo
            </h3>
            <p className="text-sm text-red-700">
              <strong>Usar solo si:</strong> Ya tienes ecosistema MCP, necesitas
              reutilizar herramientas MCP existentes, prototipado específico.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              MCP con Lógica Integrada
            </h3>
            <p className="text-sm text-yellow-700">
              <strong>Considerar para:</strong> Experimentación con tool
              calling, integración futura con LLMs, control total del stack.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Nota Crítica para Investigación
          </h3>
          <p className="text-sm text-blue-700">
            MCP fue diseñado para interacciones LLM-to-service, no
            frontend-to-service. Para aplicaciones frontend convencionales, REST
            mantiene ventajas significativas en performance, madurez del
            ecosistema y simplicidad operacional.
          </p>
        </div>
      </div>
    </div>
  );
}

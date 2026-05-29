import { useEffect, useState } from "react";
import { MessageSquare, ExternalLink, RefreshCw } from "lucide-react";

export default function Connect() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const ravenUrl = `${window.location.origin}/raven`;

  useEffect(() => {
    // Set a timeout to hide loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(false);
    // Force iframe reload by changing key
    const iframe = document.getElementById('raven-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleOpenExternal = () => {
    window.open(ravenUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-dash-red" />
          <div>
            <h1 className="text-2xl font-bold text-dash-dark">Connect</h1>
            <p className="text-sm text-gray-600">Team messaging and collaboration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleOpenExternal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-dash-red rounded-lg hover:bg-red-700 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
            Open in New Tab
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center flex-1 bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-dash-red border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading Connect...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center flex-1 bg-gray-50">
          <div className="text-center max-w-md p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <MessageSquare className="h-8 w-8 text-dash-red" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Connect
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error loading the messaging interface. This could be because:
            </p>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li>• Raven app is not installed or not accessible</li>
              <li>• Your session may have expired</li>
              <li>• The iframe is blocked by security settings</li>
            </ul>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-dash-red rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={handleOpenExternal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Directly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Iframe Container */}
      <div className={`flex-1 relative ${loading || error ? 'hidden' : ''}`}>
        <iframe
          id="raven-iframe"
          src={ravenUrl}
          className="absolute inset-0 w-full h-full border-0"
          title="Raven Connect"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="clipboard-read; clipboard-write; microphone; camera"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}

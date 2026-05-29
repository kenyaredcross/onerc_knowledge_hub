import { Calendar, Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function NewEvent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // URL to Frappe Desk new Buzz Event form
  const eventFormUrl = "/app/buzz-event/new";

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
    // Force iframe reload
    const iframe = document.querySelector('iframe[title="Create Event"]') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleOpenExternal = () => {
    window.open(eventFormUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-dash-bg">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center flex-1 bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-dash-red border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading Event Form...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center flex-1 bg-gray-50">
          <div className="text-center max-w-md p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <Calendar className="h-8 w-8 text-dash-red" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Event Form
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error loading the event creation form. This could be because:
            </p>
            <ul className="text-left text-sm text-gray-500 mb-6 space-y-2">
              <li>• Buzz Event form is not accessible</li>
              <li>• Your session may have expired</li>
              <li>• The iframe is blocked by security settings</li>
            </ul>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-dash-red rounded-lg hover:bg-red-600 transition-colors"
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
          src={eventFormUrl}
          title="Create Event"
          className="absolute inset-0 w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allow="clipboard-read; clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}

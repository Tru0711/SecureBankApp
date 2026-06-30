import React from 'react';

// Receive Money module removed as part of navigation/security refactor.
// This file is kept as a stub to avoid import-time crashes if any legacy
// reference remains; the route has been removed from AppRouter.

export default function ReceiveMoneyPage() {
  return (
    <div className="p-4">
      <div className="alert alert-warning" role="alert">
        Receive Money is no longer available.
      </div>
    </div>
  );
}


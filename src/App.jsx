import { useState } from "react";

import { FloatingButton } from "./buttons/FloatingButton";

function App({ campaign_id }) {
  return (
    <div>
      <FloatingButton campaign_id={campaign_id} />
    </div>
  );
}

export default App;

import { useState } from "react";

import { FloatingButton } from "./buttons/FloatingButton";

function App({ campaign_id }) {
  return <FloatingButton campaign_id={campaign_id} />;
}

export default App;

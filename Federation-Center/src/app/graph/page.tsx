import { getVaultFiles } from "@/lib/vault";
import GraphOnlyClient from "./GraphOnlyClient";

export const dynamic = "force-dynamic";

export default function GraphPage() {
  const files = getVaultFiles();
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0f172a" }}>
      <GraphOnlyClient files={files} />
    </div>
  );
}

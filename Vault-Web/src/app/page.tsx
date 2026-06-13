import { getVaultFiles, getVaultFolders } from "@/lib/vault";
import VaultApp from "./VaultApp";

export const dynamic = "force-dynamic";

export default function Home() {
  const files = getVaultFiles();
  const folders = getVaultFolders();

  return <VaultApp files={files} folders={folders} />;
}

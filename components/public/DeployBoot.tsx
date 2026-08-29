import { DeployFreshness } from "@/components/public/DeployFreshness";
import { getDeployBootScript } from "@/lib/deploy-boot";
import { resolveDeployId } from "@/lib/deploy-id";

/** Site-wide deploy freshness — every route, including standalone editorial shells. */
export function DeployBoot() {
  const deployId = resolveDeployId();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: getDeployBootScript(deployId) }} />
      <DeployFreshness deployId={deployId} />
    </>
  );
}

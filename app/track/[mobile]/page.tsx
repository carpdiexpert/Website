import CustomerTracking from "./CustomerTracking";

// This dynamic tracking page reads its route params on the server and passes
// the token into the client component as a regular prop.
export const instant = false;

export default async function Page({
  params,
}: {
  params: Promise<{ mobile: string }>;
}) {
  const { mobile } = await params;

  return <CustomerTracking trackingToken={mobile} />;
}

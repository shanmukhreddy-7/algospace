import { notFound } from "next/navigation";
import { modules } from "@/lib/algorithms/metadata";
import { Lab } from "@/components/algoscope/Lab";
export default async function AlgorithmPage({
  params,
}: {
  params: Promise<{ algorithm: string }>;
}) {
  const { algorithm } = await params;
  const learningModule = modules.find((m) => m.slug === algorithm);
  if (!learningModule) notFound();
  return <Lab module={learningModule} />;
}

import { Lab } from "@/components/algoscope/Lab";
import { modules } from "@/lib/algorithms/metadata";
export default function Playground() {
  return <Lab module={modules[2]} playground />;
}

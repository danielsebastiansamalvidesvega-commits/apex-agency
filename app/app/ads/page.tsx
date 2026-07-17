import { ChatPanel } from "@/components/chat-panel";
import { getModule } from "@/lib/modules";

export default function AdsPage() {
  const m = getModule("ads");
  return (
    <ChatPanel
      moduleId={m.id}
      role={m.role}
      title={m.label}
      subtitle={m.description}
      starters={m.starters}
    />
  );
}

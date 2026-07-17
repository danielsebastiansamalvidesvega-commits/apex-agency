import { ChatPanel } from "@/components/chat-panel";
import { getModule } from "@/lib/modules";

export default function CodePage() {
  const m = getModule("code");
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

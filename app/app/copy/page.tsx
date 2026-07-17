import { ChatPanel } from "@/components/chat-panel";
import { getModule } from "@/lib/modules";

export default function CopyPage() {
  const m = getModule("copy");
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

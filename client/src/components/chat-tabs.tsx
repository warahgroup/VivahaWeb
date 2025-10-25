interface ChatTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "chat", label: "Chat" },
  { id: "notes", label: "Notes" },
  { id: "reminders", label: "Reminders" },
  { id: "confirmed", label: "Confirmed" },
  { id: "report", label: "Report" },
];

export function ChatTabs({ activeTab, onTabChange }: ChatTabsProps) {
  return (
    <div className="border-b bg-card sticky top-[57px] z-30">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-testid={`button-tab-${tab.id}`}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? "text-primary border-b-4 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id === "report" && (
                <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  Pro
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

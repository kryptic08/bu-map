export type ConversationMessageAction = {
  type: "view-floor-plan";
  destination: string;
  label: string;
  roomLabel?: string;
};

export type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  action?: ConversationMessageAction;
};

export type ConversationContext = {
  currentLocation?: string;
  destination?: string;
  isNavigating: boolean;
};

import React from "react";
import { useSelector } from "react-redux";

interface ActionProviderProps {
  createChatBotMessage: (message: string, options?: any) => any;
  setState: React.Dispatch<React.SetStateAction<any>>;
  children: React.ReactNode;
}
interface ChatbotType {
  answer: string;
  messages: string;
}
const ActionProvider: React.FC<ActionProviderProps> = ({
  createChatBotMessage,
  setState,
  children,
}) => {
  const chatbotData = useSelector((state: any) => state.chatbotData);
  const handleQA = (item: string) => {
    if (!item.trim()) {
      setState((prev: any) => ({
        ...prev,
        messages: [
          ...prev.messages,
          createChatBotMessage("메시지를 입력해주세요 😊"),
        ],
      }));
      return;
    }
    const botMessage = chatbotData.find((data: ChatbotType) => {
      if (data?.messages.includes(item)) {
        return data;
      }
    });

    setState((prev: ChatbotType) => ({
      ...prev,
      messages: [
        ...prev.messages,
        createChatBotMessage(
          botMessage?.answer || "죄송해요, 이해하지 못했어요 😢"
        ),
      ],
    }));
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            handleQA,
            setState,
            children,
          });
        }
      })}
    </div>
  );
};

export default ActionProvider;

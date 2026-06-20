import React, { useEffect } from "react";
import ActionProvider from "./ActionProvider";
import Chatbot from "react-chatbot-kit";
import MessageParser from "./MessageParser";
import "react-chatbot-kit/build/main.css";
import "./chatbot.css";
import config from "./config.js";
import Papa from "papaparse";
import { useDispatch } from "react-redux";
import { chatbotAdd } from "../../redux/reducers/chatbotList.js";

interface ChatbotItem {
  question: string;
  answer: string;
}
const ChatbotContainer: React.FC = () => {
  const dispatch = useDispatch();
  const loadQnA = async () => {
    const response = await fetch("/qna.csv");
    const text = await response.text();
    const { data } = Papa.parse<ChatbotItem>(text, { header: true });
    dispatch(chatbotAdd(data as ChatbotItem[]));
    return data;
  };
  useEffect(() => {
    loadQnA();
  }, []);

  return (
    <div
      role="region"
      aria-label="Chatbot"
      className="z-[999] min-h-[400px] w-full min-w-[400px] rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.3)]"
    >
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
        placeholderText="궁금한 내용을 입력해주세요"
        runInitialMessagesWithHistory
      ></Chatbot>
    </div>
  );
};
export default ChatbotContainer;

import React, { useEffect } from "react";
import styled from "styled-components";
import ActionProvider from "./ActionProvider";
import Chatbot from "react-chatbot-kit";
import MessageParser from "./MessageParser";
import "react-chatbot-kit/build/main.css";
import "./chatbot.css";
import config from "./config.js";
import Papa from "papaparse";
import { useDispatch } from "react-redux";
import { chatbotAdd } from "../../redex/reducers/chatbotList.js";

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
    <ChatbotWrapper>
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
        placeholderText="궁금한 내용을 입력해주세요"
        runInitialMessagesWithHistory
      ></Chatbot>
    </ChatbotWrapper>
  );
};
const ChatbotWrapper = styled.div`
  z-index: 999;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  width: 100%;
  min-width: 400px;
  min-height: 400px;
`;
export default ChatbotContainer;

import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  initialMessages: [
    createChatBotMessage(
      "안녕하세요! 올리브샵 챗봇입니다. \n무엇을 도와드릴까요?"
    ),
  ],
  botName: "조소연",
  customComponents: {
    botAvatar: () => null,
    userAvatar: () => null,
  },
};

export default config;

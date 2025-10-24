import React from "react";
interface MessageParserProps {
  children: React.ReactNode;
  actions: {
    handleQA: (message: string) => void;
  };
}
const MessageParser: React.FC<MessageParserProps> = ({ children, actions }) => {
  const parse = (message: string) => {
    // if (!message.trim()) {
    //   alert("메시지를 입력해주세요.");
    // }

    actions.handleQA(message);
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            parse,
            actions,
          });
        }
      })}
    </div>
  );
};

export default MessageParser;

import React from "react";

const MessageParser = ({ children, actions }) => {
  const parse = (message: string) => {
    // if (!message.trim()) {
    //   alert("메시지를 입력해주세요.");
    // }

    actions.handleQA(message);
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions,
        });
      })}
    </div>
  );
};

export default MessageParser;

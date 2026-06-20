import styled from "styled-components";

const ChatButton = () => {
  return (
    <Container
      role="button"
      aria-label="Open Chatbot"
      onClick={(event) => {
        event.preventDefault();
        window.open(
          `${window.location.origin}/chatbot`,
          "_blank",
          "width=400,height=405,min-width=400,min-height=405,left=1000,top=100,toolbar=no,menubar=no,scrollbars=no,resizable=no"
        );
      }}
    >
      <img
        role="img"
        src="https://kcucdvvligporsynuojc.supabase.co/storage/v1/object/sign/images/floating_open.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYTBjYzg1NC1jMWE5LTQ2MTktYTBiNy1iMTdmMGE2ZGE3MWIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvZmxvYXRpbmdfb3Blbi5wbmciLCJpYXQiOjE3NjE1NTE5MjUsImV4cCI6MTc5MzA4NzkyNX0.UQsk8tzy_EcEMqAOKuZgIcnm-H47qMzCQv7Ac8dPsQ4"
        alt="floating_open"
      />
    </Container>
  );
};
const Container = styled.div`
  position: fixed;
  right: calc((100vw - 1020px) / 2 - 210px); /* 왼쪽 여백 */
  width: 55px;
  height: 55px;
  bottom: 10px;
  cursor: pointer;
  border-radius: 50%;
`;
export default ChatButton;

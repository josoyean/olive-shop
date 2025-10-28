import styled from "styled-components";
const EmptyComponent = ({
  mainText = "",
  subText = "",
}: {
  mainText: string;
  subText: string;
}) => {
  return (
    <Component>
      <img
        src="https://kcucdvvligporsynuojc.supabase.co/storage/v1/object/public/images/shopping.png"
        alt="no_data"
      />
      <div>
        <p>{mainText}</p>
        <span dangerouslySetInnerHTML={{ __html: subText ?? "" }}></span>
      </div>
    </Component>
  );
};

export default EmptyComponent;
const Component = styled.div`
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  justify-content: center;
  row-gap: 30px;
  div {
    text-align: center;
  }

  img {
    width: 100px;
    height: 100px;
  }
  p {
    font-weight: 700;
    color: #131518;
    font-size: 20px;
    /* line-height: 29px; */
    margin-bottom: 3px;
  }
  span {
    color: #757d86;
    text-align: center;
    font-size: 16px;
    line-height: 22px;
  }
`;

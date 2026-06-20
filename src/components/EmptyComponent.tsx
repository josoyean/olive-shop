interface EmptyComponentProps {
  mainText?: string;
  subText?: string;
}

const EmptyComponent = ({
  mainText = "",
  subText = "",
}: EmptyComponentProps) => {
  return (
    <div
      className="flex h-[400px] flex-col content-center items-center justify-center gap-[30px]"
      role="status"
      aria-label="Empty State"
    >
      <img
        role="img"
        src="https://kcucdvvligporsynuojc.supabase.co/storage/v1/object/public/images/shopping.png"
        alt="no_data"
        className="h-[100px] w-[100px]"
      />
      <div role="group" className="text-center">
        <p className="mb-[3px] text-xl font-bold text-text-main">{mainText}</p>
        <span
          className="text-center text-base leading-[22px] text-[#757d86]"
          dangerouslySetInnerHTML={{ __html: subText ?? "" }}
        />
      </div>
    </div>
  );
};

export default EmptyComponent;

import React, { useState } from "react";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { useInterval } from "usehooks-ts";
import ObjectCardColumn from "../../components/card/ObjectCardColumn";
import type { CardImageType } from "../../components/card/card.type";
import { cn } from "@/lib/cn";

interface CommendObjectProps {
  title: string;
  style?: React.CSSProperties;
  data: CardImageType[];
}

const CommendObject: React.FC<CommendObjectProps> = (props) => {
  const { title, style, data } = props;
  const [imageIndex, setImageIndex] = useState<number>(0);

  useInterval(() => {
    setImageIndex((current) => (current + 1) % (data.length / 2));
  }, 10000);

  return (
    <div
      className={cn("w-1/2 border-b border-line-main")}
      style={style}
      role="region"
      aria-label={title}
    >
      <div className="py-5 [&>span]:float-right [&>span]:flex [&>span]:cursor-pointer [&>span]:items-center [&>span]:gap-[5px]">
        <h2>{title}</h2>
        <span
          onClick={() => {
            setImageIndex((current) => (current + 1) % (data.length / 2));
          }}
        >
          다른 상품보기 <RestartAltOutlinedIcon />
        </span>
        <div className="mt-10 flex flex-row justify-between">
          <ObjectCardColumn size="230px" data={data && data[imageIndex * 2]} />
          <ObjectCardColumn
            size="230px"
            data={
              data && !data[imageIndex * 2 + 1]
                ? data[0]
                : data[imageIndex * 2 + 1]
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CommendObject;

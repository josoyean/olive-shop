import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "redux/store";
import {
  addSearchText,
  deleteSearchText,
  allDeleteSearchText,
  saveToggle,
} from "../redux/reducers/userSearch";
import { X } from "lucide-react";

const Search = ({
  searchValue,
  setSearchValue,
}: {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const componentRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchData = useSelector((state: RootState) => state?.searchData);
  const [openedSearch, setOpenedSearch] = useState<boolean>(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      addSearchText({ save: searchData.save, searchValue: searchValue })
    );
    setOpenedSearch(false);
    navigate(`/store/search-main?getSearchValue=${searchValue}`);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node)
      ) {
        setOpenedSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [componentRef]);
  return (
    <div className="relative" role="search" aria-label="상품 검색">
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: 340,
          height: 40,
          borderRadius: "20px",
          boxShadow: "none",
          border: "2px solid #116dff",
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 2 }}
          placeholder="상품, 브랜드 검색"
          inputProps={{ "aria-label": "상품, 브랜드 검색" }}
          onChange={(event) => {
            setSearchValue(event.target.value);
          }}
          value={searchValue}
          onFocus={() => {
            setOpenedSearch(true);
          }}
        />
        <IconButton type="submit" sx={{ p: "10px" }}>
          <SearchIcon />
        </IconButton>
      </Paper>
      {openedSearch && (
        <div
          ref={componentRef}
          className="absolute left-0 top-[45px] z-[9999] w-[400px] rounded-[10px] border border-primary bg-white p-5 [&_h4]:border-b [&_h4]:border-[#888] [&_h4]:pb-[7px]"
        >
          <h4>최근 검색어</h4>
          <div className="h-[200px] [&>span]:mt-5 [&>span]:block [&>span]:cursor-pointer [&>span]:text-sm">
            {searchData?.save ? (
              searchData?.searchValue?.length > 0 ? (
                <div className="my-[15px] [&>div]:mb-0.5 [&>div]:flex [&>div]:items-center [&>div]:justify-between [&_em]:cursor-pointer [&_em]:text-base [&_span]:cursor-pointer">
                  {searchData?.searchValue?.map((item, index) => (
                    <div key={index}>
                      <span
                        onClick={() => {
                          navigate(`/store/search-main?getSearchValue=${item}`);
                          setSearchValue(item);
                          setOpenedSearch(false);
                        }}
                      >
                        {item}
                      </span>
                      <em
                        role="button"
                        aria-label="검색어 삭제"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (!searchData.save) return;
                          dispatch(
                            deleteSearchText({
                              save: searchData.save,
                              searchValue: item,
                            })
                          );
                          setOpenedSearch(false);
                        }}
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </em>
                    </div>
                  ))}
                </div>
              ) : (
                <span>최근 검색어가 없어요</span>
              )
            ) : (
              <span>검색어 저장 기능을 껐어요</span>
            )}
          </div>

          <div className="mt-2.5 [&_button]:mr-2.5 [&_button]:text-xs [&_button]:text-[#a7a7a7]">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                const confirmText = confirm(
                  "최근 검색어를 모두 삭제 하시겠습니까?"
                );
                if (confirmText) {
                  dispatch(
                    allDeleteSearchText({
                      save: searchData.save,
                      searchValue: "",
                    })
                  );
                }
              }}
            >
              전체 삭제
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                dispatch(
                  saveToggle({
                    save: searchData.save,
                    searchValue: "",
                  })
                );
              }}
            >
              검색어 저장 {searchData.save ? "끄기" : "켜기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;

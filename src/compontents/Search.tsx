import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "styled-components";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../public/assets/styles/theme";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "redex/store";
import {
  addSearchText,
  deleteSearchText,
  allDeleteSearchText,
  saveToggle,
} from "../redex/reducers/userSearch";
const Search = ({
  searchValue,
  setSearchValue,
}: {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const componentRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
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
        // 여기서 원하는 작업을 수행
        setOpenedSearch(false);
      }
    }
    // 마운트 시 document에 이벤트 리스너 추가
    document.addEventListener("mousedown", handleClickOutside);
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [componentRef]);
  return (
    <Container>
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
          border: `2px solid  ${theme.color.main}`,
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
          onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
            setOpenedSearch(true);
          }}
        />
        <IconButton type="submit" sx={{ p: "10px" }}>
          <SearchIcon />
        </IconButton>
      </Paper>
      {openedSearch && (
        <SearchContainer ref={componentRef}>
          <h4>최근 검색어</h4>
          <SearchBox>
            {searchData?.save ? (
              searchData?.searchValue?.length > 0 ? (
                <SearchLists>
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
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation(); // prevent
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
                        X
                      </em>
                    </div>
                  ))}
                </SearchLists>
              ) : (
                <span>최근 검색어가 없어요</span>
              )
            ) : (
              <span>검색어 저장 기능을 껐어요</span>
            )}
          </SearchBox>

          <ButtonBox>
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
          </ButtonBox>
        </SearchContainer>
      )}
    </Container>
  );
};

export default Search;
const ButtonBox = styled.div`
  margin-top: 10px;
  button {
    margin-right: 10px;
    font-size: 12px;
    color: #a7a7a7;
  }
`;
const Container = styled.div`
  position: relative;
`;

const SearchContainer = styled.div`
  padding: 20px 20px;
  border-radius: 10px;
  position: absolute;
  left: 0;
  top: 45px;
  z-index: 99;
  width: 400px;
  border: 1px solid ${theme.color.main};
  background-color: #fff;
  h4 {
    border-bottom: 1px solid #888;
    padding-bottom: 7px;
  }
`;
const SearchBox = styled.div`
  height: 200px;
  > span {
    cursor: pointer;
    font-size: 14px;
    display: block;
    margin-top: 20px;
  }
`;
const SearchLists = styled.div`
  margin: 15px 0;
  > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
    span {
      cursor: pointer;
    }
  }
  em {
    cursor: pointer;
    font-size: 16px;
  }
`;

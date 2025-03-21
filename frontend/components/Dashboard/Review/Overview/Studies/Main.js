import { useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { Dropdown, Checkbox } from "semantic-ui-react";

import Card from "./Card.js";

import { STUDIES_COLLECTING_DATA } from "../../../../Queries/Study.js";

function containsAny(arr1, arr2) {
  return arr1.some((item) => arr2.includes(item));
}

const sortOptions = [
  { label: "Oldest", value: "OLDEST" },
  { label: "Newest", value: "NEWEST" },
  { label: "Least comments", value: "LEAST_COMMENTS" },
  { label: "Most comments", value: "MOST_COMMENTS" },
];

export default function StudiesBoard({ allUniqueClassIds, myClassesIds }) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [filteredStudies, setFilteredStudies] = useState([]);
  const [showMyClassOnly, setShowMyClassOnly] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [filterSortMessage, setFilterSortMessage] = useState(
    "Showing all studies "
  );

  const { data, loading, error } = useQuery(STUDIES_COLLECTING_DATA, {
    variables: {
      classIds: allUniqueClassIds,
    },
  });

  const studies = data?.studies || [];

  // filter and sort proposals
  useEffect(() => {
    async function filterProposals() {
      const studiesFiltered = studies.filter((study) => {
        if (keyword || showMyClassOnly) {
          const isMatchingKeyword = study.title
            .toLowerCase()
            .includes(keyword.toLowerCase());

          // const isMatchingStatus =
          //   !status ||
          //   study.status === status ||
          //   (status === "FEATURED" && study?.featured);

          const isInMyClasses = containsAny(
            study?.classes?.map((cl) => cl?.id),
            myClassesIds
          );
          return isMatchingKeyword && isInMyClasses;
        } else {
          return true;
        }
      });
      if (sortBy) {
        // sort studies
        const studiesFilteredAndSorted = studiesFiltered.sort((a, b) => {
          if (sortBy === "OLDEST") {
            if (a.createdAt < b.createdAt) return -1;
            if (a.createdAt > b.createdAt) return 1;
          }
          if (sortBy === "NEWEST") {
            if (a.createdAt > b.createdAt) return -1;
            if (a.createdAt < b.createdAt) return 1;
          }

          if (sortBy === "LEAST_COMMENTS") {
            if (
              a?.reviews?.filter((r) => r?.stage === a?.status).length <
              b?.reviews?.filter((r) => r?.stage === b?.status).length
            )
              return -1;
            if (
              a?.reviews?.filter((r) => r?.stage === a?.status).length >
              b?.reviews?.filter((r) => r?.stage === b?.status).length
            )
              return 1;
          }

          if (sortBy === "MOST_COMMENTS") {
            if (
              a?.reviews?.filter((r) => r?.stage === a?.status).length >
              b?.reviews?.filter((r) => r?.stage === b?.status).length
            )
              return -1;
            if (
              a?.reviews?.filter((r) => r?.stage === a?.status).length <
              b?.reviews?.filter((r) => r?.stage === b?.status).length
            )
              return 1;
          }
        });
        setFilteredStudies(studiesFilteredAndSorted);
      } else {
        setFilteredStudies(studiesFiltered);
      }
    }
    filterProposals();
  }, [studies, keyword, status, showMyClassOnly, sortBy]);

  return (
    <div className="board">
      <div className="searchTopArea">
        <div className="searchArea">
          <input
            placeholder="Search"
            type="text"
            name="keyword"
            value={keyword}
            onChange={({ target }) => setKeyword(target.value)}
          />
        </div>

        <div>
          <Dropdown
            placeholder="Sort by"
            fluid
            selection
            options={sortOptions.map((p) => ({
              key: p.value,
              value: p.value,
              text: p.label,
            }))}
            onChange={(event, data) => {
              if (data?.value === "OLDEST") {
                setFilterSortMessage(`Sorting by: oldest to newest study`);
              }
              if (data?.value === "NEWEST") {
                setFilterSortMessage(`Sorting by: newest to oldest study`);
              }
              if (data?.value === "LEAST_COMMENTS") {
                setFilterSortMessage(`Sorting by: least to most comments`);
              }
              if (data?.value === "MOST_COMMENTS") {
                setFilterSortMessage(`Sorting by: most to least comments`);
              }
              setSortBy(data?.value);
            }}
            value={sortBy}
          />
        </div>
        <div className="checkboxArea">
          <Checkbox
            onChange={() => {
              if (!showMyClassOnly) {
                setFilterSortMessage(`Showing studies in my class`);
              } else {
                setFilterSortMessage(`Showing all studies`);
              }
              setShowMyClassOnly(!showMyClassOnly);
            }}
            checked={showMyClassOnly}
            label="Only show studies in my class"
          />
        </div>
      </div>

      <div className="p16_500">{filterSortMessage}</div>

      <div className="cardsArea">
        {filteredStudies.map((study) => (
          <Card study={study} />
        ))}
      </div>
    </div>
  );
}

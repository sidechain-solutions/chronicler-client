import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTransactions } from "../../utils/api";
import TitlePreview from "./TitlePreview";
import { showSearchTitles } from "../../config/config.json";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import Spinner from "../General/Spinner";

const acceptedTypes = { text: 101, files: 102 };

const ViewAccountTitles = props => {
  const [redirect, setRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  //const [titles, setTitles] = useState({ meta: { count: 0 }, data: [], links: {} });
  const [titles, setTitles] = useState({ });

  const senderId = props.match.params.id;
  const offset = props.match.params.offset ? parseInt(props.match.params.offset) : 0;
  const type = Object.keys(acceptedTypes).includes(props.match.params.type)
    ? props.match.params.type
    : "text";
  console.log(acceptedTypes[type]);

  const getPageResults = (pageOffset = offset) => {
    getTransactions({
      type: acceptedTypes[type],
      limit: showSearchTitles,
      offset: pageOffset,
      senderId,
      sort: "timestamp:desc"
    })
      .then(res => {
        setTitles(res);
        setIsLoading(false);
        if (res.length === 0) {
          goBack();
        }
      })
      .catch(err => {
        setIsLoading(false);
        goBack();
      });
  };

  const goBack = () => {
    setTimeout(() => {
      setRedirect(true);
    }, 3000);
  };

  useEffect(() => {
    setIsLoading(true);
    getPageResults();
  }, [props.match.params.offset]);

  const PaginationButton = ({ direction }) => {
    let buttonComponent;

    if (direction === "previous") {
      const isDisabled = offset < showSearchTitles;

      buttonComponent = isDisabled ? (
        <button className="btn btn-lg btn-outline-primary mt-4 mb-5 mr-3" disabled>
          <FontAwesomeIcon icon="arrow-left" />
        </button>
      ) : (
        <Link
          to={`/view/account/${senderId}/${type}/${offset - showSearchTitles}`}
          className="btn btn-lg btn-outline-primary mt-4 mb-5 mr-3"
        >
          <FontAwesomeIcon icon="arrow-left" />
        </Link>
      );
    } else if (direction === "next") {
      const isDisabled = titles.length - offset < showSearchTitles;

      buttonComponent = isDisabled ? (
        <button className="btn btn-lg btn-outline-primary mt-4 mb-5" disabled>
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      ) : (
        <Link
          to={`/view/account/${senderId}/${type}/${offset + showSearchTitles}`}
          className="btn btn-lg btn-outline-primary mt-4 mb-5"
        >
          <FontAwesomeIcon icon="arrow-right" />
        </Link>
      );
    }

    return buttonComponent;
  };

  return (
    <div className="animated fadeIn">
      <h1 className="text-white mb-5">
        Account Archive: <br />
        <Link to={`/view/account/${senderId}`}>
          <strong>{senderId}</strong>
        </Link>
      </h1>

      {titles.length > 0 &&
        titles.map(title => (
          <TitlePreview key={title.id} data={title} type={type}></TitlePreview>
        ))}

      {isLoading && (
        <h1 className="mt-5 mb-5">
          <Spinner />
        </h1>
      )}

      {!isLoading && titles.length > 0 && (
        <>
          <p className="text-white">
            Viewing <strong>{type === "text" ? "text" : "file"}</strong> archives {offset + 1}-
            {showSearchTitles < titles.length ? offset + showSearchTitles : titles.length}{" "}
            of {titles.length}
          </p>
          <PaginationButton direction="previous" />
          <PaginationButton direction="next" />
        </>
      )}

      {titles.length === 0 && !isLoading && (
        <p className="text-white">No results found. Automatically returning in 3 seconds...</p>
      )}

      {redirect && <Redirect to={`/view/account/${senderId}`} />}
    </div>
  );
};

export default ViewAccountTitles;
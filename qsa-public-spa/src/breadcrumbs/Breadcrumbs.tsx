import React from "react";

const Breadcrumbs: React.FC = () => {
  return (
    <nav id="qg-breadcrumb" role="navigation" aria-label="breadcrumb navigation" aria-labelledby="breadcrumb-heading" className="collapse">
      <h2 id="breadcrumb-heading" className="qg-visually-hidden">You are here:</h2>
      <ol className="list-inline">
        <li id="qldGov">
          <a href="http://www.qld.gov.au/" target="_blank">Queensland Government home</a>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
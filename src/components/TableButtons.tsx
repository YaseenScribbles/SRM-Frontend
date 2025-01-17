import React from "react";

type Props = {
  edit?: boolean;
  editFunction?: () => void;
  pdf?: boolean;
  pdfURL?: string;
};

const TableButtons: React.FC<Props> = ({ edit, editFunction, pdf, pdfURL }) => {
  const isAndroid = /Android/i.test(navigator.userAgent);

  const handlePdfClick = () => {
    if (pdfURL) {
      if (isAndroid) {
        // Open in the same tab for Android devices
        window.open(pdfURL, "_self");
      } else {
        // Open in a new tab for non-Android devices
        window.open(pdfURL, "_blank");
      }
    }
  };

  return (
    <div className="table-buttons">
      {edit && (
        <svg className="edit" onClick={editFunction}>
          <use xlinkHref="/icons/sprite.svg#icon-new-message"></use>
        </svg>
      )}
      {pdf && pdfURL && (
        <svg className="pdf" onClick={handlePdfClick}>
          <use xlinkHref="/icons/sprite.svg#icon-file-text"></use>
        </svg>
      )}
    </div>
  );
};

export default TableButtons;

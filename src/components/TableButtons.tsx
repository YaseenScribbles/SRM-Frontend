import React from "react";

type Props = {
  edit?: boolean;
  editFunction?: () => void;
  pdf?: boolean;
  downloadPDF?: () => void;
  email?: boolean;
  sendEmail?: () => void;
  rights?: boolean;
  rightsFunction?: () => void;
};

const TableButtons: React.FC<Props> = ({
  edit,
  editFunction,
  pdf,
  downloadPDF,
  email,
  sendEmail,
  rights,
  rightsFunction
}) => {
  // const isAndroid = /Android/i.test(navigator.userAgent);

  // const handlePdfClick = () => {
  //   if (pdfURL) {
  //     if (isAndroid) {
  //       // Open in the same tab for Android devices
  //       window.open(pdfURL, "_self");
  //     } else {
  //       // Open in a new tab for non-Android devices
  //       window.open(pdfURL, "_blank");
  //     }
  //   }
  // };

  return (
    <div className="table-buttons">
      {edit && (
        <svg className="edit" onClick={editFunction}>
          <use xlinkHref="/icons/sprite.svg#icon-new-message"></use>
        </svg>
      )}
      {pdf && (
        <svg className="pdf" onClick={downloadPDF}>
          <use xlinkHref="/icons/sprite.svg#icon-file-text"></use>
        </svg>
      )}
      {email && (
        <svg className="pdf" onClick={sendEmail}>
          <use xlinkHref="/icons/sprite.svg#icon-mail"></use>
        </svg>
      )}
      {rights && (
        <svg className="pdf" onClick={rightsFunction}>
          <use xlinkHref="/icons/sprite.svg#icon-cog"></use>
        </svg>
      )}
    </div>
  );
};

export default TableButtons;

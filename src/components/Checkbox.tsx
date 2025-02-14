import React, { ChangeEvent } from "react";

type Props = {
  name: string;
  labelText?: string;
  value: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Checkbox: React.FC<Props> = ({
  name,
  labelText,
  value,
  handleChange,
}) => {
  return (
    <>
      <input
        type="checkbox"
        name={name}
        id={name}
        onChange={handleChange}
        className="checkbox"
        checked={value}
      />
      <label htmlFor={name}>
        <div className="custom-checkbox">
          <svg className="check-icon">
            <use xlinkHref="/icons/sprite.svg#icon-check"></use>
          </svg>
        </div>
        {labelText && <span>{labelText}</span>}
      </label>
    </>
  );
};

export default Checkbox;
